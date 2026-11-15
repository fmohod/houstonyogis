/* Houston Yogis — scenes.js (scroll scenes, 2026-11-15)
 *
 * Enhancement only. With this file missing, every page reads as it did before.
 * It never changes an article's words: it wraps what is already in the page.
 *
 * An article opts in with ONE tag at the end of its body:
 *   <script src="../scenes.js" data-open="pool-float-b"
 *           data-scenes='{"The in-between":"nahnah-willow-bowls"}'></script>
 * data-open   = the clip behind the headline.
 * data-scenes = section heading text -> clip. A heading that is renamed or removed
 *               simply loses its scene; nothing breaks.
 * guide.html opts in with a bare tag; the teacher -> clip table is GUIDES below.
 *
 * The clips are silent six-second loops in assets/loops/ (name.mp4 + name.jpg).
 * One plays at a time, a file is fetched only when its scene arrives, and with
 * reduced motion or data saver on, the still shows and nothing moves.
 */
(function () {
  var tag = document.currentScript;
  if (!tag) return;
  var base = tag.src.replace(/scenes\.js(\?.*)?$/, '') + 'assets/loops/';

  // focus: the part of the wide frame to keep on an upright phone. light: a daylight clip.
  var LOOPS = {
    'pool-float-a':        { focus: '50% 50%' },
    'pool-float-b':        { focus: '55% 60%' },
    'nahnah-willow-bowls': { focus: '17% 50%', light: true },
    'aisha-deck-a':        { focus: '60% 50%', light: true },
    'aisha-fold':          { focus: '50% 50%', light: true },
    'aisha-leg-stretch':   { focus: '62% 50%', light: true },
    'aisha-class':         { focus: '92% 50%', light: true }
  };
  var GUIDES = { 'nahnah': 'nahnah-willow-bowls', 'aisha-k-shahid': 'aisha-deck-a' };

  var root = document.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saver = !!(navigator.connection && navigator.connection.saveData);
  var moving = !still && !saver && 'IntersectionObserver' in window;
  var paused = false, scenes = [], ratio = [], buttons = [];

  function vw() { root.style.setProperty('--scene-vw', root.clientWidth + 'px'); }

  function make(name, kind) {
    var loop = LOOPS[name]; if (!loop) return null;
    var s = document.createElement('section');
    s.className = 'scene ' + kind + (loop.light ? ' scene-light' : '');
    var bg = document.createElement('div'); bg.className = 'scene-bg';
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.preload = 'none'; v.poster = base + name + '.jpg';
    v.setAttribute('data-src', base + name + '.mp4');
    v.style.setProperty('--focus', loop.focus);
    bg.appendChild(v);
    if (moving) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'scene-pause'; b.textContent = 'Pause';
      b.setAttribute('aria-label', 'Pause the moving pictures on this page');
      b.addEventListener('click', toggle);
      bg.appendChild(b); buttons.push(b);
    }
    var body = document.createElement('div'); body.className = 'scene-body';
    s.appendChild(bg); s.appendChild(body);
    scenes.push(s); ratio.push(0);
    return s;
  }

  function toggle() {
    paused = !paused;
    buttons.forEach(function (b) {
      b.textContent = paused ? 'Play' : 'Pause';
      b.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' the moving pictures on this page');
    });
    pick();
  }

  // One clip at a time: the scene covering most of the screen plays, the rest pause.
  function pick() {
    var best = -1, top = 0.25;
    for (var i = 0; i < scenes.length; i++) if (ratio[i] > top) { top = ratio[i]; best = i; }
    scenes.forEach(function (s, i) {
      var v = s.querySelector('video');
      if (i === best && !paused && !document.hidden) {
        if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) v.pause();
    });
  }

  function watch() {
    if (!moving || !scenes.length) return;
    // Measured directly, not with an observer: there are only a handful of scenes, and a direct
    // measurement is right on the first call, before the browser has drawn a frame.
    var due = false;
    function measure() {
      due = false;
      var h = window.innerHeight || 1;
      scenes.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        // the share of the SCREEN this scene covers (a scene is taller than the screen)
        ratio[i] = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0)) / h;
      });
      pick();
    }
    function soon() { if (!due) { due = true; setTimeout(measure, 80); } }
    window.addEventListener('scroll', soon, { passive: true });
    window.addEventListener('resize', soon);
    window.addEventListener('load', measure);
    document.addEventListener('visibilitychange', measure);
    measure();
  }

  function reveals(sel) {
    var els = [].slice.call(document.querySelectorAll(sel));
    if (!els.length) return;
    if (still || !('IntersectionObserver' in window)) return;   // they simply show
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) {
      // anything already on screen when the page loads stays put
      if (el.getBoundingClientRect().top < (window.innerHeight || 0)) return;
      el.classList.add('reveal'); io.observe(el);
    });
  }

  function feature() {
    var head = document.querySelector('.feature .feature-head');
    var bodyEl = document.querySelector('.feature .feature-body');
    if (!head || !bodyEl) return false;
    var map = {};
    try { map = JSON.parse(tag.getAttribute('data-scenes') || '{}'); } catch (e) { map = {}; }
    var open = make(tag.getAttribute('data-open'), 'scene-open');
    if (open) {
      head.parentNode.insertBefore(open, head);
      open.querySelector('.scene-body').appendChild(head);
      var cue = document.createElement('p');
      cue.className = 'scene-cue'; cue.setAttribute('aria-hidden', 'true'); cue.textContent = 'Scroll';
      head.appendChild(cue);
    }
    var wanted = {};
    Object.keys(map).forEach(function (k) { wanted[k.trim().toLowerCase()] = map[k]; });
    [].forEach.call(bodyEl.querySelectorAll('h2'), function (h) {
      var name = wanted[h.textContent.trim().toLowerCase()];
      var s = name && make(name, 'scene-chapter');
      if (!s) return;
      h.parentNode.insertBefore(s, h);
      s.querySelector('.scene-body').appendChild(h);
    });
    reveals('.feature .feature-hero, .feature .feature-inline, .feature .pullquote');
    return scenes.length > 0;
  }

  function guide() {
    var prof = document.getElementById('prof');
    var m = /[?&]id=([^&]+)/.exec(location.search);
    var name = m && GUIDES[decodeURIComponent(m[1])];
    if (!prof || !name) return false;
    var wrap = prof.parentNode;                       // .page-wrap
    var band = make(name, 'scene-band');
    if (!band) return false;
    band.removeChild(band.querySelector('.scene-body'));
    function place() {
      if (!prof.querySelector('.prof-hero') || band.parentNode) return;
      wrap.parentNode.insertBefore(band, wrap);
      root.classList.add('has-scenes'); vw(); watch();
    }
    place();
    if (!band.parentNode && 'MutationObserver' in window) {
      var mo = new MutationObserver(function () { place(); if (band.parentNode) mo.disconnect(); });
      mo.observe(prof, { childList: true, subtree: true });
    }
    return false;                                      // place() does the rest when the profile renders
  }

  window.addEventListener('resize', vw);
  if (feature()) { root.classList.add('has-scenes'); vw(); watch(); }
  else guide();
})();
