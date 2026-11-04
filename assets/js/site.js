/* small space behaviors: day/night, the planet on the card, click sparkles, math */
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

  // the planet sitting on the card says things when you poke it
  var mascot = document.querySelector('.mascot');
  var lines = ['hi!!', '<3', ':3', 'beep boop', 'pew pew!', 'to the moon', 'hehe', 'zoom!', 'ur a star', '<333'];
  var timer;
  if (mascot) {
    mascot.querySelector('.hit').addEventListener('click', function (e) {
      var bubble = mascot.querySelector('.mascot-bubble');
      bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
      mascot.classList.remove('is-talking');
      void mascot.offsetWidth;
      mascot.classList.add('is-talking');
      heart(e.clientX, e.clientY);
      clearTimeout(timer);
      timer = setTimeout(function () { mascot.classList.remove('is-talking'); }, 1600);
    });
  }

  var HEART = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.6s-7.6-4.6-7.9-9.8C3.9 7.9 5.8 5.8 8.2 5.8c1.7 0 3 .9 3.8 2.4.8-1.5 2.1-2.4 3.8-2.4 2.4 0 4.3 2.1 4.1 5-.3 5.2-7.9 9.8-7.9 9.8z"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.4c.8 5.4 4.2 8.8 9.6 9.6-5.4.8-8.8 4.2-9.6 9.6-.8-5.4-4.2-8.8-9.6-9.6 5.4-.8 8.8-4.2 9.6-9.6z"/></svg>';
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

  // clicking on nothing in particular leaves a little star or heart
  var busy = 'a, button, input, textarea, select, label, summary, pre, code, .mascot, .katex';
  document.addEventListener('pointerdown', function (e) {
    if (calm || e.button !== 0 || e.target.closest(busy)) return;
    if (window.getSelection && String(window.getSelection())) return;
    var isHeart = Math.random() < .35;
    var s = document.createElement('span');
    s.className = 'stamp ' + (isHeart ? 'is-heart' : 'is-star');
    s.innerHTML = isHeart ? HEART : STAR;
    s.style.left = e.pageX + 'px';
    s.style.top = e.pageY + 'px';
    s.style.setProperty('--r', (Math.random() * 50 - 25).toFixed(0) + 'deg');
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 1300);
  });

  // the rocket in the footer
  var rocket = document.querySelector('.rocket');
  if (rocket) {
    rocket.addEventListener('click', function () {
      rocket.classList.remove('is-launching');
      void rocket.offsetWidth;
      rocket.classList.add('is-launching');
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
