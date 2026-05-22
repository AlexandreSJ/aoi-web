import {
  CharState,
  GameMode,
  DEFAULT_TIMED_SECONDS,
  DEFAULT_WORD_COUNT,
  TypedChar,
  TextLine,
  TypingState,
  Config,
} from "./types";
import { sampleWords } from "./words";
import { randomQuote } from "./quotes";

export function createTypingState(cfg: Config): TypingState {
  return {
    mode: GameMode.Zen,
    wordListName: "en",
    timedSeconds: DEFAULT_TIMED_SECONDS,
    wordCountTarget: DEFAULT_WORD_COUNT,

    chars: [],
    cursor: 0,
    scrollOffset: 0,
    finished: false,
    error: "",

    lastWord: "",
    lastKey: "",
    lastKeyError: false,
    lastKeyFlash: false,
    errorCount: 0,
    trimmedOk: 0,
    trimmedErr: 0,

    timeRemaining: DEFAULT_TIMED_SECONDS,
    timerRunning: false,

    charTimestamps: [],
    startTime: 0,
    showStats: true,
    charLimit: 50,
  };
}

export function setChars(state: TypingState, raw: string): TypingState {
  const chars: TypedChar[] = [];
  for (const c of raw) {
    chars.push({ char: c, state: CharState.Pending });
  }
  return { ...state, chars, cursor: 0, scrollOffset: 0 };
}

export function computeLines(chars: TypedChar[], availWidth: number): TextLine[] {
  if (availWidth < 1 || chars.length === 0) return [];

  interface WordBound {
    start: number;
    end: number;
  }

  const boundaries: WordBound[] = [];
  let i = 0;
  while (i < chars.length) {
    const start = i;
    while (i < chars.length && chars[i].char !== " ") {
      i++;
    }
    let end = i;
    if (i < chars.length && chars[i].char === " ") {
      end = i + 1;
      i++;
    }
    boundaries.push({ start, end });
  }

  const lines: TextLine[] = [];
  let lineStart = 0;
  let lineWidth = 0;

  for (const w of boundaries) {
    const wordWidth = w.end - w.start;
    if (lineWidth > 0 && lineWidth + wordWidth > availWidth) {
      lines.push({ start: lineStart, end: w.start });
      lineStart = w.start;
      lineWidth = 0;
    }
    lineWidth += wordWidth;
  }

  if (lineStart < chars.length) {
    lines.push({ start: lineStart, end: chars.length });
  }

  return lines;
}

export function cursorLineIdx(cursor: number, lines: TextLine[]): number {
  for (let i = 0; i < lines.length; i++) {
    if (cursor >= lines[i].start && cursor < lines[i].end) {
      return i;
    }
  }
  return lines.length > 0 ? lines.length - 1 : 0;
}

export function adjustScroll(state: TypingState): TypingState {
  const lines = computeLines(state.chars, state.charLimit);
  if (lines.length === 0) return state;

  const cursorLine = cursorLineIdx(state.cursor, lines);

  let scrollOffset = cursorLine;
  if (cursorLine > 0) {
    scrollOffset = cursorLine - 1;
  }
  if (scrollOffset < 0) {
    scrollOffset = 0;
  }

  return { ...state, scrollOffset };
}

export function trimCompleted(state: TypingState): TypingState {
  const lines = computeLines(state.chars, state.charLimit);
  if (lines.length < 3) return state;

  const cursorLine = cursorLineIdx(state.cursor, lines);
  if (cursorLine < 2) return state;

  const trimLineIdx = cursorLine - 1;
  const trimCount = lines[trimLineIdx].start;
  if (trimCount <= 0) return state;

  let trimmedOk = state.trimmedOk;
  let trimmedErr = state.trimmedErr;

  for (let i = 0; i < trimCount; i++) {
    switch (state.chars[i].state) {
      case CharState.Correct:
        trimmedOk++;
        break;
      case CharState.Error:
        trimmedErr++;
        break;
    }
  }

  return {
    ...state,
    chars: state.chars.slice(trimCount),
    cursor: state.cursor - trimCount,
    scrollOffset: 0,
    trimmedOk,
    trimmedErr,
  };
}

