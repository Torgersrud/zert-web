# AGENTS.md

Guidance for AI agents working in this repository.

## What this repo is

The marketing landing page for **Zert** (zert.no) — a Norwegian company offering Norwegian sovereign VMs for secure AI development. It is a **pure static site**: no build step, no bundler, no dependencies, no package manager.

```
index.html   # Entire page (single-page site, Norwegian content)
style.css    # All styles, design tokens in :root
scripts.js   # Vanilla ES5-style JS (IIFE, 'use strict'), no frameworks
DESIGN.md    # Brand/design guidelines (Norwegian) — authoritative for look & tone
static/      # Images (logos, photos, .webp/.png)
zert-demo-spec.md  # Demo spec — currently NOT in effect, ignore unless told otherwise
```

To preview locally, serve the folder statically (e.g. `python3 -m http.server`) and open `index.html`. There is no lint/test/build tooling — verify changes by rendering the page.

## Hard rules

1. **All user-facing copy is Norwegian bokmål.** Use «KI», never «AI». Keep sentences short, active, and factual — no hype, no exaggeration.
2. **Never use emojis.** Anywhere. In copy, comments, or commit messages.
4. **Typography: IBM Plex Sans** for text, **IBM Plex Mono** for terminal/code. Distinguish heading levels by weight, not by font. Fallbacks: Arial/Helvetica. Do not introduce new fonts.
6. **Tone:** calm, precise, self-assured. Sage + Creator archetype. Only promise what can be delivered; be transparent.

## Structure & conventions

- Images live in `static/`, referenced with relative paths (`static/…`). Prefer `.webp`. All imagery should be Norwegian/society-relevant per `DESIGN.md`.
- Meta/OG tags in `<head>` use absolute `https://zert.no/` URLs — update them if page title or description changes.

## Working style

- Read `DESIGN.md` before making visual or copy decisions; it is the source of truth for brand rules.
- Match existing patterns in `style.css` (BEM-ish flat class names, tokens for all colors/fonts) and `scripts.js` (single IIFE, `var`, plain DOM APIs).
- Keep diffs minimal and consistent with the single-file, zero-dependency architecture.
- Git history is small and clean; write concise imperative commit messages, no emojis.
- Push to github https://github.com/Torgersrud/zert-web continously as you solve tickets
