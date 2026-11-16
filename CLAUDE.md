# CLAUDE.md — Houston Yogis repo

This repository is **Houston Yogis**: a static site (no build step) live at
houstonyogis.net, structurally modeled on the `CadenzaFeed` repo
(cadenzaarthouse.com). It is a separate publication and a separate deployment —
**not** a fork, and not the same site.

**Hosting: a Cloudflare Worker, not GitHub Pages.** houstonyogis.net is served by the Worker
`houstonyogis`, deployed by Workers Builds on every push to `main`. cadenzaarthouse.com *is*
still GitHub Pages, so do not reason from one to the other. Verified 2026-09-09 from live
response headers. The root `CNAME` is a dead Pages leftover.

## Relationship to CadenzaFeed

`CadenzaFeed` (the Cadenza Arthouse repo) is a **read-only reference** for this
project. Copy patterns from it; do not write to it from here. If a shared,
config-driven template is ever extracted (see the README's "Future Work"), that
is a separate, explicitly-scoped task — not something to do incidentally while
working on Houston Yogis.

## Architecture (same as Cadenza Arthouse)

- No build step, no npm, no framework. Vanilla HTML/CSS/JS.
- Articles are sequential numbered folders (`0001/`, `0002/`, …) at the repo
  root, each with an `index.html`, a `thumb.jpg`/`thumb.png`, and an `images/`
  folder. `0001/` ("Coming to Houston Yogis", 2026-10-28) is the first: a
  full-screen scene walk-through with its own `slides.css` (the palette, type
  and motion are tokens at the top; a few literals sit below them, namely the
  test card, the play button and the scene dots, so a re-skin should check
  those) and `slides.js` (enhancement only: with scripts off the scenes stack;
  the two film scenes link to the Watch page and the article plays nothing
  itself, because it is a teaser). Its masthead and footer are the reference for
  article markup. Before it existed the homepage and `journal/index.html` (the
  page that lists articles; `articles/index.html` has only been a redirect stub
  since Build 2) degraded gracefully ("No stories published yet"), and they
  still do if the folders are ever empty.
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
was deliberately reversed: Cadenza Arthouse is the "Apollo" publication (order,
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

## Build 4 — Watch, the media page (2026-10-28)

`media/` is the Houston Yogis media page, presented as a streaming service (a
billboard, rows, a title page per film, a player), not a TV channel. It has its
own README (the files, how to add a title, what it keeps). Its lineup is
`media/channels.json`, in the schema CAMT's Channel Manager writes for the other
two sites and hand-authored until that tool adopts it. **"Watch" is in the
masthead nav of the 18 pages that carry the nav** (`media/` from the root,
`../media/` from `journal/` and `0001/`); there is no shared include, so a new
page with a masthead needs the link added by hand. Films play on `media/` and
nowhere else: articles link there instead of embedding. **[Amended 2026-11-15:
this sentence used to say "Videos play on `media/` and nowhere else." Silent
background loops are now allowed in features and teacher pages; see Build 5.]**

## Build 5 — scroll scenes (2026-11-15)

The owner's direction, 2026-11-14 (in summary, not his exact words): a
visual-only overhaul with scenic, story-like scrolling and short clips from his
own footage playing in the background of a teacher's page and feature, looking
great on a phone and on a desktop. He gave the word to build and push on 2026-11-15, once features 0002
and 0003 were published.

It is a layer, not a rewrite: `scenes.css`, `scenes.js` and `assets/loops/`.

- **An article opts in with two lines** and none of its words change: the
  `scenes.css` link in the head, and one tag at the end of the body,
  `<script src="../scenes.js" data-open="CLIP" data-scenes='{"Heading text":"CLIP"}'>`.
  `data-open` is the clip behind the headline; `data-scenes` maps a section
  heading's text to a clip. The script wraps the existing headline block and
  those headings in scenes at load. A heading that is renamed or removed just
  loses its scene, so text edits to an article never need this file touched.
  Leave a section out of the map to keep it plain.
- **`guide.html`** carries a bare tag; the teacher-to-clip table is `GUIDES` at
  the top of `scenes.js`. `guides.json` is generated and is not touched.
- **The homepage and the Journal list (added 2026-11-16)** opt in the same way.
  `index.html`: `data-open` is the fallback clip behind the hero, and the hero
  then takes the clip of whichever feature it is showing, from the `FEATURES`
  table (folder number to clip) at the top of `scenes.js`; add a line there when
  a new feature has a clip. `data-quote` is the clip behind the membership
  quote. The three explore tiles carry stills set in `scenes.css`.
  `journal/index.html`: `data-band` is the clip behind the list's heading.
  `calendar.html`, `guides.html`, `join.html`, `places.html`, `about.html`,
  `attend.html` and `teach.html` (2026-11-16) take the same `data-band`: the
  kicker and title of the page's first `.page-wrap` move onto the band and
  everything else stays where it was.
  The pages' own scripts and data are untouched.
- **Version tag.** Browsers keep `scenes.css` and `scenes.js` for four hours.
  The pages load them as `?v=N`; when either file changes in a way a page
  depends on, raise N on every page that loads them (one search and replace).
- **Enhancement only.** With scripts off, reduced motion on, or data saver on,
  nothing moves: the page is the plain article (reduced motion and data saver
  show the still). One clip plays at a time, a file is fetched only when its
  scene reaches the screen, and every scene has a Pause button.
- **A loop** is `assets/loops/NAME.mp4` plus `NAME.jpg` (its first frame): six
  seconds, silent, 1280 wide, H.264, metadata stripped, well under 1.1 MB. Each
  has an entry in `LOOPS` in `scenes.js` giving `focus`, the part of the wide
  frame an upright phone keeps. Check a new clip at phone width: the default
  crop can land on the wrong person.
- **What a loop may show.** Footage from a class in a public park may show the
  people in it (the owner's rulings of 2026-10-28 and 2026-11-15). Footage from
  a private place shows nothing that locates it. Naming a person is a separate
  question and is not decided here.
- **YouTube** is not embedded by this build. If a feature ever needs one, use a
  still with a play button that loads `youtube-nocookie.com` only on a tap, so
  the page makes no request to Google until the reader asks.

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
- `register.html` and the homepage newsletter form (`index.html`) are both
  wired to **Web3Forms** with a live access key (added 2026-07-06):
  `5dc0d589-7995-41de-9f4a-32031f98948e`. **The recipient inbox is configured
  on the Web3Forms dashboard side, not in this repo's code** — the intent is
  everything routes to `info@houstonyogis.net`, but that's set by whichever
  email the key/form was created against in the Web3Forms dashboard. If
  submissions aren't landing at info@houstonyogis.net, fix it there, not in
  the HTML. Both forms submit via `fetch()` (AJAX, in-page success/error
  message, no page reload) and also carry a `redirect` hidden field pointing
  at `thank-you.html` as the no-JS fallback — if JavaScript fails, the
  browser does a normal POST and lands on that page instead of showing raw
  JSON. Adding a fifth `register.html` role, or a new form elsewhere, should
  follow the same pattern: `access_key` + `subject` + `from_name` + `redirect`
  + a hidden `botcheck` honeypot.
- `membership.html` is superseded and is now a meta-refresh stub → `join.html`
  (same pattern as the Build 2 stale-page cleanup below).
- The "print presence" language in the Teach and Promote Your Business copy
  is deliberately phrased as *forthcoming* ("a print presence we're building
  out" / "growing print presence"), not current fact — there is no live
  print edition yet as of this build. Don't strengthen that language to claim
  active print distribution until one actually exists.

## What's intentionally a placeholder in this v1 pass

- **The logo is not a placeholder (corrected 2026-09-11).** The masthead shows
  the Cadenza Arthouse master logo. `.masthead-symbol` in `style.css` uses
  `assets/logo.png` as a CSS mask filled with `--color-accent`, so the mark
  takes the Houston Yogis accent color. The old inline SVG sun glyph is still
  in each page's markup, but `.masthead-symbol svg { display: none; }` hides
  it. Seventeen pages carry `.masthead-symbol`. This follows the owner's
  2026-08-24 ruling that every sub-product uses the master logo, styled to match its
  sub-brand (`F:\Media\logs\20260824-01.md`). It shipped in commit `bf70d15`.
  `assets/logo.png` is byte-identical to the master at
  `F:\Apps\Libraries\assets\logo.png`. Verified 2026-09-11 in the repo and in
  the live `style.css` and `logo.png`. Until then this bullet said there was
  no logo image and not to reference `assets/logo.png`, which was wrong.
- `assets/founder.jpg` in this repo is Cadenza Arthouse's own asset, copied
  over as folder-structure scaffolding, not Houston Yogis content. No page
  references it. Don't reference it from any Houston Yogis page as-is.
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
Cadenza Arthouse-specific and out of scope for this repo unless explicitly requested).
