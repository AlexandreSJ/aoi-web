# Engine: AOI Typing Test (TypeScript Port)

This directory contains the pure-logic TypeScript port of the AOI typing test engine, originally written in Go.

## Source

Ported from: `github.com/AlexandreSJ/aoi` — **v0.3.2**

## Version

**v0.3.2** — matches the Go TUI feature set at tag `v0.3.2`

## Features (ported from Go TUI)

### Typing Engine (`typing.ts`)
- Character state tracking: pending, correct, error
- Word-boundary line wrapping (`computeLines`)
- Scroll offset tracking (`adjustScroll`)
- Completed-line trimming (`trimCompleted`) — scrolls off finished text
- WPM calculation with rolling 5-second window
- Precision (accuracy) percentage
- Backspace, delete-word (Ctrl+W/Ctrl+Backspace), skip-row (↓/j at line start)
- Timed mode with countdown timer
- Word count mode with fixed target
- Quote mode with random quote text
- Infinite (zen) mode with auto-generated text
- Character limit adjustment (←/→ keys)
- Key flash display with last-pressed key
- Error space rendering (middle dot `·` for mistyped spaces)

### Game Modes (`modes.ts`)
- **Zen** — type infinitely at your own pace
- **Timed** — race against the clock (5–300 seconds)
- **Count** — type a fixed number of words (5–500)
- **Quote** — type a random quote

### Word List System (`words.ts`)
- Load from bundled data files (`/data/words/en.txt`)
- Parse with comment support (`#` lines ignored)
- Random sampling without adjacent duplicates
- Infinite word generation

### Quote System (`quotes.ts`)
- Load from bundled data files (`/data/quotes/en.txt`)
- Random quote selection
- Same parse format as words (comment support)

### Config System (`config.ts`)
- localStorage persistence (replaces YAML)
- Default values matching Go defaults
- ANSI 256-color theming
- Toggle settings (cursor, key flash)
- State persistence (last mode, timed seconds, word count, last file)

### Theme Validation (`theme.ts`)
- Validate hex colors (`#RGB`, `#RRGGBB`)
- Validate ANSI 256-color numbers (0–255)
- Validate named CSS colors

## Porting Map

| Go file | TS file | Ported |
|---------|---------|--------|
| `internal/ui/typing.go` | `typing.ts` | ✅ |
| `internal/ui/home.go` (modes) | `modes.ts` | ✅ |
| `internal/ui/app.go` (state routing) | React only | — |
| `internal/ui/config.go` | React + `config.ts` | ✅ (logic) |
| `internal/ui/fileselect.go` | React only | — |
| `internal/ui/styles.go` (constants) | `config.ts` | ✅ (defaults) |
| `internal/config/config.go` | `config.ts` | ✅ |
| `internal/words/words.go` | `words.ts` | ✅ |
| `internal/quotes/quotes.go` | `quotes.ts` | ✅ |
| `internal/theme/validate.go` | `theme.ts` | ✅ |

## Design Principles

- **Pure logic**: No React imports, no DOM access, no side effects in the engine
- **Immutable updates**: Typing engine returns new state on each action
- **Testable**: All functions are pure and can be unit tested
- **Type-safe**: Full TypeScript types for all game state