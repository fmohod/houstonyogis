/* Houston Yogis — 0001/slides.js
   The scene walk-through, as an enhancement only. The page is complete without
   this file: the scenes stack, the dots are real links, and the video is a link
   to YouTube. What this adds: the entrance and the current-scene dot, a slow
   drift on the logo mark, left/right arrow keys, and a click-to-load video, so
   nothing is requested from YouTube until a visitor presses play. */
(function () {
  'use strict';

  var scenes = [].slice.call(document.querySelectorAll('[data-scene]'));
  var dots   = [].slice.call(document.querySelectorAll('.scene-dots a'));
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var active = -1;

  function reduced() { return !!(motion && motion.matches); }


  /* ── entrance, and which scene is current ──────────────── */
  function setActive(i) {
    if (i < 0 || i === active) return;
    active = i;
    dots.forEach(function (d, n) {
      if (n === i) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
    });
  }

  if ('IntersectionObserver' in window) {
    var entering = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); entering.unobserve(e.target); }
      });
    }, { threshold: 0.2 });

    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { setActive(scenes.indexOf(e.target)); } });
    }, { rootMargin: '-45% 0px -45% 0px' });          // the scene crossing the middle of the screen

    scenes.forEach(function (s) { entering.observe(s); current.observe(s); });
  } else {
    scenes.forEach(function (s) { s.classList.add('is-in'); });
  }


  /* ── a slow drift on the logo mark (--p is read by slides.css) ── */
  var pending = false;

  function drift() {
    pending = false;
    var vh = window.innerHeight || 800;
    scenes.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) { return; }
      var p = (r.top + r.height / 2 - vh / 2) / vh;     // 0 when the scene is centered
      s.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(3));
    });
  }
  function queue() {
    if (!pending && !reduced()) { pending = true; window.requestAnimationFrame(drift); }
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  queue();


  /* ── left / right arrow: previous and next scene ───────── */
  function go(i) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    var s = scenes[i];
    s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    // Move the keyboard's place with the screen, as the scene dots (real fragment links) already do;
    // otherwise Tab after an arrow key resumes from wherever focus was, off-screen.
    s.setAttribute('tabindex', '-1');
    s.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) { return; }
    var dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) { return; }
    var t = ev.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) { return; }
    ev.preventDefault();
    go(active + dir);
  });


  /* ── the video: a link until it is pressed, then a nocookie iframe ──
     No YouTube script, no player API, no thumbnail from their servers: the
     poster is a file in this repo, so the first request to YouTube is the one
     the visitor asks for. */
  [].forEach.call(document.querySelectorAll('[data-reel]'), function (reel) {
    var poster = reel.querySelector('.reel-poster');
    if (!poster) { return; }

    poster.setAttribute('role', 'button');             // a plain link without scripts; plays in place with them
    poster.addEventListener('keydown', function (ev) {
      if (ev.key === ' ') { ev.preventDefault(); poster.click(); }
    });
    poster.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button > 0) { return; }   // let "open in a new tab" through
      var id = reel.getAttribute('data-video') || '';
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { return; }                            // never build a URL from anything odd
      ev.preventDefault();

      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = reel.getAttribute('data-title') || 'Video';
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.setAttribute('loading', 'lazy');
      reel.replaceChild(f, poster);
      f.focus();
    });
  });
})();
