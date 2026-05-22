<div align="center">
  <img width=100% src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:00aaff,100:00aaff&text=A%20O%20I&fontColor=ffffff&fontSize=50&fontAlignY=40" alt="AOI">
</div>

<h1 align="center">🔹 あおい — Web 🔹</h1>

<p align="center"> 
  A browser-based typing test, powered by AOI. 
  <br>
  Practice your typing, relax and vibe with aoi — now in your browser.
</p>

<div align="center">

  <img src="https://img.shields.io/badge/Bun-1.3-000?style=flat-square&logo=bun" alt="Bun" href="https://bun.sh">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React" href="https://react.dev">
  <img src="https://img.shields.io/badge/Tailwind-4-0ea5e9?style=flat-square&logo=tailwindcss" alt="Tailwind" href="https://tailwindcss.com">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" href="https://www.typescriptlang.org">
  <img src="https://img.shields.io/badge/License-Apache_2.0-00aaff?style=flat-square" alt="License" href="LICENSE">
  <br>
  <a href="https://www.buymeacoffee.com/aelxand" target="_blank">
    <img width=120px src="assets/bmc/bmc.png" alt="Buy Me A Coffee">
  </a>
</div>

## What is Aoi Web?

AOI is a terminal-based typing test built with Go and Bubble Tea. This project brings AOI to the browser, starting with a WASM-powered terminal experience and evolving into a native React web application.

Choose 4 different modes of typing practice:
- **Zen**: Type infinitely at your own pace
- **Timed**: Race against the clock
- **Count**: Type a fixed number of words
- **Quote**: Type a random quote

## Installation

### Prerequisites

- Bun 1.3+ (runtime and package manager)

### Setup

```bash
# Install dependencies
bun install

# Start development server with HMR
bun dev

# Production build
bun run build.ts

# Production server
bun start
```

The server runs on `http://localhost:3000` by default.

### Quick Commands

```bash
bun dev          # Start dev server with hot reloading
bun start        # Run production server
bun run build.ts # Build to dist/
```

### Port Conflicts

If port 3000 is in use:
```bash
lsof -ti:3000 | xargs kill -9
```

## Architecture

- **Server**: `src/index.ts` (Bun.serve, port 3000)
- **Browser entry**: `src/frontend.tsx` (React 19 root)
- **Main component**: `src/App.tsx`
- **Styling**: Tailwind v4 via `bun-plugin-tailwind`
- **Path alias**: `@/*` → `./src/*`

### AOI Integration

- **Integration plan**: [docs/web-integration.md](docs/web-integration.md)
- **WASM setup guide**: [docs/wasm-setup.md](docs/wasm-setup.md)

## Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Frontend | React 19 |
| Styling | Tailwind v4 |
| Language | TypeScript |
| Build | Bun.build |

## Roadmap

### Phase A — WASM + xterm.js MVP
- [ ] WASM build pipeline for aoi
- [ ] xterm.js integration in React
- [ ] Landing page → terminal transition
- [ ] Filesystem virtualization (words/quotes/config)
- [ ] MVP live on landing page

### Phase B — Native React Reimplementation
- [ ] Port typing engine to TypeScript
- [ ] Port word/quote system
- [ ] Port config to localStorage
- [ ] Build React screen components
- [ ] Swap xterm.js → native React UI
- [ ] Remove WASM/xterm.js dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0

<div align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&duration=1&color=00AAFF&center=true&vCenter=true&repeat=false&width=435&lines=stay+blue+%3C3" alt="Typing SVG" />
  </a>
</div>

<img width=100% src="https://capsule-render.vercel.app/api?type=slice&height=300&color=00aaff&text=AOI&section=footer&fontAlign=22&fontAlignY=69&rotate=19&fontSize=50&fontColor=ffffff&desc=あおい&descAlignY=80&descAlign=22" alt="AOI">
