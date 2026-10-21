/* small cat behaviors: day/night, the cat on the card, paw prints, math */
(function () {
  'use strict';

  var root = document.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // day / night
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('mc-theme', next); } catch (e) { /* fine, it just won't stick */ }
    });
  }

  // the cat sitting on the card says things when you poke it
  var cat = document.querySelector('.sit-cat');
  var lines = ['mrrp?', 'meow', 'nya~', ':3', 'prrrr', 'feed me sushi', 'hi!!', 'mew'];
  var timer;
  if (cat) {
    cat.querySelector('.hit').addEventListener('click', function (e) {
      var bubble = cat.querySelector('.sit-bubble');
      bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
      cat.classList.remove('is-talking');
      void cat.offsetWidth;
      cat.classList.add('is-talking');
      heart(e.clientX, e.clientY);
      clearTimeout(timer);
      timer = setTimeout(function () { cat.classList.remove('is-talking'); }, 1600);
    });
  }

  var HEART = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.6s-7.6-4.6-7.9-9.8C3.9 7.9 5.8 5.8 8.2 5.8c1.7 0 3 .9 3.8 2.4.8-1.5 2.1-2.4 3.8-2.4 2.4 0 4.3 2.1 4.1 5-.3 5.2-7.9 9.8-7.9 9.8z"/></svg>';
  function heart(x, y) {
    if (calm) return;
    var h = document.createElement('span');
    h.className = 'float-heart';
    h.innerHTML = HEART;
    h.style.left = x + 'px';
    h.style.top = (y - 12) + 'px';
    document.body.appendChild(h);
    setTimeout(function () { h.remove(); }, 1200);
  }

  // clicking on nothing in particular leaves a paw print
  var PAW = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.8c-3 0-5.6 2.7-5.6 4.8 0 1.6 1.3 2.5 2.8 2.5 1.1 0 1.8-.6 2.8-.6s1.7.6 2.8.6c1.5 0 2.8-.9 2.8-2.5 0-2.1-2.6-4.8-5.6-4.8z"/><ellipse cx="5.6" cy="10.4" rx="1.9" ry="2.4"/><ellipse cx="9.4" cy="6.6" rx="2" ry="2.6"/><ellipse cx="14.6" cy="6.6" rx="2" ry="2.6"/><ellipse cx="18.4" cy="10.4" rx="1.9" ry="2.4"/></svg>';
  var busy = 'a, button, input, textarea, select, label, summary, pre, code, .sit-cat, .theme-toggle, .katex';
  document.addEventListener('pointerdown', function (e) {
    if (calm || e.button !== 0 || e.target.closest(busy)) return;
    if (window.getSelection && String(window.getSelection())) return;
    var p = document.createElement('span');
    p.className = 'paw-stamp';
    p.innerHTML = PAW;
    p.style.left = e.pageX + 'px';
    p.style.top = e.pageY + 'px';
    p.style.setProperty('--r', (Math.random() * 50 - 25).toFixed(0) + 'deg');
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 1400);
  });

  // the yarn ball in the footer
  var yarn = document.querySelector('.yarn');
  if (yarn) {
    yarn.addEventListener('click', function () {
      yarn.classList.toggle('is-rolling');
    });
  }

  // handout categories: tap a chip to show just that one
  document.querySelectorAll('.chips').forEach(function (bar) {
    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      bar.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      document.querySelectorAll('.note-group').forEach(function (g) {
        g.hidden = !!chip.dataset.cat && g.dataset.cat !== chip.dataset.cat;
      });
    });
  });

  // math on normal pages: $$x^2$$ or \( x \)
  if (window.MC) window.MC.typeset(document.querySelector('.card'));
})();