export function handleBackspace(state: TypingState): TypingState {
  if (
    state.cursor < state.chars.length &&
    state.chars[state.cursor].state === CharState.Error
  ) {
    const next = { ...state };
    next.chars = state.chars.map((c, i) =>
      i === state.cursor ? { ...c, state: CharState.Pending } : c,
    );
    next.errorCount--;
    return adjustScroll(next);
  }

  if (state.cursor <= 0) return state;

  const prevChar = state.chars[state.cursor - 1];
  let errorCount = state.errorCount;
  if (prevChar.state === CharState.Error) {
    errorCount--;
  }

  const next = {
    ...state,
    cursor: state.cursor - 1,
    errorCount,
  };
  next.chars = state.chars.map((c, i) =>
    i === state.cursor - 1 ? { ...c, state: CharState.Pending } : c,
  );
  return adjustScroll(next);
}

export function handleDeleteWord(state: TypingState): TypingState {
  if (state.cursor <= 0) return state;

  let chars = [...state.chars.map((c) => ({ ...c }))];
  let cursor = state.cursor;
  let errorCount = state.errorCount;

  if (cursor < chars.length && chars[cursor].state === CharState.Error) {
    chars[cursor] = { ...chars[cursor], state: CharState.Pending };
    errorCount--;
  }

  while (cursor > 0 && chars[cursor - 1].char === " ") {
    cursor--;
    if (chars[cursor].state === CharState.Error) {
      errorCount--;
    }
    chars[cursor] = { ...chars[cursor], state: CharState.Pending };
  }

  while (cursor > 0 && chars[cursor - 1].char !== " ") {
    cursor--;
    if (chars[cursor].state === CharState.Error) {
      errorCount--;
    }
    chars[cursor] = { ...chars[cursor], state: CharState.Pending };
  }

  return adjustScroll({ ...state, chars, cursor, errorCount });
}

export function handleSkipRow(state: TypingState): TypingState {
  const lines = computeLines(state.chars, state.charLimit);
  if (lines.length === 0) return state;

  const cursorLine = cursorLineIdx(state.cursor, lines);

  let newCursor: number;
  if (cursorLine + 1 < lines.length) {
    newCursor = lines[cursorLine + 1].start;
  } else {
    newCursor = lines[cursorLine].end;
  }

  let next = { ...state, cursor: newCursor };

  if (state.mode === GameMode.Zen || state.mode === GameMode.Timed) {
    next = ensureBufferRows(next);
  }

  next = adjustScroll(next);
  next = trimCompleted(next);
  return next;
}

export function handleChar(state: TypingState, input: string): TypingState {
  if (state.cursor >= state.chars.length) return state;

  let lastKey = input;
  let lastKeyError = false;
  let errorCount = state.errorCount;
  let chars = state.chars.map((c) => ({ ...c }));
  let cursor = state.cursor;
  let finished = state.finished;
  let charTimestamps = [...state.charTimestamps];
  let startTime = state.startTime;
  let timerRunning = state.timerRunning;
  let timeRemaining = state.timeRemaining;

  if (startTime === 0) {
    startTime = Date.now();
  }

  const expected = chars[cursor].char;

  if (input === expected) {
    if (chars[cursor].state !== CharState.Error) {
      chars[cursor] = { ...chars[cursor], state: CharState.Correct };
      charTimestamps.push(Date.now());
    }
    lastKeyError = false;
    cursor++;
  } else {
    if (chars[cursor].state !== CharState.Error) {
      errorCount++;
    }
    chars[cursor] = { ...chars[cursor], state: CharState.Error };
    lastKeyError = true;
  }

  let nextState: TypingState = {
    ...state,
    chars,
    cursor,
    finished,
    errorCount,
    charTimestamps,
    startTime,
    lastKey,
    lastKeyError,
    timerRunning,
    timeRemaining,
  };

  if (
    state.mode === GameMode.Zen ||
    state.mode === GameMode.Timed
  ) {
    nextState = ensureBufferRows(nextState);
  }

  if (state.mode === GameMode.Zen && cursor >= chars.length) {
    nextState.finished = true;
  }
  if (state.mode === GameMode.Count && cursor >= chars.length) {
    nextState.finished = true;
  }
  if (state.mode === GameMode.Quote && cursor >= chars.length) {
    nextState.finished = true;
  }

  nextState = adjustScroll(nextState);
  nextState = trimCompleted(nextState);
  return nextState;
}

