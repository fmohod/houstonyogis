# Publishing a New Article — Houston Yogis

Articles are sequential numbered folders at the repo root, same pattern as
Cadenza Arthouse (minus the game-layer metadata, which doesn't apply here).

## 1. Folder structure

```
0001/
  index.html        ← the article
  thumb.jpg         ← card thumbnail (or thumb.png)
  images/           ← gallery photos (any .jpg/.png/.gif/.webp)
    photo1.jpg
    photo2.jpg
```

The homepage and `articles/index.html` **auto-discover** the folder via the
GitHub Contents API. You don't register new articles anywhere by hand.

## 2. The `<head>` template (copy, paste, fill the `{{...}}`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">

<title>{{TITLE}}</title>

<meta name="date" content="{{YYYY-MM-DD}}">
<meta name="description" content="{{ONE-OR-TWO SENTENCE SUMMARY}}">
<meta name="article-id" content="{{NNNN}}">

<link rel="canonical" href="https://houstonyogis.net/{{NNNN}}/">

<meta property="og:type" content="article">
<meta property="og:site_name" content="Houston Yogis">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{SUMMARY}}">
<meta property="og:url" content="https://houstonyogis.net/{{NNNN}}/">
<meta property="og:image" content="https://houstonyogis.net/{{NNNN}}/thumb.jpg">
<meta property="article:published_time" content="{{YYYY-MM-DD}}T12:00:00-05:00">
<meta property="article:section" content="{{Community}}">
<meta name="cadenza:type-of-work" content="{{news}}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{TITLE}}">
<meta name="twitter:description" content="{{SUMMARY}}">
<meta name="twitter:image" content="https://houstonyogis.net/{{NNNN}}/thumb.jpg">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "{{TITLE}}",
  "description": "{{SUMMARY}}",
  "image": ["https://houstonyogis.net/{{NNNN}}/thumb.jpg"],
  "datePublished": "{{YYYY-MM-DD}}T12:00:00-05:00",
  "publisher": {
    "@type": "Organization",
    "name": "Houston Yogis"
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://houstonyogis.net/{{NNNN}}/" }
}
</script>

<link rel="stylesheet" href="../style.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
```

The `<body>` (masthead, `.article-wrap`, `.article-body`, footer) should be
copied from the most recent folder once one exists, or adapted from
`CadenzaFeed`'s `000X/index.html` pattern (read-only reference — copy, don't
link to it).

## 3. Field reference

| Tag | Required | Notes |
|-----|----------|-------|
| `title` | yes | The headline. |
| `date` | yes | `YYYY-MM-DD`. |
| `description` | yes | 1–2 sentences. Reused for OG/Twitter/JSON-LD. |
| `article-id` | yes | The 4-digit folder number, e.g. `0001`. |
| `article:section` | yes | Category: Community / Teachers / Events / etc. |
| `cadenza:type-of-work` | yes | What KIND of writing this is: `news` · `analysis` · `opinion` · `review` · `sponsored`. |

### Type of work is a different axis from section, and must not be minted from it

**`article:section` says where a piece sits. `cadenza:type-of-work` says what it IS.** A profile
of a teacher and an opinion piece about teaching can both be `Teachers`; only one of them is the
paper's opinion. CAS §12.6 requires the distinction and requires that it **not** be derived --
not from `section`, and not from `story_intent.purpose`. Both describe something else, and a
guess that happens to be right most of the time is the kind of error nobody catches.

So it is set by hand, per article, and `sponsored` is the value that makes the whole field worth
having: it is the one a reader is owed and the one an inference would never produce.

> Added on the owner's ruling, Attention Desk `article-type-of-work-field` (2026-08-22):
> *"Yes if adding the field is going to help us get things going go ahead and add the field and
> we can fill it in with the appropriate information."*

## 4. Pre-publish checklist

- [ ] Folder is the next sequential 4-digit number.
- [ ] `article-id` matches the folder number.
- [ ] `cadenza:type-of-work` set deliberately -- and `sponsored` if it is.
- [ ] `thumb.jpg` (or `.png`) present; photos in `images/`.
- [ ] Prose is inside `<div class="article-body">`.
