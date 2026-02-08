/**
 * Chocolate Day — heart-completion puzzle, 9-piece box, letter + gift reveal.
 */
(function () {
  'use strict';

  var ASSETS_PATH = '';
  var CONFIG = {
    gifs: [
      ASSETS_PATH + 'chocolate day gif 1.gif',
      ASSETS_PATH + 'Chocolate day gif 2.gif',
      ASSETS_PATH + 'Chocolate day gif 3.gif'
    ],
    secretGifIndex: 0,
    pieces: [
      { type: 'text', text: "You don't rush me — you melt me." },
      { type: 'gif', gifIndex: 0 },
      { type: 'text', text: "Come closer… I like it slow." },
      { type: 'text', text: "You taste like comfort and want." },
      { type: 'gif', gifIndex: 1 },
      { type: 'text', text: "I'd rather linger than finish." },
      { type: 'text', text: "Let me savor you." },
      { type: 'gif', gifIndex: 2 },
      { type: 'link', text: 'Save the best for last', href: 'choco-moments.html' }
    ]
  };

  var EMOTIONAL_OPTIONS = ['Love', 'You', 'Us', 'Forever', 'Patience'];
  var HEART_SEGMENTS = 5;
  var SWEET_MAX = 6;
  var sweetCount = 0;
  var filledCount = 0;
  var selectedEmotional = {};
  var completed = false;

  var boxSection = document.getElementById('choco-box-section');
  var heroCta = document.getElementById('choco-hero-cta');
  var questionSection = document.getElementById('choco-question-section');
  var questionOptions = document.getElementById('choco-question-options');
  var questionFeedback = document.getElementById('choco-question-feedback');
  var heartPuzzle = document.getElementById('choco-heart-puzzle');
  var heartWrap = document.getElementById('choco-heart-wrap');
  var heartOutline = document.getElementById('choco-heart-outline');
  var heartOpenInner = document.getElementById('choco-heart-open-inner');
  var heartWaiting = document.getElementById('choco-heart-waiting');
  var letterEl = document.getElementById('choco-letter');
  var heartGifWrap = document.getElementById('choco-heart-gif-wrap');
  var heartGif = document.getElementById('choco-heart-gif');
  var giftReadAgain = document.getElementById('choco-gift-read-again');
  var modal = document.getElementById('choco-gif-modal');
  var modalImg = document.getElementById('choco-gif-modal-img');
  var modalClose = document.getElementById('choco-gif-modal-close');
  var audioEl = document.getElementById('choco-audio');
  var sweetMeterFill = document.getElementById('choco-sweet-meter-fill');
  var sweetMeterLabel = document.getElementById('choco-sweet-meter-label');
  var cozyToggle = document.getElementById('choco-cozy-toggle');
  var heroHeart = document.getElementById('choco-hero-heart');
  var easterToast = document.getElementById('choco-easter-toast');
  var root = document.getElementById('choco-root');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var letterLineDelay = prefersReducedMotion ? 0 : 380;

  function addSweet(amount) {
    amount = amount || 1;
    sweetCount = Math.min(SWEET_MAX, sweetCount + amount);
    updateSweetMeter();
  }

  function updateSweetMeter() {
    if (!sweetMeterFill) return;
    var pct = (sweetCount / SWEET_MAX) * 100;
    sweetMeterFill.style.width = pct + '%';
    if (sweetMeterLabel) {
      sweetMeterLabel.textContent = sweetCount >= SWEET_MAX ? 'Sweetness overload 😌' : '';
    }
  }

  function buildBox() {
    var grid = document.getElementById('choco-box-grid');
    if (!grid) return;
    grid.innerHTML = '';
    CONFIG.pieces.forEach(function (p, i) {
      var piece = document.createElement('button');
      piece.type = 'button';
      piece.className = 'choco-piece';
      piece.dataset.index = String(i);
      piece.setAttribute('aria-label', 'Chocolate piece ' + (i + 1));
      piece.innerHTML = '<span class="choco-piece__shine"></span><span class="choco-piece__inner"></span>';
      piece.addEventListener('click', function () { onPieceClick(piece, p); });
      grid.appendChild(piece);
    });
  }

  function onPieceClick(pieceEl, data) {
    if (pieceEl.classList.contains('choco-piece--opened')) return;
    if (data.type === 'link') {
      window.location.href = data.href;
      return;
    }
    pieceEl.classList.add('choco-piece--opened');
    addSweet(1);
    if (data.type === 'gif') {
      openGifModal(CONFIG.gifs[data.gifIndex]);
    } else {
      var inner = pieceEl.querySelector('.choco-piece__inner');
      if (inner) inner.textContent = data.text;
    }
  }

  function openGifModal(src) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = 'Sweet moment';
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeGifModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeGifModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeGifModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGifModal(); });

  function fillSegment(index) {
    var seg = document.getElementById('choco-heart-seg-' + index);
    if (seg) seg.classList.add('choco-heart-seg--filled');
  }

  function checkComplete() {
    if (filledCount < HEART_SEGMENTS || completed) return;
    completed = true;
    addSweet(2);
    if (questionOptions) questionOptions.style.display = 'none';
    if (questionFeedback) questionFeedback.hidden = true;
    if (questionSection) questionSection.classList.add('choco-question-section--glow');
    if (root) root.classList.add('choco-root--heart-done');
    if (heartWrap) heartWrap.classList.add('choco-heart-wrap--complete');
    if (heartWaiting) {
      heartWaiting.hidden = false;
      heartWaiting.classList.add('choco-heart-waiting--visible');
    }
    setTimeout(function () {
      if (heartOutline) heartOutline.setAttribute('aria-hidden', 'true');
      if (heartWrap) heartWrap.classList.add('choco-heart-wrap--open');
      if (heartOpenInner) {
        heartOpenInner.hidden = false;
        resetLetterVisibility();
        runLetterTyping(function () {
          setTimeout(function () {
            if (heartGifWrap) heartGifWrap.classList.add('choco-heart-gif-wrap--visible');
            if (heartGif) {
              heartGif.src = CONFIG.gifs[CONFIG.secretGifIndex];
              heartGif.alt = 'Sweet surprise';
            }
          }, prefersReducedMotion ? 0 : 400);
        });
      }
      if (heartPuzzle) heartPuzzle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, prefersReducedMotion ? 200 : 1800);
  }

  function resetLetterVisibility() {
    if (!letterEl) return;
    var lines = letterEl.querySelectorAll('.choco-letter-line');
    lines.forEach(function (el) { el.classList.remove('choco-letter-line--visible'); });
  }

  function runLetterTyping(done) {
    if (!letterEl) { if (done) done(); return; }
    var lines = letterEl.querySelectorAll('.choco-letter-line');
    if (prefersReducedMotion || letterLineDelay <= 0) {
      lines.forEach(function (el) { el.classList.add('choco-letter-line--visible'); });
      if (done) setTimeout(done, 100);
      return;
    }
    var idx = 0;
    function next() {
      if (idx >= lines.length) { if (done) done(); return; }
      lines[idx].classList.add('choco-letter-line--visible');
      idx++;
      setTimeout(next, letterLineDelay);
    }
    next();
  }

  function handleOptionClick(btn) {
    if (!btn || completed) return;
    var answer = btn.getAttribute('data-answer');
    if (!answer) return;
    if (answer === '34') {
      if (questionFeedback) {
        questionFeedback.textContent = "That's the answer for the mind… not the heart.";
        questionFeedback.hidden = false;
      }
      btn.classList.add('choco-option--wiggle');
      setTimeout(function () { btn.classList.remove('choco-option--wiggle'); }, 500);
      setTimeout(function () { if (questionFeedback) questionFeedback.hidden = true; }, 3200);
      return;
    }
    if (EMOTIONAL_OPTIONS.indexOf(answer) === -1) return;
    if (selectedEmotional[answer]) return;
    selectedEmotional[answer] = true;
    filledCount++;
    fillSegment(filledCount);
    if (questionFeedback) questionFeedback.hidden = true;
    if (filledCount >= HEART_SEGMENTS) checkComplete();
  }

  function initQuestion() {
    var container = document.getElementById('choco-question-options');
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('.choco-option');
      if (btn) {
        e.preventDefault();
        handleOptionClick(btn);
      }
    });
  }

  if (giftReadAgain) {
    giftReadAgain.addEventListener('click', function () {
      resetLetterVisibility();
      if (heartGifWrap) heartGifWrap.classList.remove('choco-heart-gif-wrap--visible');
      setTimeout(function () {
        runLetterTyping(function () {
          setTimeout(function () {
            if (heartGifWrap) heartGifWrap.classList.add('choco-heart-gif-wrap--visible');
          }, 400);
        });
      }, 100);
    });
  }

  if (heroCta && boxSection) {
    heroCta.addEventListener('click', function (e) {
      e.preventDefault();
      boxSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function initReveal() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.chocolateday .reveal').forEach(function (el) { observer.observe(el); });
  }

  function initAudio() {
    if (!audioEl) return;
    audioEl.volume = 0.2;
    function startOnce() {
      audioEl.play().catch(function () {});
      document.removeEventListener('click', startOnce);
      document.removeEventListener('touchstart', startOnce);
    }
    document.addEventListener('click', startOnce);
    document.addEventListener('touchstart', startOnce);
  }

  function initCozy() {
    if (!cozyToggle || !root) return;
    cozyToggle.addEventListener('click', function () {
      var on = root.classList.toggle('choco-cozy-mode');
      cozyToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function initEasterEgg() {
    if (!heroHeart || !easterToast) return;
    var taps = 0;
    var resetAt;
    function handleTap() {
      taps++;
      if (resetAt) clearTimeout(resetAt);
      resetAt = setTimeout(function () { taps = 0; }, 1500);
      if (taps >= 5) {
        taps = 0;
        easterToast.hidden = false;
        easterToast.classList.add('choco-easter-toast--show');
        setTimeout(function () {
          easterToast.classList.remove('choco-easter-toast--show');
          setTimeout(function () { easterToast.hidden = true; }, 300);
        }, 2500);
      }
    }
    heroHeart.addEventListener('click', handleTap);
    heroHeart.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } });
  }

  function init() {
    buildBox();
    initQuestion();
    initReveal();
    initAudio();
    initCozy();
    initEasterEgg();
    updateSweetMeter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
