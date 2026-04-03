# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Build static export to out/
npm run deploy     # Build and deploy to GitHub Pages (prod branch)
npm run lint       # Run ESLint
```

## Architecture

This is a French daily menu rating app — a static Next.js site (App Router, `output: "export"`) deployed to GitHub Pages under `/menu`.

**Key config:**
- `next.config.ts`: `basePath: "/menu"`, `assetPrefix: "/menu/"`, `images.unoptimized: true` — required for GitHub Pages hosting
- Deployed via `gh-pages` to the `prod` branch; the `dev` branch is the integration branch

**Main files:**
- `app/page.tsx` — all application logic: state management, star ratings, lock mechanism, and carousel-based category display (Starter/Dish/Dessert)
- `app/navbar.tsx` — bottom tab bar with Framer Motion animated bubble indicator; controls the `react-slick` carousel via a forwarded ref
- `components/ui.tsx` — generic Card/Button primitives (currently not used by main page)

**State & data:**
- No backend or auth. Firebase is installed but not wired up.
- All state is in-memory React (`useState`); no persistence beyond what you add.
- Git history shows localStorage was explored as a fallback ("can use local storage if there is no database").

**UI stack:** Tailwind CSS v4 (`@import "tailwindcss"` in globals.css), Framer Motion for animations, Lucide React for icons, react-slick for the swipeable carousel.

**Dark mode:** detected from `window.matchMedia('(prefers-color-scheme: dark)')` at runtime — no manual toggle.
