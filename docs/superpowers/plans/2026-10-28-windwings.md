# WINDWINGS implementation plan

**Goal:** Ship the specified portfolio to the existing GitHub Pages URL.
**Architecture:** Static React sections with shared motion primitives and typed project data. Vite bundles existing local case media; downloaded reference assets live under public/assets.
**Tech Stack:** Vite, React 18, TypeScript, Tailwind 3, Framer Motion 12, Lucide.

1. [x] Inspect repository, pull main, inventory media and Pages settings.
2. [ ] Create Vite configuration, shared components and five sections; preserve source documents and media.
3. [ ] Download references, mark missing/reused imagery, connect project dialogs and contact links.
4. [ ] Run `npm install`, `npm run build`, `npm run check`; inspect responsive layout and interactions where browser tools are available.
5. [ ] Commit on main, configure Pages workflow, push without force, verify deployed HTML and assets.

File map: `src/components/` owns motion, buttons, resilient images and project dialog; `src/sections/` owns the five page sections; `src/data.ts` owns projects/services; `src/index.css` owns visual tokens and responsive layout; `.github/workflows/deploy.yml` builds and deploys dist. `scripts/check-site.mjs` checks all built local references, title, base path, source media preservation and published copy boundaries.