export function correctCount(state: TypingState): number {
  let n = state.trimmedOk;
  for (const c of state.chars) {
    if (c.state === CharState.Correct) n++;
  }
  return n;
}

export function totalErrors(state: TypingState): number {
  return state.trimmedErr + state.errorCount;
}

export function wpm(state: TypingState): number {
  if (state.startTime === 0) return 0;

  let elapsedMs: number;
  if (state.mode === GameMode.Timed) {
    elapsedMs = (state.timedSeconds - state.timeRemaining) * 1000;
  } else {
    elapsedMs = Date.now() - state.startTime;
  }

  if (elapsedMs < 1000) return 0;

  let charsInWindow: number;
  let seconds: number;

  if (state.mode === GameMode.Timed) {
    charsInWindow = correctCount(state);
    seconds = (state.timedSeconds - state.timeRemaining);
    if (seconds <= 0) seconds = 1;
  } else {
    const fiveSecondsAgo = Date.now() - 5000;
    charsInWindow = 0;
    for (const ts of state.charTimestamps) {
      if (ts > fiveSecondsAgo) charsInWindow++;
    }
    if (charsInWindow === 0) return 0;
    seconds = 5;
  }

  const result = (charsInWindow / 5) * (60 / seconds);
  return Math.min(result, 9999.99);
}

export function precision(state: TypingState): number {
  const ok = correctCount(state);
  const total = ok + state.trimmedErr + state.errorCount;
  if (total === 0) return 0;
  const p = (ok / total) * 100;
  return Math.min(p, 9999.99);
}

export function lineWidth(state: TypingState): number {
  return state.charLimit;
}

export function wordsPerRow(width: number): number {
  const availWidth = Math.max(1, width - 8);
  return Math.max(1, Math.floor(availWidth / 5));
}

export function sampleWordsForMode(
  words: string[],
  count: number,
): string[] {
  return sampleWords(words, count);
}

export function ensureBufferRows(state: TypingState): TypingState {
  if (!state.lastWord) return state;
  return state;
}

export function tick(state: TypingState): TypingState {
  if (!state.timerRunning) return state;

  const timeRemaining = state.timeRemaining - 1;
  if (timeRemaining <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      finished: true,
      timerRunning: false,
    };
  }
  return { ...state, timeRemaining };
}

export interface TypingInit {
  mode: GameMode;
  wordListName: string;
  timedSeconds: number;
  wordCountTarget: number;
  words: string[];
  quotes: string[];
  width: number;
  cfg: Config;
}

export function initTyping(init: TypingInit): TypingState {
  let state = createTypingState(init.cfg);
  state.mode = init.mode;
  state.wordListName = init.wordListName;
  state.timedSeconds = init.timedSeconds;
  state.timeRemaining = init.timedSeconds;
  state.wordCountTarget = init.wordCountTarget;
  state.charLimit = init.cfg.state.textSize || 50;

  switch (init.mode) {
    case GameMode.Count: {
      const ws = sampleWords(init.words, init.wordCountTarget);
      state.lastWord = ws[ws.length - 1];
      state = setChars(state, ws.join(" "));
      break;
    }
    case GameMode.Quote: {
      const q = randomQuote(init.quotes);
      state = setChars(state, q);
      break;
    }
    default: {
      const perRow = wordsPerRow(init.width);
      const ws = sampleWords(init.words, perRow * 4);
      state.lastWord = ws[ws.length - 1];
      state = setChars(state, ws.join(" "));
      break;
    }
  }

  state = adjustScroll(state);
  return state;
}