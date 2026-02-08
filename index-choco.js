/**
 * Chocolate Day page — mini-experience, same design language as index.
 */
(function () {
  'use strict';

  var cta = document.getElementById('choco-cta');
  var surpriseWrap = document.getElementById('choco-surprise-wrap');
  var surpriseImg = document.getElementById('choco-surprise-img');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasHover = window.matchMedia('(hover: hover)').matches;

  function initReveal() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.choco-main .reveal').forEach(function (el) { observer.observe(el); });
  }

  function initLazyGif() {
    if (!surpriseWrap || !surpriseImg) return;
    var src = surpriseImg.getAttribute('data-src');
    if (!src || !src.trim()) return;
    surpriseWrap.hidden = false;
    surpriseImg.alt = 'Sweet surprise';
    if (surpriseImg.src && surpriseImg.src.indexOf('data:') !== 0) return;
    surpriseImg.src = src;
    surpriseWrap.classList.add('visible');
  }

  function initMagneticCta() {
    if (prefersReducedMotion || !hasHover || !cta) return;
    var pending = false;
    var lastX = 0, lastY = 0;
    function update() {
      var rect = cta.getBoundingClientRect();
      var dx = (lastX - rect.left - rect.width / 2) * 0.12;
      var dy = (lastY - rect.top - rect.height / 2) * 0.12;
      cta.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      pending = false;
    }
    cta.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!pending) { pending = true; requestAnimationFrame(update); }
    }, { passive: true });
    cta.addEventListener('mouseleave', function () { cta.style.transform = ''; });
  }

  function init() {
    initReveal();
    initLazyGif();
    initMagneticCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
