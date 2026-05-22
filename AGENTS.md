# aoi-web

## Commands
- `bun dev` — start dev server with HMR (`bun --hot src/index.ts`)
- `bun start` — production server (`NODE_ENV=production bun src/index.ts`)
- `bun run build.ts` — build to `dist/` (Bun.build with tailwind plugin)

## Architecture
- **Server entry**: `src/index.ts` (Bun.serve, default port 3000)
- **Browser entry**: `src/frontend.tsx` (React 19 root)
- **Main component**: `src/App.tsx`
- **Tailwind v4** via `bun-plugin-tailwind` — no PostCSS config needed, imported in `src/index.css`

## Stack
Bun runtime, React 19, Tailwind v4, TypeScript (bundler moduleResolution, noEmit)

## AOI Integration
- **Source TUI**: `/home/aelxand/workspace/git/tui/aoi` (Go + Bubble Tea)
- **Integration plan**: `docs/web-integration.md`
- **WASM setup**: `docs/wasm-setup.md`
- **Phase A**: WASM + xterm.js MVP (terminal in browser)
- **Phase B**: Native React reimplementation (port typing engine to TypeScript)
- **AOI architecture**: Elm Architecture via Bubble Tea; screens = Home/Config/FileSelect/Typing; core engine in `internal/ui/typing.go`
- **WASM build**: `GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o aoi.wasm ./cmd/aoi-wasm/` (from /aoi dir)
- **WASM runtime**: `wasm_exec.js` from `$(go env GOROOT)/lib/wasm/`

## Notes
- No test, lint, or typecheck scripts configured
- Path alias: `@/*` → `./src/*`
- Port 3000; kill with `lsof -ti:3000 | xargs kill -9` if stuck
- Landing page: gradient bg (#00aaff → white), falling leaves canvas, "AOI" text with fade-in, "Type any key" prompt
