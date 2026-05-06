# Cask Finance — Frontend

Landing page for [Cask Finance](https://t.me/caskfinance).

> A stablecoin that fights for its peg.

## Stack

- Next.js 15 (App Router, server components)
- React 19
- Fraunces (display) + Inter (body) via `next/font/google`
- Pure CSS modules — no Tailwind, no UI lib

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Deploy

Configured for Vercel out of the box (`vercel.json`). Push to `main` and connect the repo in Vercel.

## Structure

```
app/
  page.tsx           landing page (server component)
  page.module.css    landing-only styles
  layout.tsx         root layout, fonts, metadata
  globals.css        resets + base styles
public/              static assets
```

---

Early access on [Telegram](https://t.me/caskfinance).
