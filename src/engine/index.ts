export { CharState, GameMode, MODE_NAMES, MODE_DESCRIPTIONS, MODE_COUNT_TOTAL, DEFAULT_TIMED_SECONDS, DEFAULT_WORD_COUNT } from "./types";
export type { TypedChar, TextLine, TypingState, Config as TypingConfig, Colors, UIConfig, StateConfig, Layout } from "./types";

export {
  createTypingState,
  setChars,
  computeLines,
  cursorLineIdx,
  adjustScroll,
  trimCompleted,
  handleBackspace,
  handleDeleteWord,
  handleSkipRow,
  handleChar,
  correctCount,
  totalErrors,
  wpm,
  precision,
  lineWidth,
  wordsPerRow,
  tick,
  initTyping,
} from "./typing";

export type { TypingInit } from "./typing";

export { loadWordList, availableWordLists, sampleWords } from "./words";
export type { WordList } from "./words";

export { loadQuoteList, randomQuote } from "./quotes";
export type { QuoteList } from "./quotes";

export {
  loadConfig,
  saveConfig,
  applyDefaults,
  stateModeToIdx,
  stateIdxToMode,
  isColorKey,
  isToggleKey,
  getConfigValue,
  setConfigValue,
  toggleConfigValue,
  cursorOn,
  keyFlashOn,
  saveState,
  CONFIG_SECTIONS,
} from "./config";

export { isValidColor } from "./theme";
export { FALLBACK_COLORS, DEFAULT_CONFIG } from "./types";