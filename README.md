# Houston Yogis

**Official Website:** https://houstonyogis.net (once DNS/Pages are configured)

> **Important:** This README is a high-level overview only. The live website always takes precedence over planning documents.

Houston Yogis is an independent wellness publication documenting Houston's yoga, meditation, and holistic wellness community — a publication of [Cadenza Arthouse](https://cadenzaarthouse.com), built on the same publishing architecture.

## Mission

Houston Yogis documents Houston's wellness community through journalism, photography, education, and public events. It is not a yoga studio's website — it is a local wellness publication: independent, professional, community-focused, and journalistic.

## Relationship to Cadenza Arthouse

This site reuses the CSS architecture, HTML structure, and client-side publishing pattern from [cadenzaarthouse.com](https://cadenzaarthouse.com) (source: the `CadenzaFeed` repo). It is a separate repository and a separate GitHub Pages deployment — not a fork — but intentionally kept structurally identical so that:

- Design fixes and pattern improvements can be ported between publications by hand.
- A future shared/config-driven template (see "Future Work" below) can be extracted with minimal rework.

Do not assume Hugo, a build step, or any templating engine is involved — like Cadenza, this is vanilla HTML/CSS/JS, deployed via GitHub Pages, with articles and metadata read at runtime via the GitHub Contents API. See `CLAUDE.md` and `PUBLISHING.md` for the conventions.

## Project Structure

- `index.html` — homepage (quiet masthead, dynamic photo hero mirroring the latest published story, From the Community cards, Explore tiles, Support the Network pull-quote, newsletter)
- `journal/index.html` — full story archive (search + list) — the renamed "Articles" page
- `calendar.html`, `guides.html`, `places.html` — renamed Events/Teachers/Organizations; placeholder "nothing here yet" content until real data exists
- `join.html` — **"Join the Community"**, the primary-nav item that replaced Membership: a manifesto + seven-path router (Discover/Attend/Teach/Perform/Promote Your Business/Partner With Us/Support the Network), see `CLAUDE.md` "Build 3"
- `register.html` — shared registration form (Web3Forms-based, not yet connected to a real account) used by four of the seven `join.html` paths, pre-filled via `?role=`
- `about.html`, `support.html` — editorial and membership-tier pages (About/Support live in the footer, not the primary nav)
- `NNNN/` — sequential numbered article folders (created as stories are published — none exist yet)
- `style.css` — shared stylesheet; all site-specific colors and fonts live in `:root` custom properties at the top of the file
- `events.html`, `teachers.html`, `organizations.html`, `articles/`, `membership.html` — **stale/superseded pages**, now meta-refresh redirects to their renamed or replacement equivalents. Safe to `git rm` once you've confirmed the new nav in a browser.

## Current Status (Build 3)

Build 1 was a direct reskin of Cadenza Arthouse's newspaper identity. Build 2 (2026-07-06) gave Houston Yogis its own editorial-journal personality — see `CLAUDE.md` "Build 2 — identity pivot." Build 3 (same day) replaced the "Membership" nav item with "Join the Community," a manifesto-plus-router page — see `CLAUDE.md` "Build 3." It's still a placeholder-content scaffold in several ways: no real photography for card/tile imagery yet (the hero is the exception — it auto-populates from the latest article thumb once one exists), no logo mark, no favicon, no live print edition yet, and `register.html`'s Web3Forms integration has no real account/key behind it. See `CLAUDE.md` for the complete list and why.

## Future Work

- Extract a true config-driven template (single config: brand name, tagline, nav, colors, GitHub repo) shared between Cadenza Arthouse, Houston Yogis, and future Cadenza Network publications — without requiring changes to the live `CadenzaFeed` repo until that pattern is proven here first.
- Wire up real payment processing for membership tiers.
- Add a logo mark and photography once available.
- Populate real articles, events, teachers, and organizations.
