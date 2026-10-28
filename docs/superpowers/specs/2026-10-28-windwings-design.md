# WINDWINGS portfolio rebuild

The user-provided visual specification authorizes implementation and deployment on main.

Use React 18, TypeScript, Vite, Tailwind 3, Framer Motion 12 and Lucide. Keep the five-section sequence: full-height Hero, two-row scroll Marquee, character-reveal About, white numbered Services, dark sticky Projects. Append contact information within the Projects section. Base URL is `/windwings-website/`.

Reusable animation components: FadeIn (motion.create, whileInView), Magnet (150px activation padding, strength 3), AnimatedText (character opacity tied to scroll), gradient ContactButton and outlined LiveProjectButton. Respect reduced motion and touch input. Project buttons open accessible native dialogs with existing films; the concert placeholder presents its status instead of passing borrowed footage off as a finished case.

Preserve all original media, Markdown, CSV and JSON files; archive the original HTML. Download the 21 supplied GIFs and four decoration images, falling back to the supplied URLs on failure. The portrait remains a clearly documented temporary reference asset. Reused case crops are identified in captions and the README.

The complete reference prompt/code is not in the provided materials; implement the stated layout/class names and standard sticky math `1 - (count - index) * 0.05`, record the timing choices, and avoid claiming an exact source-level match.

Delivery requires a successful local build, asset/base-path checks, main commit, non-force push, successful GitHub Pages workflow, and an HTTP readback of the deployed build.
