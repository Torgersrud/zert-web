# AGENTS.md — zert.no webpage

**This folder is for developing the zert webpage only — https://zert.no.**

Nothing else lives here. Do not add, copy, or modify code belonging to any
other part of the zert sandbox system in this directory.

## Scope

In scope:

- The marketing/product webpage served at https://zert.no
- Its assets, styling, content, and build/deploy config for the page itself

Out of scope (lives elsewhere, see `~/AGENTS.md`):

| Thing | Location |
|---|---|
| Customer API server (FastAPI, public.py :8001) | `~/dev` |
| Go customer CLI | `~/zert` |
| Operator tooling (zert-admin, webapp) | `~/test` |
| E2B sandbox stack | `~/e2b` |
| Homebrew tap | `~/homebrew-zert` |
| Documentation center | `~/opencodeDocs` |

## Rules

- Changes here must only affect the https://zert.no webpage.
- If a task touches the API, CLI, sandbox stack, or operator tooling, stop and
  point it at the right directory instead — don't do it here.
- Don't put secrets, API keys, or `E2B_API_KEY` in the page or its build files;
  the webpage is publicly served.
