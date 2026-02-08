/**
 * Choco Moments — mini story page. Optional lazy GIF.
 */
(function () {
  'use strict';

  var CONFIG = {
    gifSrc: ''
  };

  var gifWrap = document.getElementById('choco-moments-gif-wrap');
  var gifEl = document.getElementById('choco-moments-gif');

  function initReveal() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.choco-moments .reveal').forEach(function (el) { observer.observe(el); });
  }

  function initGif() {
    if (!gifWrap || !gifEl || !CONFIG.gifSrc) return;
    gifWrap.hidden = false;
    gifEl.src = CONFIG.gifSrc;
    gifEl.alt = 'Sweet moment';
  }

  function init() {
    initReveal();
    initGif();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
