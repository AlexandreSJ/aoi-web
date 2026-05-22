import { useEffect, useState, useCallback } from "react";
import { FallingLeaves } from "./FallingLeaves";
import { HomeScreen } from "./screens/HomeScreen";
import { GameScreen } from "./screens/TypingScreen";
import { GameMode } from "./engine/types";
import "./index.css";

export function App() {
  const [phase, setPhase] = useState<"landing" | "home" | "typing">("landing");
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Zen);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const trigger = useCallback(() => {
    if (phase !== "landing") return;
    setPhase("home");
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "landing") {
        e.preventDefault();
        trigger();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, trigger]);

  useEffect(() => {
    const onClick = () => {
      if (phase === "landing") trigger();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [phase, trigger]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  if (phase === "landing") {
    return (
      <div className="landing-container">
        <FallingLeaves />
        <div className="center-content">
          <h1 className="aoi-text">AOI</h1>
          <p className="type-any-key">Type any key</p>
        </div>
        <button
          className="fullscreen-btn fullscreen-btn-hidden"
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          aria-label="Fullscreen"
        >
          ⛶
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <FallingLeaves />
      <div className="app-header">
        <h1 className="aoi-title-compact">A O I</h1>
        <button
          className="fullscreen-btn fullscreen-btn-header"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
        >
          {isFullscreen ? "✕" : "⛶"}
        </button>
      </div>
      <div className="app-body">
        {phase === "home" ? (
          <HomeScreen
            onStart={(mode) => {
              setGameMode(mode);
              setPhase("typing");
            }}
          />
        ) : (
          <GameScreen
            initialMode={gameMode}
            onEsc={() => setPhase("landing")}
          />
        )}
      </div>
    </div>
  );
}

export default App;