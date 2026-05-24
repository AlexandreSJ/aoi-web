import { useEffect, useCallback, useRef, useState } from "react";
import {
  TypingState,
  GameMode,
  GameMode as GM,
  MODE_NAMES,
  CharState,
} from "@/engine/types";
import {
  initTyping,
  handleChar,
  handleBackspace,
  handleDeleteWord,
  tick,
  correctCount,
  totalErrors,
  wpm,
  precision,
  computeLines,
  cursorLineIdx,
  setChars,
} from "@/engine/typing";
import { loadWordList } from "@/engine/words";
import { loadQuoteList } from "@/engine/quotes";
import { loadConfig } from "@/engine/config";
import { DEFAULT_TIMED_SECONDS, DEFAULT_WORD_COUNT } from "@/engine/types";

interface TypingScreenProps {
  state: TypingState;
  flashIdx: number | null;
  flashError: boolean;
  charLimit: number;
}

export function TypingScreen({ state, flashIdx, flashError, charLimit }: TypingScreenProps) {
  const lines = computeLines(state.chars, charLimit);
  const cursorLine = lines.length > 0 ? cursorLineIdx(state.cursor, lines) : 0;

  const TEXT_WINDOW = 3;
  const startLine = cursorLine > 0 ? cursorLine - 1 : 0;
  const endLine = Math.min(lines.length, startLine + TEXT_WINDOW);

  const ok = correctCount(state);
  const errs = totalErrors(state);
  const currentWpm = wpm(state);
  const currentPrec = precision(state);

  const modeLabel =
    state.mode === GM.Timed
      ? `Timed ${state.timeRemaining}s`
      : state.mode === GM.Count
        ? `Count ${state.wordCountTarget}`
        : MODE_NAMES[state.mode];

  const status = state.finished ? "done" : state.cursor > 0 ? "typing" : "ready";

  return (
    <div className="typing-screen">
      <div className="typing-text-area">
        {lines.length === 0 && (
          <div className="typing-loading">Loading...</div>
        )}
        {Array.from({ length: endLine - startLine }).map((_, li) => {
          const lineIdx = startLine + li;
          const line = lines[lineIdx];
          return (
            <div key={lineIdx} className="typing-line">
              {Array.from({ length: line.end - line.start }).map((_, ci) => {
                const charIdx = line.start + ci;
                const ch = state.chars[charIdx];
                if (!ch) return null;
                const isCursor = charIdx === state.cursor;

                let className = "typing-char";
                const isFlash = charIdx === flashIdx;
                if (isFlash) {
                  className += flashError ? " char-flash-error" : " char-flash-correct";
                } else if (isCursor && ch.state === CharState.Error)
                  className += " char-error-cursor";
                else if (isCursor && ch.state === CharState.Correct)
                  className += " char-correct-cursor";
                else if (isCursor) className += " char-pending-cursor";
                else if (ch.state === CharState.Correct)
                  className +=
                    lineIdx < cursorLine
                      ? " char-correct-dim"
                      : " char-correct";
                else if (ch.state === CharState.Error)
                  className +=
                    lineIdx < cursorLine
                      ? " char-error-dim"
                      : " char-error";
                else className += " char-pending";

                let display = ch.char;
                if (ch.char === " " && ch.state === CharState.Error)
                  display = "\u00b7";

                return (
                  <span key={charIdx} className={className}>
                    {display}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {state.showStats && (
        <div className="typing-stats">
          {currentWpm.toFixed(2)} wpm | {currentPrec.toFixed(2)}% prec
        </div>
      )}

      <div className="typing-footer">
        <span>
          {modeLabel} | {state.wordListName}
        </span>
        <span>
          {ok} ok / {errs} err
        </span>
        <span>{status}</span>
        <span>tab: {state.showStats ? "hide" : "show"}</span>
        <span>enter: restart</span>
        <span>ctrl+c: back</span>
      </div>

      {state.error && <div className="typing-error">{state.error}</div>}
    </div>
  );
}

interface GameScreenProps {
  initialMode: GameMode;
  onEsc: () => void;
}

export function GameScreen({ initialMode, onEsc }: GameScreenProps) {
  const [words, setWords] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [typingState, setTypingState] = useState<TypingState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [flashError, setFlashError] = useState(false);
  const [charLimit, setCharLimit] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const measure = () => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const availWidth = el.clientWidth - padding;
      const charWidth = fontSize * 0.6;
      const chars = Math.floor(availWidth / charWidth);
      setCharLimit(Math.max(20, Math.min(50, chars)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [loaded]);

  useEffect(() => {
    setTypingState((prev) => prev ? { ...prev, charLimit } : prev);
  }, [charLimit]);

  useEffect(() => {
    async function load() {
      const wl = await loadWordList("en");
      const ql = await loadQuoteList("en");
      setWords(wl.words);
      setQuotes(ql.quotes);
      const cfg = loadConfig();
      const initState = initTyping({
        mode: initialMode,
        wordListName: "en",
        timedSeconds: cfg.state.timedSeconds || DEFAULT_TIMED_SECONDS,
        wordCountTarget: cfg.state.wordCount || DEFAULT_WORD_COUNT,
        words: wl.words,
        quotes: ql.quotes,
        width: 400,
        cfg,
      });
      setTypingState({ ...initState, charLimit });
      setLoaded(true);
    }
    load();
  }, [initialMode]);

  useEffect(() => {
    if (!typingState) return;
    if (typingState.mode === GameMode.Timed && typingState.timerRunning && !typingState.finished) {
      timerRef.current = setInterval(() => {
        setTypingState((prev) => (prev ? tick(prev) : prev));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [typingState?.timerRunning, typingState?.finished]);

  const keyHandledRef = useRef(false);

  const processChar = useCallback(
    (input: string, prev: TypingState) => {
      let result = handleChar(prev, input);
      if (
        prev.mode === GameMode.Timed &&
        !prev.timerRunning &&
        !prev.finished
      ) {
        result = { ...result, timerRunning: true };
      }
      const isError = result.cursor > 0 && result.chars[result.cursor - 1]?.state === CharState.Error;
      setFlashIdx(result.cursor - 1);
      setFlashError(isError);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setFlashIdx(null);
      }, 150);
      return result;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!typingState || !loaded) return;
      keyHandledRef.current = false;

      setTypingState((prev) => {
        if (!prev) return prev;
        let next = { ...prev };

        if (e.key === "Escape" || (e.ctrlKey && e.key === "c")) {
          e.preventDefault();
          onEsc();
          return prev;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          if (prev.finished) {
            const cfg = loadConfig();
            return initTyping({
              mode: initialMode,
              wordListName: prev.wordListName,
              timedSeconds: cfg.state.timedSeconds || DEFAULT_TIMED_SECONDS,
              wordCountTarget: cfg.state.wordCount || DEFAULT_WORD_COUNT,
              words,
              quotes,
              width: Math.max(64, window.innerWidth),
              cfg,
            });
          }
          return prev;
        }

        if (prev.finished) return prev;

        if (e.key === "Tab") {
          e.preventDefault();
          return { ...prev, showStats: !prev.showStats };
        }

        if (e.key === "Backspace") {
          e.preventDefault();
          return handleBackspace(next);
        }

        if (e.ctrlKey && (e.key === "w" || e.key === "h")) {
          e.preventDefault();
          return handleDeleteWord(next);
        }
        if (e.altKey && e.key === "Backspace") {
          e.preventDefault();
          return handleDeleteWord(next);
        }

        if (e.key === " " || e.key.length === 1) {
          e.preventDefault();
          const input = e.key === " " ? " " : e.key;
          keyHandledRef.current = true;
          return processChar(input, next);
        }

        return prev;
      });
    },
    [typingState, loaded, initialMode, words, quotes, onEsc, processChar],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!typingState || !loaded) return;
      const value = e.target.value;
      if (!value) return;
      if (keyHandledRef.current) {
        e.target.value = "";
        return;
      }
      setTypingState((prev) => {
        if (!prev || prev.finished) return prev;
        let result = prev;
        for (const ch of value) {
          result = processChar(ch, result);
        }
        return result;
      });
      e.target.value = "";
    },
    [typingState, loaded, processChar],
  );

  const handleScreenTouch = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    if (document.activeElement === input) {
      input.blur();
    } else {
      input.focus();
    }
  }, []);

  if (!loaded || !typingState) {
    return <div className="typing-loading">Loading...</div>;
  }

  return (
    <div
      className="game-screen"
      tabIndex={0}
      ref={(el) => { containerRef.current = el; }}
      onTouchEnd={handleScreenTouch}
      onClick={handleScreenTouch}
    >
      <input
        ref={inputRef}
        className="mobile-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
        onKeyDown={handleKeyDown}
        onChange={handleInput}
      />
      <TypingScreen state={typingState} flashIdx={flashIdx} flashError={flashError} charLimit={charLimit} />
    </div>
  );
}