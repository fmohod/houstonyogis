# CLAUDE.md — Houston Yogis repo

This repository is **Houston Yogis**: a static site (GitHub Pages, no build step)
intended for houstonyogis.net, structurally modeled on the `CadenzaFeed` repo
(cadenzaarthouse.com). It is a separate publication and a separate deployment —
**not** a fork, and not the same GitHub Pages site.

## Relationship to CadenzaFeed

`CadenzaFeed` (the Cadenza Arthouse repo) is a **read-only reference** for this
project. Copy patterns from it; do not write to it from here. If a shared,
config-driven template is ever extracted (see the README's "Future Work"), that
is a separate, explicitly-scoped task — not something to do incidentally while
working on Houston Yogis.

## Architecture (same as Cadenza)

- No build step, no npm, no framework. Vanilla HTML/CSS/JS.
- Articles are sequential numbered folders (`0001/`, `0002/`, …) at the repo
  root, each with an `index.html`, a `thumb.jpg`/`thumb.png`, and an `images/`
  folder. None exist yet — the homepage and `articles/index.html` degrade
  gracefully ("No stories published yet") until the first folder is added.
- The homepage, `articles/index.html`, and any future article page all read
  folder/article metadata **at runtime** via the GitHub Contents API
  (`GITHUB_USER` / `GITHUB_REPO` consts at the top of each page's `<script>`).
  Update those two consts if the repo is ever renamed or transferred.
- All site-specific styling lives in `:root` CSS custom properties at the top
  of `style.css` (`--color-primary`, `--color-secondary`, `--color-accent`,
  `--color-bg`, `--color-dark`, `--color-text`). Re-skinning the palette is a
  five-variable change; re-skinning copy/nav is a per-page HTML change (there
  is no shared include mechanism yet — see README "Future Work").

## Build 2 — identity pivot (2026-07-06)

Build 1 was a direct reskin of Cadenza Arthouse's newspaper look (Bebas Neue,
IBM Plex Mono, Established/date/count masthead, 8-item nav, card grid). That
was deliberately reversed: Cadenza is the "Apollo" publication (order,
documentation, newspaper); Houston Yogis is the "Artemis" publication
(nature, movement, breath — editorial journal, think Kinfolk/Cherry Bombe,
not the NYT). Same engine, different personality — see `README.md` and the
project memory in the Cowork session this was decided in.

Concretely, as of Build 2:
- Typography is Fraunces (display/italic serif) + Lora (body) + Karla
  (meta/nav sans) — not Bebas Neue/IBM Plex Mono.
- Masthead has no Established/date/article-count stat block. Just a small
  symbol, italic wordmark, one-line tagline, and a quiet nav.
- Primary nav is 5 items — Explore, Calendar, Guides, Journal, Membership —
  plus a search icon. **About and Support live in the footer only**, not
  the primary nav.
- IA is renamed: Articles → **Journal** (now at `/journal/index.html`, not
  `/articles/`), Teachers → **Guides** (`guides.html`), Organizations →
  **Places** (`places.html`), Events → **Calendar** (`calendar.html`).
  `events.html`, `teachers.html`, `organizations.html`, and `articles/` still
  exist as meta-refresh redirect stubs to the new URLs — safe to `git rm`
  once the new nav is confirmed working.
- The homepage hero is **dynamic, not curated**: it always shows the thumb,
  title, and description of whichever numbered article folder was published
  most recently (same GitHub API fetch the card grid uses — see `index.html`
  `populateHero()`). There is no separate "hero image" asset to manage. Until
  the first article folder exists, it shows a soft gradient placeholder.
- The backend/fetch logic (`getArticleFolders`, `getArticleMeta`,
  `GITHUB_USER`/`GITHUB_REPO` consts) is unchanged from Build 1 on purpose —
  only the rendering functions and CSS changed. Keep it that way: the
  fetch/render split is what makes "redesign the skin, freeze the backend"
  possible.

## Build 3 — "Join the Community" (2026-07-06)

The "Membership" nav item became **`join.html`**, a manifesto-plus-router page
(not a plain link list) — see the project memory `houston-yogis-participate-page`
for the full back-and-forth that produced this. The question it leads with is
"what role do you want Houston Yogis to play in your life or business," not
"what page do you want."

- Seven paths, one page, no reloads: Discover, Attend, Teach, Perform,
  Promote Your Business, Partner With Us, Support the Network. Implemented
  as a vertical tablist (horizontal/wrapping on mobile, see `.join-tablist`
  in `style.css`) next to a single content area that swaps text in place.
- **Progressive enhancement, not a JS-only SPA pattern.** All seven
  `<section class="join-panel">` blocks in `join.html` are real, populated
  HTML from the start — with no JavaScript, the page is just a long stacked
  document with working in-page anchor links. The `<script>` at the bottom
  adds a `js-enhanced` class to `<body>` and only then hides all but the
  active panel. Don't "simplify" this by generating panel content via JS —
  that would break the no-JS fallback on purpose.
- Discover, Attend, and Support the Network route to **existing pages**
  (`journal/index.html`, `calendar.html`, `support.html`) — no new backend.
  Teach, Perform, Promote Your Business, and Partner With Us all route to
  **one shared form**, `register.html?role=teacher|performer|business|partner`,
  which pre-fills the heading/copy/role field from the query param. Don't
  build four separate forms — extend `ROLE_MAP` in `register.html` instead.
- `register.html` is wired for **Web3Forms**, but the `access_key` is still
  the literal placeholder string `REPLACE_WITH_WEB3FORMS_ACCESS_KEY` — no
  account exists yet (deliberate, per project decision). The form's JS
  checks for that placeholder and shows a polite "not connected yet" message
  instead of submitting. Once a real Web3Forms account/key exists, drop the
  key into the hidden `access_key` input and the guard clause becomes a
  no-op automatically — no other code changes needed.
- `membership.html` is superseded and is now a meta-refresh stub → `join.html`
  (same pattern as the Build 2 stale-page cleanup below).
- The "print presence" language in the Teach and Promote Your Business copy
  is deliberately phrased as *forthcoming* ("a print presence we're building
  out" / "growing print presence"), not current fact — there is no live
  print edition yet as of this build. Don't strengthen that language to claim
  active print distribution until one actually exists.

## What's intentionally a placeholder in this v1 pass

- No logo image — the masthead uses a small inline SVG glyph (`.masthead-symbol`)
  as a neutral placeholder mark, not a real logo. `assets/logo.png` and
  `assets/founder.jpg` in this repo are literally Cadenza Arthouse's own
  assets (copied over as folder-structure scaffolding, not Houston Yogis
  content) — don't reference them from any Houston Yogis page as-is.
- No favicon files.
- No real photography for card/tile imagery — those are CSS gradient
  placeholder boxes with a text label. The hero is the one exception: it's
  wired to show real thumbs automatically once articles exist (see above).
- Calendar, Guides, and Places pages/sections show static "nothing here yet"
  states, not live data — there is no auto-discovery for these yet (unlike
  the Journal, which does auto-discover from numbered folders).
- Membership/Support payment buttons are non-functional (`alert()` placeholder)
  — no payment processor is connected for this publication yet.

## The one rule that matters when adding an article

Follow the numbered-folder pattern from `PUBLISHING.md` — no CLAUDE.md
Game Meta Block here (Houston Yogis has no game layer; that is
Cadenza-specific and out of scope for this repo unless explicitly requested).
