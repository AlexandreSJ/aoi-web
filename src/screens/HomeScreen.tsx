import { GameMode, MODE_NAMES, MODE_DESCRIPTIONS, DEFAULT_TIMED_SECONDS, DEFAULT_WORD_COUNT } from "@/engine/types";
import { GameScreen } from "./TypingScreen";
import { loadConfig, saveState } from "@/engine/config";
import { useState } from "react";

interface HomeScreenProps {
  onStart: (mode: GameMode) => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  const cfg = loadConfig();
  const [modeIdx, setModeIdx] = useState(() => {
    const m = cfg.state.mode;
    if (m === "timed") return GameMode.Timed;
    if (m === "count") return GameMode.Count;
    if (m === "quote") return GameMode.Quote;
    return GameMode.Zen;
  });
  const [timedSeconds, setTimedSeconds] = useState(
    cfg.state.timedSeconds || DEFAULT_TIMED_SECONDS,
  );
  const [wordCount, setWordCount] = useState(
    cfg.state.wordCount || DEFAULT_WORD_COUNT,
  );
  const [configInput, setConfigInput] = useState("");
  const [started, setStarted] = useState(false);

  const selectedMode = modeIdx as GameMode;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setStarted(true);
      const cfg2 = loadConfig();
      saveState(cfg2, modeIdx, timedSeconds, wordCount, "en", modeIdx === GameMode.Quote);
      onStart(selectedMode);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "h") {
      setModeIdx((m) => Math.max(0, m - 1));
      setConfigInput("");
      return;
    }
    if (e.key === "ArrowRight" || e.key === "l") {
      setModeIdx((m) => Math.min(MODE_NAMES.length - 1, m + 1));
      setConfigInput("");
      return;
    }
    if (e.key === "ArrowUp" || e.key === "k") {
      setConfigInput("");
      if (selectedMode === GameMode.Timed) {
        setTimedSeconds((s) => Math.min(300, s + 5));
      } else if (selectedMode === GameMode.Count) {
        setWordCount((c) => Math.min(500, c + 5));
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "j") {
      setConfigInput("");
      if (selectedMode === GameMode.Timed) {
        setTimedSeconds((s) => Math.max(5, s - 5));
      } else if (selectedMode === GameMode.Count) {
        setWordCount((c) => Math.max(5, c - 5));
      }
      return;
    }
    if (e.key === "Backspace" && configInput.length > 0) {
      const next = configInput.slice(0, -1);
      setConfigInput(next);
      if (next === "") {
        if (selectedMode === GameMode.Timed) setTimedSeconds(DEFAULT_TIMED_SECONDS);
        if (selectedMode === GameMode.Count) setWordCount(DEFAULT_WORD_COUNT);
      } else {
        const n = parseInt(next, 10);
        if (!isNaN(n)) {
          if (selectedMode === GameMode.Timed) setTimedSeconds(Math.max(5, Math.min(300, n)));
          if (selectedMode === GameMode.Count) setWordCount(Math.max(5, Math.min(500, n)));
        }
      }
      return;
    }
    if (e.key.length === 1 && (selectedMode === GameMode.Timed || selectedMode === GameMode.Count)) {
      const n = parseInt(e.key, 10);
      if (!isNaN(n) || e.key === "0") {
        const next = configInput + e.key;
        setConfigInput(next);
        const val = parseInt(next, 10);
        if (!isNaN(val)) {
          if (selectedMode === GameMode.Timed) setTimedSeconds(Math.max(5, Math.min(300, val)));
          if (selectedMode === GameMode.Count) setWordCount(Math.max(5, Math.min(500, val)));
        }
      }
    }
  }

  const modeLabel =
    selectedMode === GameMode.Timed
      ? `Timed ${timedSeconds}s`
      : selectedMode === GameMode.Count
        ? `Count ${wordCount}`
        : MODE_NAMES[selectedMode];

  return (
    <div
      className="home-screen"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={(el) => el?.focus()}
    >
      <div className="home-modes">
        {MODE_NAMES.map((name, i) => (
          <span
            key={name}
            className={i === modeIdx ? "mode-active" : "mode-inactive"}
          >
            {i === modeIdx ? `[${modeLabel}]` : name}
          </span>
        ))}
      </div>
      <div className="home-description">
        {MODE_DESCRIPTIONS[modeIdx]}
      </div>
      {(selectedMode === GameMode.Timed || selectedMode === GameMode.Count) && (
        <div className="home-config-hint">
          Press ↑/↓ or type a number to adjust
        </div>
      )}
      {(selectedMode != GameMode.Timed && selectedMode != GameMode.Count) && (
        <div className="home-config-hint">
          &nbsp;
        </div>
      )}
      <div className="home-actions">
        Press <span className="key-hint">enter</span> to start typing
      </div>
      <div className="home-footer-hint">
        ←/→: mode &nbsp;·&nbsp; esc: back
      </div>
    </div>
  );
}