# Core Surge / Tower Game Agent Notes

## Project identity

- Project: Core Surge / Tower Game
- GitHub repo: `mcrdminted-jpg/Core-Surge`
- Primary working folder: `C:\Users\admin\OneDrive - Atlas Home Services\Tower Mobile App Game`
- Do not continue gameplay or content work in `tower-game-git` as a separate divergent copy
- When git work is needed, reconcile from the primary working folder back into the repo instead of letting the two folders drift

## Git account rule

- For this project, use Git account: `MCRDminted`
- Do not push this repo with other GitHub identities
- If git auth resolves to a different account, stop and fix auth before pushing

## Deployment intent

- Web testing path: push repo updates so the connected web host can deploy for browser testing
- Current live tester host: `https://core-surge.pages.dev/`
- Old host `tower-game-3k2.pages.dev` is stale and should not be treated as production or tester truth
- Native billing tests still require Android and iPhone app builds

---

## ⚠ AGENT LANE RULES — READ BEFORE EVERY COMMIT

Two AI agents work on this repo simultaneously. To prevent overwrites,
each agent is restricted to specific files. **Never edit files outside
your lane.** Always `git pull` before starting work.

### Codex (OpenAI) — ART & ASSETS LANE

Codex may ONLY touch:

- `assets/**` — all image/art/sprite files
- `dist/assets/**` — built copies of assets
- `sessions.md` — session log

Codex must **NEVER** edit:

- `js/*.js` (data.js, ui.js, save.js, game.js, render.js, tournament.js)
- `css/*.css` (menu.css, game.css, etc.)
- `index.html`
- `scripts/*.js` (build.js, test.js, serve.js)
- `package.json`
- `dist/js/*`, `dist/css/*`, `dist/index.html`, `dist/service-worker.js`

If Codex needs a CSS change for new art (e.g. a background-image URL),
it must document the needed change in `sessions.md` and let Claude Code
apply it.

### Claude Code — UI, GAMEPLAY & BUILD LANE

Claude Code may touch:

- `js/*.js` — all game logic, UI, data, save
- `css/*.css` — all stylesheets
- `index.html` — main HTML
- `scripts/*.js` — build, test, serve scripts
- `package.json` — version, deps
- `dist/**` — built output (via `node scripts/build.js`)
- `AGENTS.md` — this file

Claude Code must **NEVER** edit:

- `js/cloud.js` — backend/billing (owner: Andrew)
- `js/monetization.js` — IAP/ads (owner: Andrew)
- `capacitor.config.json` — native build config (owner: Andrew)
- Raw art source files in `assets/**` (owner: Codex)

### Shared rules (both agents)

1. **Always `git pull` before starting work** — stale state = overwrites.
2. **Never force push.** If push fails, pull and merge first.
3. **Never run `node scripts/build.js` from Codex** — only Claude Code builds dist.
4. **Never bump `package.json` version from Codex** — only Claude Code bumps.
5. If you see a merge conflict, stop and ask the user — don't auto-resolve.
6. Commit messages should start with your agent name: `[Codex]` or `[Claude]`.
