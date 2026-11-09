# Brand system + Chinese locale — changelog

Date: 2026-11-09 (Asia/Shanghai)

## Gaps fixed

| Before | After (brand skill) |
| --- | --- |
| Canvas `#0C0C0C` | `--ink #171819` |
| Accent purple / multi-stop gradient CTAs | Brand orange `#FF5900`; CTA deep `#26110A` + ember radial |
| Text `#D7E2EA` | `--text #F4F4F2`, `--muted #8A8C8E` |
| Font Kanit (Google) | Geist + Geist Mono via CDN; Chinese system stack fallback (not claimed as embedded) |
| Focus / selection purple | Steel focus ring; brand selection |
| Header in-hero, ~112px, not sticky | Sticky blurred header ~62px, max-width 1400px, pad 40/20 |
| Card `box-shadow` | Removed; raise surface + hairline `--line` |
| Shell ~1440 / 4vw | `--shell 1400px`, `--pad-x 40px` (20px ≤900px) |
| Brand wording mixed | Always 「风翮 / windwings」; never treat 「风人院」 as company brand |
| English-only chrome | `en` / `zh` locale switch + `localStorage` |

Tokens / gradients wired in `:root` and Tailwind: ink, brand, deep, raise, text, muted, steel, mid-warm/cool, line, brand-on-light, `--g-ember|steel|peach|mist`.

## How to enter Chinese

1. Open the site (hash routes unchanged: `#/`, `#about`, `#services`, `#projects`, `#contact`).
2. In the sticky header, use the **EN | 中文** control (right side, before the orange capsule CTA).
3. Choice persists in `localStorage` key `windwings-locale` (`en` | `zh`).
4. `document.documentElement.lang` becomes `zh-CN` or `en`; document title switches accordingly.
5. No separate Chinese URL/hash is required (GitHub Pages + hash-friendly).

## Files touched

- `index.html` — theme-color, Geist CDN links, title/meta
- `tailwind.config.js` — brand palette + Geist / Chinese stacks + editorial screen
- `src/index.css` — full token rewrite, header, CTA, contrast, reduced-motion
- `src/i18n.tsx` — **new** LocaleProvider, messages, `useI18n`
- `src/App.tsx` — provider + shared Header
- `src/components/Header.tsx` — **new** sticky header + lang switch + orange capsule
- `src/components/Buttons.tsx` — i18n + brand CTA styles
- `src/components/ProjectDialog.tsx` — i18n strings
- `src/sections/Hero.tsx` — header removed (moved up); i18n
- `src/sections/About.tsx` — i18n; EN keeps Chinese studio line
- `src/sections/Services.tsx` — i18n title/label swap; raise surface
- `src/sections/Marquee.tsx` — i18n labels
- `src/sections/Projects.tsx` — i18n chrome + deep CTA band
- `CHANGELOG-BRAND.md` — this file

Unchanged on purpose: `src/data.ts` project facts, asset paths, `public/` references, framer-motion interactions.

## Build result

```
npm run build  →  tsc -b && vite build  PASS
```

(2026-11-09 Asia/Shanghai). Missing `public/` assets may 404 at runtime; paths left intact as instructed.

## Remaining TODOs

- Replace temporary reference portrait with a real windwings studio photo (`src/data.ts`).
- Replace borrowed / crop placeholders in projects (marked in `data.ts`).
- Confirm `public/` favicon and marquee remote/local assets on Mac before go-live.
- Optional: add hash query `?lang=zh` sync if marketing needs shareable Chinese links.
- Geist is loaded from cdnfonts CDN — if mainland latency is poor, self-host woff under `public/fonts/` later (still do not claim “embedded” until then).
- Visual QA on live Pages after push; do not invent clients / awards / new portfolio items.
