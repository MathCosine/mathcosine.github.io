/* small things: the back-to-top button, note filters, math */
(function () {
  'use strict';

  // "Back to Top" shows up once you've scrolled down a bit
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('is-shown', window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // notes page: tap a category to show just that one
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
  if (window.MC) window.MC.typeset(document.querySelector('main'));
})();
