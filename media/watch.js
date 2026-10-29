/* Houston Yogis: media/watch.js
   The streaming-style Watch page. It builds the billboard, the rows and a title page for each video from two files
   next to it: channels.json (the lineup, in the schema CAMT's Channel Manager writes) and streaming.json (cast,
   chapters, tags and art, which are this page's own). Plain JavaScript, no dependencies.

   Nothing is requested from YouTube until someone presses Play: the artwork is files in this repo, and the player is
   a youtube-nocookie iframe added on that press, never before. With scripts off, or if the data cannot load, the plain
   list in index.html stays visible (see the .sv-fallback rules in watch.css).

   Views: the page, a title page (the hash is the title's slug, #floating-sound-bath), and the theater over it
   (#floating-sound-bath/watch, which never starts a video by itself from a bare address). Escape and Back close the
   top layer, and focus returns to what opened it. */
(function () {
  'use strict';

  var ID_RE = /^[A-Za-z0-9_-]{11}$/;
  var SLUG_RE = /^[a-z0-9-]+$/;
  var ART_RE = /^art\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/;
  var root = document.documentElement;
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var page = document.getElementById('sv-page');
  var heroHost = document.getElementById('sv-hero');
  var rowsHost = document.getElementById('sv-rows');
  var layers = document.getElementById('sv-layers');
  var bar = document.getElementById('sv-bar');
  var menu = document.getElementById('sv-menu');
  var BASE_TITLE = document.title;
  if (!page || !heroHost || !rowsHost || !layers) { return; }

  var S = { titles: [], bySlug: {}, sheets: {}, open: null, opener: null, theater: null, kicker: '', soon: [] };
  var theaterEl = null;

  function reduced() { return !!(motion && motion.matches); }

  /* ── small helpers ─────────────────────────────────────── */
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null && text !== '') { e.textContent = text; }
    return e;
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function parseDur(v) {                                   // "m:ss" or "h:mm:ss", as CAMT writes it
    var parts = String(v || '').split(':').map(Number), s = 0, i;
    for (i = 0; i < parts.length; i++) { s = s * 60 + (parts[i] || 0); }
    return s;
  }
  function fmtLen(sec) {
    var m = Math.round(sec / 60), hh;
    if (m < 60) { return m + ' min'; }
    hh = Math.floor(m / 60);
    return hh + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  }
  function fmtClock(sec) {
    var hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = sec % 60;
    return hh ? hh + ':' + pad(mm) + ':' + pad(ss) : mm + ':' + pad(ss);
  }
  function image(src, alt, w, h2, lazy) {                  // art is only ever a file under art/
    var im;
    if (!ART_RE.test(src || '')) { return null; }
    im = document.createElement('img');
    im.src = src; im.alt = alt || ''; im.width = w; im.height = h2;
    im.decoding = 'async';
    if (lazy) { im.loading = 'lazy'; }
    return im;
  }
  function labelLive(x) {                                  // a label such as "New" stops showing after its label_until date
    var until;
    if (!x.label) { return false; }
    if (!x.label_until) { return true; }
    until = Date.parse(x.label_until + 'T23:59:59-06:00');
    return !isNaN(until) && Date.now() <= until;
  }
  function getJSON(u) {
    return fetch(u, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) { throw new Error(u + ' ' + r.status); }
      return r.json();
    });
  }

  /* ── load, build ───────────────────────────────────────── */
  Promise.all([getJSON('channels.json'), getJSON('streaming.json')]).then(function (d) {
    build(d[0], d[1]);
  }).catch(function (e) {
    root.classList.add('js-failed');                       // shows the plain list again
    if (window.console) { console.error('watch.js:', e); }
  });

  function build(ch, st) {
    var channel = (ch.channels || [])[0] || {}, vids = ch.videos || {}, extras = (st && st.titles) || {}, featured;
    (channel.lineup || []).forEach(function (id) {
      var v = vids[id], x = extras[id] || {}, sec;
      if (!v || !ID_RE.test(id) || !SLUG_RE.test(x.slug || '')) { return; }
      sec = parseDur(v.duration);
      var t = {
        id: id, slug: x.slug, title: v.title || '', sub: x.subtitle || '', year: v.year || '', location: v.location || '',
        desc: v.desc || '', yt: v.yt_title || v.title || '', sec: sec, len: sec ? fmtLen(sec) : (v.duration || ''),
        label: labelLive(x) ? x.label : '', tone: x.tone || 'green', tags: x.tags || [], art: x.art || {}, alt: x.alt || {},
        cast: x.cast || [], credits: x.credits || [], chapters: x.chapters || [], notes: x.notes || []
      };
      S.titles.push(t);
      S.bySlug[t.slug] = t;
    });
    if (!S.titles.length) { throw new Error('no titles in the lineup'); }
    S.kicker = (st && st.kicker) || '';
    S.soon = (st && st.soon) || [];
    featured = S.titles.filter(function (t) { return t.id === (st && st.featured); })[0] || S.titles[0];
    heroHost.appendChild(buildHero(featured));
    rowsHost.appendChild(buildRows());
    wire();
    root.classList.add('js-ready');
    sync(true);
  }

  function meta(t, withTags) {
    var ul = h('ul', 'sv-meta'), items = [];
    if (t.label) { items.push(['sv-badge', t.label]); }
    if (t.year) { items.push(['', t.year]); }
    if (t.len) { items.push(['', t.len]); }
    if (withTags) { t.tags.forEach(function (g) { items.push(['sv-tag', g]); }); }
    items.forEach(function (it) { ul.appendChild(h('li', it[0], it[1])); });
    return ul;
  }
  function kickerEl() {
    var p = h('p', 'sv-kicker');
    p.appendChild(h('span', 'sv-kicker-mark')).setAttribute('aria-hidden', 'true');
    p.appendChild(h('span', '', S.kicker));
    return p;
  }
  function stag(e, i) { e.classList.add('sv-stag'); e.style.setProperty('--i', i); return e; }

  /* ── the billboard ─────────────────────────────────────── */
  function buildHero(t) {
    var sec = h('section', 'sv-hero'), art = h('div', 'sv-hero-art'), im = image(t.art.hero, t.alt.hero, 1920, 1080, false), body = h('div', 'sv-hero-body'),
        title, actions, play, info, i = 0;
    sec.setAttribute('data-tone', t.tone);
    sec.setAttribute('aria-labelledby', 'sv-hero-h');
    if (im) { im.setAttribute('fetchpriority', 'high'); art.appendChild(im); }
    sec.appendChild(art);
    sec.appendChild(h('div', 'sv-hero-shade')).setAttribute('aria-hidden', 'true');
    body.appendChild(stag(kickerEl(), i++));
    title = h('h1', 'sv-h', t.title); title.id = 'sv-hero-h';
    body.appendChild(stag(title, i++));
    if (t.sub) { body.appendChild(stag(h('p', 'sv-sub', t.sub), i++)); }
    body.appendChild(stag(meta(t, true), i++));
    if (t.desc) { body.appendChild(stag(h('p', 'sv-synopsis sv-synopsis--hero', t.desc), i++)); }
    actions = h('p', 'sv-actions');
    play = h('button', 'sv-btn sv-btn--play', 'Play'); play.type = 'button'; play.setAttribute('data-play', t.slug);
    info = h('a', 'sv-btn sv-btn--info', 'More info'); info.href = '#' + t.slug; info.setAttribute('data-open', t.slug);
    actions.appendChild(play); actions.appendChild(info);
    body.appendChild(stag(actions, i++));
    sec.appendChild(body);
    return sec;
  }

  /* ── the rows ──────────────────────────────────────────── */
  function row(heading, cardNodes, cls) {
    var sec = h('section', 'sv-row' + (cls ? ' ' + cls : '')), hd = h('h2', 'sv-row-h', heading), ul = h('ul', 'sv-cards');
    hd.id = 'sv-row-' + heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    sec.setAttribute('aria-labelledby', hd.id);
    cardNodes.forEach(function (c) { ul.appendChild(c); });
    sec.appendChild(hd); sec.appendChild(ul);
    return sec;
  }
  function card(t) {                                       // a link to the title page; the image is decoration, the text names it
    var li = h('li', 'sv-card-wrap'), a = h('a', 'sv-card'), im = image(t.art.card, '', 640, 360, true), info = h('span', 'sv-card-info');
    a.href = '#' + t.slug; a.setAttribute('data-open', t.slug); a.setAttribute('data-tone', t.tone);
    if (im) { a.appendChild(im); }
    a.appendChild(h('span', 'sv-card-shade')).setAttribute('aria-hidden', 'true');
    if (t.label) { a.appendChild(h('span', 'sv-badge sv-card-badge', t.label)); }
    info.appendChild(h('span', 'sv-card-title', t.title));
    info.appendChild(h('span', 'sv-card-meta', [t.year, t.len].filter(Boolean).join(' · ')));
    a.appendChild(info);
    li.appendChild(a);
    return li;
  }
  function soonCard(label) {
    var li = h('li', 'sv-card-wrap'), box = h('div', 'sv-card sv-card--soon');
    box.appendChild(h('span', 'sv-card-ghost')).setAttribute('aria-hidden', 'true');
    box.appendChild(h('span', 'sv-card-title', label));
    box.appendChild(h('span', 'sv-card-meta', 'Coming soon'));
    li.appendChild(box);
    return li;
  }
  function buildRows() {
    var frag = document.createDocumentFragment(), cta = h('section', 'sv-row sv-row--cta'), box = h('div', 'sv-banner'), txt = h('div'), go = h('a', 'sv-btn sv-btn--play', 'See the calendar');
    frag.appendChild(row('Watch now', S.titles.map(card)));
    if (S.soon.length) { frag.appendChild(row('Coming to the channel', S.soon.map(soonCard))); }
    txt.appendChild(h('h2', 'sv-banner-h', 'Take a class in person'));
    txt.appendChild(h('p', 'sv-banner-p', 'Find a Houston Yogis class near you on the calendar.'));
    go.href = '../calendar.html';
    box.appendChild(txt); box.appendChild(go); cta.appendChild(box);
    frag.appendChild(cta);
    return frag;
  }

  /* ── a title page ──────────────────────────────────────── */
  function sheetFor(t) {
    var sheet, scroll, hero, im, head, closeBtn, i = 0, actions, play, body, main, side, hd, list, more, moreRow;
    if (S.sheets[t.slug]) { return S.sheets[t.slug]; }
    sheet = h('section', 'sv-sheet'); sheet.hidden = true; sheet.tabIndex = -1;
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'sv-sheet-h-' + t.slug);
    sheet.setAttribute('data-tone', t.tone); sheet.setAttribute('data-slug', t.slug);
    scroll = h('div', 'sv-sheet-scroll');

    hero = h('header', 'sv-sheet-hero');
    im = image(t.art.backdrop || t.art.hero, t.alt.backdrop || t.alt.hero, 1920, 1080, true);
    if (im) { im.className = 'sv-sheet-art'; hero.appendChild(im); }
    hero.appendChild(h('div', 'sv-sheet-shade')).setAttribute('aria-hidden', 'true');
    head = h('div', 'sv-sheet-head');
    head.appendChild(stag(kickerEl(), i++));
    hd = h('h2', 'sv-h', t.title); hd.id = 'sv-sheet-h-' + t.slug;
    head.appendChild(stag(hd, i++));
    if (t.sub) { head.appendChild(stag(h('p', 'sv-sub', t.sub), i++)); }
    head.appendChild(stag(meta(t, false), i++));
    actions = h('p', 'sv-actions');
    play = h('button', 'sv-btn sv-btn--play', 'Play'); play.type = 'button'; play.setAttribute('data-play', t.slug);
    actions.appendChild(play);
    head.appendChild(stag(actions, i++));
    hero.appendChild(head);
    scroll.appendChild(hero);

    body = h('div', 'sv-sheet-body'); main = h('div', 'sv-col-main'); side = h('aside', 'sv-col-side');
    main.appendChild(stag(h('p', 'sv-synopsis', t.desc), i++));
    if (t.tags.length) {
      list = h('ul', 'sv-tags');
      t.tags.forEach(function (g) { list.appendChild(h('li', 'sv-tag', g)); });
      main.appendChild(stag(list, i++));
    }
    if (t.notes.length) {
      main.appendChild(stag(h('h3', 'sv-sec-h', 'Good to know'), i++));
      list = h('ul', 'sv-notes');
      t.notes.forEach(function (n) { list.appendChild(h('li', '', n)); });
      main.appendChild(stag(list, i++));
    }
    if (t.chapters.length) {
      main.appendChild(stag(h('h3', 'sv-sec-h', 'Chapters'), i++));
      list = h('ol', 'sv-chapters');
      t.chapters.forEach(function (c) {
        var li = h('li'), b = h('button', 'sv-chapter');
        b.type = 'button'; b.setAttribute('data-play', t.slug); b.setAttribute('data-t', c[0]);
        b.appendChild(h('span', 'sv-chapter-time', fmtClock(c[0])));
        b.appendChild(h('span', 'sv-chapter-name', c[1]));
        li.appendChild(b); list.appendChild(li);
      });
      main.appendChild(stag(list, i++));
    }
    if (t.cast.length) {
      side.appendChild(stag(h('h3', 'sv-sec-h', 'Featuring'), i++));
      list = h('ul', 'sv-cast');
      t.cast.forEach(function (p) {
        var li = h('li', 'sv-person'), av = h('span', 'sv-avatar', p.initials || ''), tx = h('span', 'sv-person-text');
        av.setAttribute('aria-hidden', 'true');
        tx.appendChild(h('span', 'sv-person-name', p.name));
        if (p.role) { tx.appendChild(h('span', 'sv-person-role', p.role)); }
        li.appendChild(av); li.appendChild(tx); list.appendChild(li);
      });
      side.appendChild(stag(list, i++));
    }
    if (t.credits.length) {
      side.appendChild(stag(h('h3', 'sv-sec-h', 'Credits'), i++));
      list = h('dl', 'sv-credits');
      t.credits.forEach(function (c) { list.appendChild(h('dt', '', c[0])); list.appendChild(h('dd', '', c[1])); });
      side.appendChild(stag(list, i++));
    }
    body.appendChild(main); body.appendChild(side);
    scroll.appendChild(body);

    more = S.titles.filter(function (o) { return o.slug !== t.slug; });
    if (more.length) {
      moreRow = row('More to watch', more.map(card), 'sv-row--more');
      moreRow.id = 'sv-more-' + t.slug;
      scroll.appendChild(moreRow);
    }
    sheet.appendChild(scroll);

    closeBtn = h('button', 'sv-close'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', 'Close ' + t.title);
    closeBtn.appendChild(h('span', 'sv-close-x')).setAttribute('aria-hidden', 'true');
    sheet.appendChild(closeBtn);

    layers.appendChild(sheet);
    S.sheets[t.slug] = sheet;
    return sheet;
  }

  function setInsets(el, r) {                              // the card's box as insets from the viewport edges
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    el.style.setProperty('--cl', Math.max(0, r.left) + 'px');
    el.style.setProperty('--cr', Math.max(0, vw - r.right) + 'px');
    el.style.setProperty('--ct', Math.max(0, r.top) + 'px');
    el.style.setProperty('--cb', Math.max(0, vh - r.bottom) + 'px');
  }
  function visible(el) {
    var r;
    if (!el || !el.isConnected) { return null; }
    r = el.getBoundingClientRect();
    return (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) ? r : null;
  }

  function openTitle(slug, opener, opts) {
    var t = S.bySlug[slug], sheet, r, instant = !!(opts && opts.instant) || reduced(), btn;
    if (!t || S.open === slug) { return; }
    if (S.open) { closeTitle(true); }
    sheet = sheetFor(t);
    S.open = slug; S.opener = opener || null;
    root.classList.add('sv-lock');
    page.setAttribute('inert', '');
    document.title = t.title + ' | Houston Yogis';
    sheet.hidden = false;
    sheet.querySelector('.sv-sheet-scroll').scrollTop = 0;
    sheet.classList.remove('is-closing', 'is-settled');
    r = instant ? null : visible(opener);
    if (instant) { sheet.classList.add('is-instant'); }
    if (r) {
      setInsets(sheet, r);
      sheet.classList.add('is-from');                      // clipped to the card's box, no transition
      void sheet.offsetWidth;
      sheet.classList.remove('is-from');
      sheet.classList.add('is-opening');                   // and out to the full screen
    } else if (!instant) {
      sheet.classList.add('is-opening', 'is-fade');
    }
    sheet.classList.add('is-in');
    window.setTimeout(function () {
      sheet.classList.remove('is-opening', 'is-fade', 'is-instant');
      sheet.classList.add('is-settled');
    }, instant ? 0 : 700);
    btn = sheet.querySelector('.sv-close');
    if (btn) { btn.focus({ preventScroll: true }); }
  }

  function closeTitle(instant) {
    var slug = S.open, sheet, opener, r, done = false;
    if (!slug) { return; }
    sheet = S.sheets[slug]; opener = S.opener;
    S.open = null; S.opener = null;
    function finish() {
      var target;
      if (done) { return; }
      done = true;
      sheet.hidden = true;
      sheet.classList.remove('is-in', 'is-opening', 'is-closing', 'is-settled', 'is-fade', 'is-instant', 'is-from');
      if (!S.open) {
        root.classList.remove('sv-lock');
        page.removeAttribute('inert');
        document.title = BASE_TITLE;
        target = (opener && opener.isConnected && opener) || rowsHost.querySelector('.sv-card');
        if (target && !S.theater && target.focus) { target.focus({ preventScroll: true }); }
      }
    }
    if (instant || reduced()) { finish(); return; }
    r = visible(opener);
    sheet.classList.remove('is-opening', 'is-settled');
    if (r) { setInsets(sheet, r); sheet.classList.add('is-closing'); sheet.addEventListener('transitionend', function (e) { if (e.target === sheet) { finish(); } }); }
    else { sheet.classList.add('is-closing', 'is-fade'); }
    window.setTimeout(finish, 560);
  }

  /* ── the theater ───────────────────────────────────────── */
  function theater() {
    var el, bar2, back, title, stage, player;
    if (theaterEl) { return theaterEl; }
    el = h('div', 'sv-theater'); el.hidden = true; el.tabIndex = -1;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Player');
    bar2 = h('div', 'sv-theater-bar');
    back = h('button', 'sv-back'); back.type = 'button'; back.setAttribute('aria-label', 'Back');
    back.appendChild(h('span', 'sv-back-arrow')).setAttribute('aria-hidden', 'true');
    title = h('span', 'sv-theater-title');
    bar2.appendChild(back); bar2.appendChild(title);
    stage = h('div', 'sv-theater-stage'); player = h('div', 'sv-player');
    stage.appendChild(player);
    el.appendChild(bar2); el.appendChild(stage);
    layers.appendChild(el);
    theaterEl = el;
    return el;
  }

  function play(slug, start, opener) {
    var t = S.bySlug[slug], el, f, sheet;
    if (!t || !ID_RE.test(t.id)) { return; }
    if (S.open !== slug) {
      history.pushState({ sv: 'title' }, '', '#' + slug);
      openTitle(slug, null, { instant: true });
    }
    sheet = S.sheets[slug];
    el = theater();
    el.querySelector('.sv-theater-title').textContent = t.title;
    f = document.createElement('iframe');                  // the first request to YouTube is the one this press asks for
    f.src = 'https://www.youtube-nocookie.com/embed/' + t.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1' + (start > 0 ? '&start=' + Math.floor(start) : '');
    f.title = t.yt + ' (' + t.len + ')';
    f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.setAttribute('loading', 'lazy');
    el.querySelector('.sv-player').textContent = '';
    el.querySelector('.sv-player').appendChild(f);
    if (!S.theater) { history.pushState({ sv: 'theater' }, '', '#' + slug + '/watch'); }
    S.theater = { slug: slug, opener: opener || null };
    if (sheet) { sheet.setAttribute('inert', ''); }
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add('is-open');
    el.querySelector('.sv-back').focus({ preventScroll: true });
  }

  function closeTheater() {
    var th = S.theater, el = theaterEl, sheet, opener;
    if (!th || !el) { return; }
    S.theater = null;
    opener = th.opener;
    el.classList.remove('is-open');
    el.hidden = true;
    el.querySelector('.sv-player').textContent = '';       // removing the iframe is what stops the video
    sheet = S.sheets[th.slug];
    if (sheet) { sheet.removeAttribute('inert'); }
    if (opener && opener.isConnected && opener.focus) { opener.focus({ preventScroll: true }); }
    else if (sheet) { (sheet.querySelector('.sv-close') || sheet).focus({ preventScroll: true }); }
  }

  /* ── history: the hash names the view ──────────────────── */
  function requestCloseTheater() {
    var slug = S.theater && S.theater.slug;
    if (history.state && history.state.sv === 'theater') { history.back(); }
    else { history.replaceState(null, '', '#' + slug); closeTheater(); }
  }
  function requestClose() {
    if (S.theater) { requestCloseTheater(); return; }
    if (history.state && history.state.sv === 'title') { history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search); closeTitle(false); }
  }
  function openFromUI(slug, opener) {
    if (S.open === slug) { return; }
    history.pushState({ sv: 'title' }, '', '#' + slug);
    openTitle(slug, opener, {});
  }
  function sync(instant) {
    var m = /^#([a-z0-9-]+)(\/watch)?$/.exec(location.hash || ''), slug = m && S.bySlug[m[1]] ? m[1] : null;
    if (!slug) { if (S.theater) { closeTheater(); } closeTitle(instant); return; }
    if (S.open !== slug) { openTitle(slug, null, { instant: instant }); }
    if (m[2] && !S.theater) { history.replaceState(null, '', '#' + slug); }      // a bare address never starts a video
    if (!m[2] && S.theater) { closeTheater(); }
  }

  /* ── events ────────────────────────────────────────────── */
  function wire() {
    var lastY = -1;
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-play], [data-open], .sv-close, .sv-back') : null, slug;
      if (menu && menu.open && !(ev.target.closest && ev.target.closest('#sv-menu'))) { menu.open = false; }
      if (!t) { return; }
      if (t.classList.contains('sv-back')) { requestCloseTheater(); return; }
      if (t.classList.contains('sv-close')) { requestClose(); return; }
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button > 0) { return; }       // let "open in a new tab" through
      if (t.hasAttribute('data-play')) {
        play(t.getAttribute('data-play'), Number(t.getAttribute('data-t')) || 0, t);
        return;
      }
      slug = t.getAttribute('data-open');
      ev.preventDefault();
      if (S.open && S.open !== slug) {                                                  // from "More to watch": swap the title page
        history.replaceState({ sv: 'title' }, '', '#' + slug);
        closeTitle(true);
        openTitle(slug, null, { instant: false });
      } else {
        openFromUI(slug, t);
      }
    });
    document.addEventListener('keydown', function (ev) {
      var a, cards, i;
      if (ev.key === 'Escape') {
        if (S.theater || S.open) { ev.preventDefault(); requestClose(); }
        else if (menu && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
        return;
      }
      if ((ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) {
        a = document.activeElement;
        if (a && a.classList && a.classList.contains('sv-card') && a.tagName === 'A') {
          cards = [].slice.call(a.closest('.sv-cards').querySelectorAll('a.sv-card'));
          i = cards.indexOf(a) + (ev.key === 'ArrowRight' ? 1 : -1);
          if (cards[i]) { ev.preventDefault(); cards[i].focus(); cards[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
        }
      }
    });
    window.addEventListener('hashchange', function () { sync(false); });
    window.addEventListener('popstate', function () { sync(false); });
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset || 0;
      if ((y > 24) === (lastY > 24)) { lastY = y; return; }
      lastY = y;
      if (bar) { bar.classList.toggle('is-solid', y > 24); }
    }, { passive: true });
  }
})();
