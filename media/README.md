# media/ — Watch, the Houston Yogis media page

`houstonyogis.net/media/`: films from Houston's yoga community, presented as a streaming service. A hero billboard,
rows of titles, a title page for each film that opens out of its card (description, who is in it, credits, chapters),
and a player. It is not a TV channel: there is no schedule, and nothing "plays by itself".

## The files

| File | What it is |
|---|---|
| `index.html` | The page shell (bar, footer) and a **plain list** of the films, which is what you get with scripts off or if the data cannot load. Keep the list in step with `channels.json` (title, description, video id). |
| `watch.js` | Builds the billboard, rows, title pages and player from the two JSON files. Plain JavaScript. |
| `watch.css` | The look. A dark page of its own: it does not load `../style.css`. Colors and type are tokens at the top; one tone per title (`data-tone`). |
| `channels.json` | **The lineup**, in the schema CAMT's Channel Manager (menu 40, ADR-0020) writes for cadenzaarthouse.com and modelauctions.net. Hand-authored for now (its `_readme` says so) so the Channel Manager can adopt it without a rewrite. Lineup membership, order and the editorial fields (title, location, year, description) are the Channel Manager's to own once it does. Format: indent 2, LF, no trailing newline. |
| `streaming.json` | This page's own presentation data, keyed by video id: slug, subtitle, label and its `label_until` date, tone, tags, art paths and their alt text, cast, credits, chapters, notes. The Channel Manager does not own it. |
| `art/` | Artwork. Files in this repo, never hot-linked: hero and backdrop 1920x1080, card 640x360, share 1200x630. No metadata (the phone stills carry GPS: re-save without EXIF). |

## Adding a title

1. `channels.json`: add the 11-character video id to the channel's `lineup`, and an entry under `videos` (`title`, `duration` as `m:ss` or `h:mm:ss`, `location`, `year`, `desc`, `yt_title`).
2. `streaming.json`: add `titles[<id>]` with a unique `slug` (lowercase, hyphens), a `tone` (`green`, `earth` or `pool`), art, alt text, cast, credits, chapters (seconds, ascending, first at 0).
3. `art/`: cut the pictures.
4. `index.html`: add the film to the plain list.

## What the page keeps

- **Nothing is requested from YouTube until someone presses Play.** The artwork is files here; the player is a `youtube-nocookie.com` iframe added on that press (with the `allow`, `referrerpolicy` and lazy attributes) and removed when the theater closes. A bare `#slug/watch` address opens the title page, never a video.
- **Names and sources.** Cast and credits name only people who pass the publication gate (verified and public in the registry) or are credited as on the video itself, and a **role is only what the film's own title card or its posted YouTube description says**: nobody is paired with an instrument or a job the sources do not pair them with. **Chapters are the ones posted on YouTube**; a title with no posted chapters has none. Notes ("Good to know") are the posted lines, word for word. No biography is written on this page: a title page says what the film is.
- **Labels expire.** A label such as New carries a `label_until` date in `streaming.json` (end of that day, Central time) and the page stops showing it after.
- **Words.** The page says where a film was shot only as finely as its `location` field. Nothing about who hosted or permitted it.
- **Honesty about the host.** This page's own code requests nothing from third parties but Google Fonts (the same as every page on the site) until Play. Cloudflare injects its own analytics script into every page it serves, here included; the footer makes no claim about that.
- **Without scripts**, or if the data cannot load, or if `watch.js` never arrives (the list appears after 4 seconds), the plain list is shown.
- **Reduced motion**: no drift, no entrances, titles open at once.
