export const enum CharState {
  Pending = 0,
  Correct = 1,
  Error = 2,
}

export const enum GameMode {
  Zen = 0,
  Timed = 1,
  Count = 2,
  Quote = 3,
}

export const MODE_NAMES: readonly string[] = ["Zen", "Timed", "Count", "Quote"] as const;

export const MODE_DESCRIPTIONS: readonly string[] = [
  "Type infinitely at your own pace",
  "Race against the clock",
  "Type a fixed number of words",
  "Type a random quote",
] as const;

export const MODE_COUNT_TOTAL = 4;

export const DEFAULT_TIMED_SECONDS = 30;
export const DEFAULT_WORD_COUNT = 25;

export interface TypedChar {
  char: string;
  state: CharState;
}

export interface TextLine {
  start: number;
  end: number;
}

export interface TypingState {
  mode: GameMode;
  wordListName: string;
  timedSeconds: number;
  wordCountTarget: number;

  chars: TypedChar[];
  cursor: number;
  scrollOffset: number;
  finished: boolean;
  error: string;

  lastWord: string;
  lastKey: string;
  lastKeyError: boolean;
  lastKeyFlash: boolean;
  errorCount: number;
  trimmedOk: number;
  trimmedErr: number;

  timeRemaining: number;
  timerRunning: boolean;

  charTimestamps: number[];
  startTime: number;
  showStats: boolean;
  charLimit: number;
}

export interface Config {
  colors: Colors;
  ui: UIConfig;
  state: StateConfig;
}

export interface Colors {
  primary: string;
  secondary: string;
  text: string;
  dim: string;
  title: string;
  footer: string;
  error: string;
  success: string;
}

export interface UIConfig {
  cursor: string;
  keyFlash: string;
}

export interface StateConfig {
  mode: string;
  timedSeconds: number;
  wordCount: number;
  lastWordsFile: string;
  lastQuoteFile: string;
  textSize: number;
}

export interface Layout {
  width: number;
  height: number;
}

export const FALLBACK_COLORS: Colors = {
  primary: "#00aaff",
  secondary: "#0055dd",
  text: "#ffffff",
  dim: "#666666",
  title: "#003366",
  footer: "#003366",
  error: "#e04060",
  success: "#5090d0",
};

export const DEFAULT_CONFIG: Config = {
  colors: { ...FALLBACK_COLORS },
  ui: { cursor: "on", keyFlash: "on" },
  state: {
    mode: "zen",
    timedSeconds: 30,
    wordCount: 25,
    lastWordsFile: "",
    lastQuoteFile: "",
    textSize: 100,
  },
};