import { Config, DEFAULT_CONFIG } from "./types";

const STORAGE_KEY = "aoi-config";

export function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return applyDefaults({ ...DEFAULT_CONFIG });
    const parsed = JSON.parse(raw);
    return applyDefaults(parsed);
  } catch {
    return applyDefaults({ ...DEFAULT_CONFIG });
  }
}

export function saveConfig(cfg: Config): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

export function applyDefaults(cfg: Config): Config {
  const d = DEFAULT_CONFIG;
  return {
    colors: {
      primary: cfg.colors?.primary || d.colors.primary,
      secondary: cfg.colors?.secondary || d.colors.secondary,
      text: cfg.colors?.text || d.colors.text,
      dim: cfg.colors?.dim || d.colors.dim,
      title: cfg.colors?.title || d.colors.title,
      footer: cfg.colors?.footer || d.colors.footer,
      error: cfg.colors?.error || d.colors.error,
      success: cfg.colors?.success || d.colors.success,
    },
    ui: {
      cursor: cfg.ui?.cursor || d.ui.cursor,
      keyFlash: cfg.ui?.keyFlash || d.ui.keyFlash,
    },
    state: {
      mode: cfg.state?.mode || d.state.mode,
      timedSeconds: cfg.state?.timedSeconds || d.state.timedSeconds,
      wordCount: cfg.state?.wordCount || d.state.wordCount,
      lastWordsFile: cfg.state?.lastWordsFile || "",
      lastQuoteFile: cfg.state?.lastQuoteFile || "",
      textSize: cfg.state?.textSize || d.state.textSize,
    },
  };
}

export function stateModeToIdx(mode: string): number {
  switch (mode) {
    case "timed": return 1;
    case "count": return 2;
    case "quote": return 3;
    default: return 0;
  }
}

export function stateIdxToMode(idx: number): string {
  switch (idx) {
    case 1: return "timed";
    case 2: return "count";
    case 3: return "quote";
    default: return "zen";
  }
}

export function isColorKey(key: string): boolean {
  return key.startsWith("colors.");
}

export function isToggleKey(key: string): boolean {
  return key === "ui.cursor" || key === "ui.keyFlash";
}

export function getConfigValue(cfg: Config, key: string): string {
  const parts = key.split(".");
  let obj: Record<string, unknown> = cfg as unknown as Record<string, unknown>;
  for (const part of parts) {
    if (obj == null || typeof obj !== "object") return "";
    obj = obj[part] as Record<string, unknown>;
  }
  return typeof obj === "string" ? obj : String(obj ?? "");
}

export function setConfigValue(cfg: Config, key: string, value: string): Config {
  const next = structuredClone(cfg);
  const parts = key.split(".");
  let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]] as Record<string, unknown>;
  }
  obj[parts[parts.length - 1]] = value;
  return next;
}

export function toggleConfigValue(cfg: Config, key: string): Config {
  const val = getConfigValue(cfg, key);
  return setConfigValue(cfg, key, val === "on" ? "off" : "on");
}

export function cursorOn(cfg: Config): boolean {
  return cfg.ui.cursor !== "off";
}

export function keyFlashOn(cfg: Config): boolean {
  return cfg.ui.keyFlash !== "off";
}

export function saveState(
  cfg: Config,
  modeIdx: number,
  timedSeconds: number,
  wordCount: number,
  lastFile: string,
  isQuote: boolean,
): Config {
  const next = structuredClone(cfg);
  next.state.mode = stateIdxToMode(modeIdx);
  next.state.timedSeconds = timedSeconds;
  next.state.wordCount = wordCount;
  if (isQuote) {
    next.state.lastQuoteFile = lastFile;
  } else {
    next.state.lastWordsFile = lastFile;
  }
  saveConfig(next);
  return next;
}

export const CONFIG_SECTIONS = [
  {
    title: "Colors",
    keys: [
      "colors.primary", "colors.secondary", "colors.text", "colors.dim",
      "colors.title", "colors.footer", "colors.error", "colors.success",
    ],
  },
  {
    title: "UI",
    keys: ["ui.cursor", "ui.keyFlash"],
  },
];