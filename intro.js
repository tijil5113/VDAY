/**
 * Intro / Timeline Gateway — "The Days That Led to Us"
 * Date logic: America/New_York. Config-driven. No heavy libs.
 */
(function () {
  'use strict';

  // ========== CONFIG (edit year, dates, or override for testing) ==========
  const CONFIG = {
    year: 2026,
    loveDays: [
      { id: 'proposal', title: 'Proposal Day', subtitle: 'The moment I asked you to be my always.', month: 2, day: 8, icon: 'ring', detail: 'You said yes with your eyes before your words. That day, our story became forever.' },
      { id: 'chocolate', title: 'Chocolate Day', subtitle: 'Sweetness shared, one bite at a time.', month: 2, day: 9, icon: 'chocolate', detail: 'Every piece we shared was a promise: life with you is the sweetest kind.' },
      { id: 'rose', title: 'Rose Day', subtitle: 'A single bloom for the one who makes my world bloom.', month: 2, day: 7, icon: 'rose', detail: 'Roses for the person who turned my ordinary days into a garden.' },
      { id: 'teddy', title: 'Teddy Day', subtitle: 'Something soft to hold when I can’t be there.', month: 2, day: 10, icon: 'teddy', detail: 'A small comfort until the next time you’re in my arms.' },
      { id: 'promise', title: 'Promise Day', subtitle: 'Words I mean with every beat of my heart.', month: 2, day: 11, icon: 'heart', detail: 'I promise to choose you, to cherish you, to grow with you—today and every day.' },
      { id: 'hug', title: 'Hug Day', subtitle: 'The language of arms that say more than words.', month: 2, day: 12, icon: 'heart', detail: 'One hug from you feels like coming home.' },
      { id: 'kiss', title: 'Kiss Day', subtitle: 'A gentle touch that says everything.', month: 2, day: 13, icon: 'heart', detail: 'Every kiss is a quiet “I love you” written in the softest way.' },
      { id: 'valentine', title: "Valentine's Day", subtitle: 'A day for us—because every day is for us.', month: 2, day: 14, icon: 'heart', detail: 'Today we celebrate what we already know: you are my forever Valentine.' },
    ],
    overrideToday: null, // e.g. { month: 2, day: 8 } for testing; null = use America/New_York
  };

  const THEME_GRADIENTS = [
    'linear-gradient(135deg, #faf8f6 0%, #f5e1e3 40%, #e8d5d2 70%, #f5f0eb 100%)',
    'linear-gradient(135deg, #f0eef8 0%, #e0d8f0 40%, #c4bce0 70%, #e8e4f4 100%)',
    'linear-gradient(135deg, #e8f4f4 0%, #c8e8e8 40%, #a8d4d4 70%, #dceeef 100%)',
    'linear-gradient(135deg, #faf6f0 0%, #f0e6d4 40%, #e8d9a8 70%, #f5efe4 100%)',
    'linear-gradient(135deg, #2a1e22 0%, #3d2a30 40%, #4a3540 70%, #2a1e22 100%)',
  ];

  const rail = document.getElementById('intro-timeline-rail');
  const heroContent = document.getElementById('intro-hero-content');
  const themeOverlay = document.getElementById('intro-theme-overlay');
  const spotlightEl = document.getElementById('intro-spotlight');
  const modal = document.getElementById('intro-modal');
  const modalBackdrop = document.getElementById('intro-modal-backdrop');
  const modalClose = document.getElementById('intro-modal-close');
  const modalTitle = document.getElementById('intro-modal-title');
  const modalBody = document.getElementById('intro-modal-body');
  const ctaBtn = document.getElementById('intro-cta-btn');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  // ---------- Today in America/New_York ----------
  function getTodayNY() {
    if (CONFIG.overrideToday) {
      return { year: CONFIG.year, month: CONFIG.overrideToday.month, day: CONFIG.overrideToday.day };
    }
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(now);
    let year = CONFIG.year, month = 1, day = 1;
    parts.forEach(function (p) {
      if (p.type === 'year') year = parseInt(p.value, 10);
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'day') day = parseInt(p.value, 10);
    });
    return { year: year, month: month, day: day };
  }

  function dateKey(y, m, d) {
    return y * 10000 + m * 100 + d;
  }

  function getStatus(loveDay) {
    if (loveDay.id === 'chocolate') return 'unlocked';
    var today = getTodayNY();
    var cardDate = dateKey(CONFIG.year, loveDay.month, loveDay.day);
    var todayKey = dateKey(today.year, today.month, today.day);
    if (cardDate < todayKey) return 'unlocked';
    if (cardDate === todayKey) return 'today';
    return 'locked';
  }

  // ---------- Icons (inline SVG) ----------
  var icons = {
    ring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>',
    chocolate: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M9 6v12M15 6v12M4 10h16M4 14h16" stroke="#5c4033" stroke-width="0.8" fill="none"/></svg>',
    rose: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21c-2-1.5-4-3-4-6 0-2 1.5-3 3-3 1 0 2 .5 2.5 1.2.5-.7 1.5-1.2 2.5-1.2 1.5 0 3 1 3 3 0 3-2 4.5-4 6z"/></svg>',
    teddy: '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="15" rx="8" ry="6"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><path d="M10 16q2 0 2-1.5" stroke="currentColor" stroke-width="1" fill="none"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  };

  function renderCards() {
    if (!rail) return;
    rail.innerHTML = '';
    CONFIG.loveDays.forEach(function (item, index) {
      var status = getStatus(item);
      var card = document.createElement('article');
      card.className = 'intro-card reveal intro-card--' + status;
      card.dataset.status = status;
      card.dataset.index = String(index);
      if (item.id === 'proposal') card.classList.add('intro-card--origin');
      if (item.id === 'chocolate') card.classList.add('intro-card--chocolate');

      var icon = icons[item.icon] || icons.heart;
      var pillText = status === 'today' ? 'Today' : status === 'unlocked' ? 'Unlocked' : 'Locked';
      var pillClass = 'intro-card__pill intro-card__pill--' + status;

      card.innerHTML =
        '<div class="intro-card__icon" aria-hidden="true">' + icon + '</div>' +
        '<div class="intro-card__text">' +
          '<h3 class="intro-card__title">' + escapeHtml(item.title) + '</h3>' +
          '<p class="intro-card__subtitle">' + escapeHtml(item.subtitle) + '</p>' +
          '<span class="' + pillClass + '">' + pillText + '</span>' +
        '</div>' +
        (status === 'locked' ? '<span class="intro-card__lock" aria-hidden="true">Soon…</span>' : '');

      card.dataset.dayId = item.id;

      if (status === 'unlocked' || status === 'today') {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
        card.addEventListener('click', function (ev) { onCardClick(ev, item, card); });
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(e, item, card); } });
      }

      rail.appendChild(card);
    });

    initTimelineObservers();
    initTodaySparkle();
    initCardTilt();
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ---------- Card click: Proposal → index, Chocolate → index-choco, others → modal ----------
  var transitionProposal = document.getElementById('intro-transition-proposal');
  var transitionChocolate = document.getElementById('intro-transition-chocolate');
  var transitionHearts = document.getElementById('intro-transition-hearts');
  var surpriseProposal = document.getElementById('intro-surprise-proposal');
  var surpriseProposalImg = document.getElementById('intro-surprise-proposal-img');

  function onCardClick(ev, item, card) {
    if (item.id === 'proposal') {
      runProposalTransition(card, ev);
      return;
    }
    if (item.id === 'chocolate') {
      runChocolateTransition(card, ev);
      return;
    }
    addRipple(card, ev);
    openModal(item);
  }

  function runProposalTransition(card, ev) {
    if (!card || !transitionProposal) return;
    addRipple(card, ev);
    card.classList.add('intro-card--transition-zoom');
    if (surpriseProposal && surpriseProposalImg) {
      var src = surpriseProposalImg.getAttribute('data-src');
      if (src && !surpriseProposalImg.src) {
        surpriseProposalImg.src = src;
        surpriseProposalImg.alt = 'Heart';
      }
      surpriseProposal.classList.add('visible');
    }
    transitionProposal.classList.add('active');
    setTimeout(function () {
      if (surpriseProposal) surpriseProposal.classList.remove('visible');
      window.location.href = 'proposal.html';
    }, 1600);
  }

  function runChocolateTransition(card, ev) {
    if (!card || !transitionChocolate || !transitionHearts) return;
    addRipple(card, ev);
    card.classList.add('intro-card--transition-unwrap');
    transitionChocolate.classList.add('active');
    spawnTransitionHearts();
    setTimeout(function () {
      window.location.href = 'chocolateday.html';
    }, 1800);
  }

  function spawnTransitionHearts() {
    if (prefersReducedMotion || !transitionHearts) return;
    var count = 12;
    for (var i = 0; i < count; i++) {
      (function (j) {
        setTimeout(function () {
          var el = document.createElement('span');
          el.className = 'intro-transition-heart';
          el.textContent = '♥';
          el.style.left = (20 + Math.random() * 60) + '%';
          el.style.top = (30 + Math.random() * 40) + '%';
          el.style.animationDelay = (Math.random() * 0.3) + 's';
          transitionHearts.appendChild(el);
          setTimeout(function () { el.remove(); }, 2200);
        }, j * 80);
      })(i);
    }
  }

  // ---------- Modal ----------
  function openModal(item) {
    if (!modal || !modalTitle || !modalBody) return;
    modalTitle.textContent = item.title;
    modalBody.textContent = item.detail;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // ---------- Hero reveal + shimmer ----------
  function initHeroReveal() {
    if (!heroContent) return;
    heroContent.classList.add('reveal--visible');
  }

  // ---------- IntersectionObserver for reveals ----------
  function initRevealObservers() {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.intro-main .reveal').forEach(function (el) { observer.observe(el); });
  }

  function initTimelineObservers() {
    if (!rail) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('reveal--visible');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );
    rail.querySelectorAll('.intro-card').forEach(function (c) { observer.observe(c); });
  }

  // ---------- Today card: 2s sparkle on load ----------
  function initTodaySparkle() {
    if (prefersReducedMotion) return;
    var todayCard = rail && rail.querySelector('.intro-card--today');
    if (!todayCard) return;
    todayCard.classList.add('intro-card--sparkle');
    setTimeout(function () { todayCard.classList.remove('intro-card--sparkle'); }, 2000);
  }

  // ---------- Ripple ----------
  function addRipple(el, ev) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var x = (ev && typeof ev.clientX === 'number') ? ev.clientX - rect.left : rect.width / 2;
    var y = (ev && typeof ev.clientY === 'number') ? ev.clientY - rect.top : rect.height / 2;
    var ripple = document.createElement('span');
    ripple.className = 'intro-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  }

  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) { addRipple(ctaBtn, e); });
  }

  // ---------- Magnetic CTA (desktop, subtle) ----------
  function initMagneticCta() {
    if (prefersReducedMotion || !hasHover || !ctaBtn) return;
    var pending = false;
    var lastX = 0, lastY = 0;
    function update() {
      var rect = ctaBtn.getBoundingClientRect();
      var dx = (lastX - rect.left - rect.width / 2) * 0.12;
      var dy = (lastY - rect.top - rect.height / 2) * 0.12;
      ctaBtn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      pending = false;
    }
    ctaBtn.addEventListener('mousemove', function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!pending) { pending = true; requestAnimationFrame(update); }
    }, { passive: true });
    ctaBtn.addEventListener('mouseleave', function () { ctaBtn.style.transform = ''; });
  }

  // ---------- Card tilt (desktop only) ----------
  function initCardTilt() {
    if (prefersReducedMotion || !hasHover || !rail) return;
    rail.querySelectorAll('.intro-card').forEach(function (card) {
      if (card.getAttribute('role') !== 'button') return;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(600px) rotateX(' + (y * -4) + 'deg) rotateY(' + (x * 4) + 'deg)';
      }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // ---------- Theme (4–5 themes, 8–12s, Auto/Manual) ----------
  var currentTheme = 0;
  var themeAuto = true;
  var themeTimer = null;

  function setTheme(index) {
    currentTheme = (index + 5) % 5;
    document.body.setAttribute('data-theme', String(currentTheme));
    try { localStorage.setItem('valentineTheme', String(currentTheme)); } catch (e) {}
  }

  function crossfade(nextIndex) {
    if (!themeOverlay) return;
    themeOverlay.style.background = THEME_GRADIENTS[currentTheme];
    themeOverlay.classList.add('active');
    setTheme(nextIndex);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { themeOverlay.classList.remove('active'); });
    });
  }

  function startThemeAuto() {
    if (themeTimer) clearInterval(themeTimer);
    var delay = 8000 + Math.random() * 4000;
    themeTimer = setInterval(function () {
      crossfade((currentTheme + 1) % 5);
    }, delay);
  }

  function stopThemeAuto() {
    if (themeTimer) clearInterval(themeTimer);
    themeTimer = null;
  }

  function initThemeToggle() {
    var wrap = document.getElementById('intro-theme-controls');
    if (!wrap) return;
    var modeBtn = document.createElement('button');
    modeBtn.type = 'button';
    modeBtn.className = 'intro-theme-btn';
    modeBtn.setAttribute('aria-label', 'Theme mode');
    modeBtn.textContent = 'Auto';
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'intro-theme-btn intro-theme-btn--nav';
    prevBtn.setAttribute('aria-label', 'Previous theme');
    prevBtn.textContent = '←';
    prevBtn.style.display = 'none';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'intro-theme-btn intro-theme-btn--nav';
    nextBtn.setAttribute('aria-label', 'Next theme');
    nextBtn.textContent = '→';
    nextBtn.style.display = 'none';

    modeBtn.addEventListener('click', function () {
      themeAuto = !themeAuto;
      modeBtn.textContent = themeAuto ? 'Auto' : 'Manual';
      prevBtn.style.display = themeAuto ? 'none' : 'inline-block';
      nextBtn.style.display = themeAuto ? 'none' : 'inline-block';
      if (themeAuto) startThemeAuto();
      else stopThemeAuto();
    });
    prevBtn.addEventListener('click', function () { stopThemeAuto(); crossfade((currentTheme - 1 + 5) % 5); });
    nextBtn.addEventListener('click', function () { stopThemeAuto(); crossfade((currentTheme + 1) % 5); });

    wrap.appendChild(prevBtn);
    wrap.appendChild(modeBtn);
    wrap.appendChild(nextBtn);
    if (themeAuto) startThemeAuto();
  }

  // ---------- Spotlight (cursor, desktop, no reduced motion) ----------
  function initSpotlight() {
    if (prefersReducedMotion || !spotlightEl || !hasHover) return;
    var x = 0.5, y = 0.5;
    var pending = false;
    function onMove(e) {
      x = e.clientX / window.innerWidth;
      y = e.clientY / window.innerHeight;
      if (!pending) {
        pending = true;
        requestAnimationFrame(function () {
          spotlightEl.style.setProperty('--spot-x', (x * 100) + '%');
          spotlightEl.style.setProperty('--spot-y', (y * 100) + '%');
          pending = false;
        });
      }
    }
    document.addEventListener('mousemove', onMove, { passive: true });
    document.body.classList.add('intro-spotlight-enabled');
  }

  // ---------- Init ----------
  function init() {
    try {
      var t = localStorage.getItem('valentineTheme');
      if (t !== null) setTheme(parseInt(t, 10));
      else setTheme(0);
    } catch (e) { setTheme(0); }
    renderCards();
    initHeroReveal();
    initRevealObservers();
    initMagneticCta();
    initThemeToggle();
    initSpotlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
