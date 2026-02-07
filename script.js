/**
 * Valentine / Proposal — Cinematic index page
 * Theme engine, audio persistence, particles, proposal + GIF modal.
 * Edit CONFIG below to customize content.
 */

(function () {
  'use strict';

  // ========== CONFIG (edit here) ==========
  const CONFIG = {
    loverName: 'My Love',
    loveLines: [
      'From the first moment, something felt different.',
      'You make ordinary days feel like small miracles.',
      'I love the way you laugh, the way you listen, and the way you care.',
      'With you, I found a home I never knew I was looking for.',
      'I promise to choose you, every day, in the small and the big.',
      'You are the best part of my story.',
      'Every moment with you feels like a gift.',
      'This is for you — with my whole heart.',
    ],
    reasons: [
      'You are my peace.',
      'You are my home.',
      'Forever would still not be enough.',
      'My mom — the one who nurtures my soul.',
      'My wife — my choice, my promise, my always.',
      'My best friend — the one I laugh, cry, and grow with.',
      'My princess — precious beyond words, cherished beyond measure.',
      'My chella kutty — my softest joy, my sweetest love.',
      'My sweetheart — the rhythm my heart knows by heart.',
      'My past, my present, and my forever-you future.',
      'My safe place in a loud world.',
      'My answered prayer I didn\'t know how to ask for.',
      'My today, tomorrow, and every lifetime after.',
      'My love, written into every version of me.',
      'My forever person — in this life and beyond.',
    ],
    proposalQuestion: 'Will you be my forever?',
    yesMessage: 'You already are my forever. Thank you for choosing me.',
    alwaysMessage: 'Always and forever. I love you.',
    letterPageURL: 'letter.html',
    performanceMode: 'auto', // 'auto' | 'high' | 'low'
  };

  const AUDIO_SRC = 'the_mountain-valentine-317783.mp3';
  const GIF_SRC = 'yes.gif';
  const THEME_NAMES = ['Blush Dawn', 'Lavender Night', 'Ocean Calm', 'Golden Hour', 'Rose Noir'];
  const THEME_GRADIENTS = [
    'linear-gradient(135deg, #faf8f6 0%, #f5e1e3 40%, #e8d5d2 70%, #f5f0eb 100%)',
    'linear-gradient(135deg, #f0eef8 0%, #e0d8f0 40%, #c4bce0 70%, #e8e4f4 100%)',
    'linear-gradient(135deg, #e8f4f4 0%, #c8e8e8 40%, #a8d4d4 70%, #dceeef 100%)',
    'linear-gradient(135deg, #faf6f0 0%, #f0e6d4 40%, #e8d9a8 70%, #f5efe4 100%)',
    'linear-gradient(135deg, #2a1e22 0%, #3d2a30 40%, #4a3540 70%, #2a1e22 100%)',
  ];

  const particleCanvas = document.getElementById('particle-canvas');
  const themeOverlay = document.getElementById('theme-overlay');
  const spotlightEl = document.getElementById('spotlight');
  const loveLinesList = document.getElementById('love-lines-list');
  const reasonsGrid = document.getElementById('reasons-grid');
  const proposalResponse = document.getElementById('proposal-response');
  const proposalResponseText = document.getElementById('proposal-response-text');
  const confettiContainer = document.getElementById('confetti-container');
  const fireflyContainer = document.getElementById('firefly-container');
  const musicToggle = document.getElementById('music-toggle');
  const musicPopover = document.getElementById('music-popover');
  const volumeSlider = document.getElementById('volume-slider');
  const replayBtn = document.getElementById('replay-btn');
  const replayInline = document.getElementById('replay-inline');
  const bgAudio = document.getElementById('bg-audio');
  const gifModal = document.getElementById('gif-modal');
  const gifImg = document.getElementById('gif-img');
  const gifClose = document.getElementById('gif-close');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  let currentTheme = 0;
  let themeAuto = true;
  let themeTimer = null;
  let endingVisible = false;
  let audioReady = false;

  // ========== Theme engine ==========
  function setTheme(index) {
    currentTheme = (index + 5) % 5;
    document.body.setAttribute('data-theme', String(currentTheme));
    try { localStorage.setItem('valentineTheme', String(currentTheme)); } catch (e) {}
  }

  function getNextThemeIndex() {
    return (currentTheme + 1) % 5;
  }

  function crossfadeToTheme(nextIndex) {
    if (!themeOverlay) return;
    themeOverlay.style.background = THEME_GRADIENTS[currentTheme];
    themeOverlay.classList.add('active');
    setTheme(nextIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        themeOverlay.classList.remove('active');
      });
    });
  }

  function startThemeAuto() {
    if (themeTimer) clearInterval(themeTimer);
    const delay = 8000 + Math.random() * 4000;
    themeTimer = setInterval(() => {
      crossfadeToTheme(getNextThemeIndex());
    }, delay);
  }

  function stopThemeAuto() {
    if (themeTimer) clearInterval(themeTimer);
    themeTimer = null;
  }

  function initThemeControls() {
    const modeBtn = document.getElementById('theme-mode');
    const prevBtn = document.getElementById('theme-prev');
    const nextBtn = document.getElementById('theme-next');
    if (!modeBtn) return;
    modeBtn.addEventListener('click', () => {
      themeAuto = !themeAuto;
      modeBtn.textContent = themeAuto ? 'Theme' : 'Theme (Manual)';
      prevBtn.style.display = themeAuto ? 'none' : 'inline-block';
      nextBtn.style.display = themeAuto ? 'none' : 'inline-block';
      if (themeAuto) startThemeAuto();
      else stopThemeAuto();
    });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopThemeAuto(); crossfadeToTheme((currentTheme - 1 + 5) % 5); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopThemeAuto(); crossfadeToTheme(getNextThemeIndex()); });
    if (themeAuto) startThemeAuto();
  }

  // ========== Spotlight (cursor, RAF-throttled) ==========
  function initSpotlight() {
    if (prefersReducedMotion || !spotlightEl) return;
    let x = 0.5, y = 0.5;
    let pending = false;
    function onMove(e) {
      x = e.clientX / window.innerWidth;
      y = e.clientY / window.innerHeight;
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          spotlightEl.style.setProperty('--spot-x', (x * 100) + '%');
          spotlightEl.style.setProperty('--spot-y', (y * 100) + '%');
          pending = false;
        });
      }
    }
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchmove', (e) => { if (e.touches[0]) onMove(e.touches[0]); }, { passive: true });
    document.body.classList.add('spotlight-enabled');
  }

  // ========== Audio (volume ramp, persistence) ==========
  function loadAudioState() {
    try {
      const s = localStorage.getItem('valentineMusic');
      if (!s) return;
      const state = JSON.parse(s);
      if (state.playing && bgAudio) {
        bgAudio.currentTime = state.currentTime || 0;
        bgAudio.volume = (state.volume !== undefined ? state.volume : 30) / 100;
        bgAudio.play().catch(function() {});
        if (musicToggle) { musicToggle.setAttribute('aria-pressed', 'true'); }
      }
    } catch (e) {}
  }

  function saveAudioState() {
    try {
      if (!bgAudio) return;
      localStorage.setItem('valentineMusic', JSON.stringify({
        playing: !bgAudio.paused,
        currentTime: bgAudio.currentTime,
        volume: volumeSlider ? volumeSlider.value : 30,
      }));
    } catch (e) {}
  }

  function setVolume(val) {
    const v = Math.max(0, Math.min(100, Number(val))) / 100;
    if (bgAudio) bgAudio.volume = v;
  }

  function rampVolumeUp() {
    if (!bgAudio || !audioReady) return;
    let vol = 0;
    const step = 0.02;
    const id = setInterval(() => {
      vol += step;
      if (vol >= 0.25) { vol = 0.25; clearInterval(id); }
      bgAudio.volume = vol;
    }, 30);
  }

  function initAudio() {
    if (!bgAudio) return;
    const source = bgAudio.querySelector('source');
    if (source) source.src = AUDIO_SRC;

    bgAudio.addEventListener('canplaythrough', () => { audioReady = true; });
    bgAudio.addEventListener('error', () => {
      if (musicToggle) {
        musicToggle.disabled = true;
        musicToggle.setAttribute('title', 'Audio file could not be loaded');
      }
      if (musicPopover) musicPopover.style.display = 'none';
    });

    if (musicToggle) {
      musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (musicToggle.disabled) return;
        const isOn = musicToggle.getAttribute('aria-pressed') === 'true';
        if (isOn) {
          bgAudio.pause();
          musicToggle.setAttribute('aria-pressed', 'false');
        } else {
          bgAudio.currentTime = 0;
          setVolume(volumeSlider ? volumeSlider.value : 30);
          bgAudio.play().then(() => {
            rampVolumeUp();
            musicToggle.setAttribute('aria-pressed', 'true');
          }).catch(() => {});
        }
        saveAudioState();
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        setVolume(volumeSlider.value);
        saveAudioState();
      });
    }

    document.addEventListener('click', (e) => {
      if (musicPopover && musicToggle && !musicPopover.contains(e.target) && !musicToggle.contains(e.target)) {
        musicPopover.classList.remove('open');
      }
    });
    if (musicToggle && musicPopover) {
      musicToggle.addEventListener('click', () => {
        if (musicToggle.disabled) return;
        musicPopover.classList.toggle('open');
      });
    }

    var saveInterval = setInterval(function () {
      if (document.visibilityState !== 'hidden') saveAudioState();
    }, 2000);
    loadAudioState();
  }

  // ========== Scroll reveal ==========
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  // ========== Love lines (from config, ink reveal) ==========
  function initLoveLines() {
    if (!loveLinesList || !CONFIG.loveLines.length) return;
    loveLinesList.innerHTML = '';
    CONFIG.loveLines.forEach((text) => {
      const p = document.createElement('p');
      p.className = 'love-lines__line reveal';
      p.textContent = text;
      loveLinesList.appendChild(p);
    });
  }

  // ========== Reasons grid ==========
  function initReasonsGrid() {
    if (!reasonsGrid || !CONFIG.reasons.length) return;
    reasonsGrid.innerHTML = '';
    CONFIG.reasons.forEach((text, i) => {
      const card = document.createElement('div');
      card.className = 'reasons__card reveal';
      if (i % 3 === 0) card.classList.add('breathing');
      card.textContent = text;
      reasonsGrid.appendChild(card);
    });
    initReasonsObservers();
    initCardTiltAndGlow();
  }

  function initReasonsObservers() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('reveal--visible'));
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );
    reasonsGrid.querySelectorAll('.reasons__card').forEach((c) => observer.observe(c));
  }

  function initCardTiltAndGlow() {
    const cards = reasonsGrid.querySelectorAll('.reasons__card');
    if (!cards.length) return;
    let ticking = false;
    let lastMouse = { x: 0, y: 0 };
    function onPointerMove(e) {
      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = lastMouse.x - cx;
            const dy = lastMouse.y - cy;
            const dist = Math.hypot(dx, dy);
            const inRange = dist < 120;
            card.classList.toggle('glow', inRange);
            if (window.matchMedia('(hover: hover)').matches && inRange) {
              const tiltX = (dy / 40) * -1;
              const tiltY = dx / 40;
              card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            }
          });
        });
      }
    }
    function onPointerLeave() {
      cards.forEach((c) => { c.classList.remove('glow'); c.style.transform = ''; });
    }
    document.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('touchmove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
  }

  // ========== Timeline ==========
  function initTimeline() {
    const track = document.getElementById('timeline-track');
    if (!track) return;
    const mq = window.matchMedia('(min-width: 900px)');
    function update() { track.classList.toggle('timeline__track--horizontal', mq.matches); }
    mq.addEventListener('change', update);
    update();
  }

  // ========== Particle count by performance ==========
  function getParticleCount() {
    if (prefersReducedMotion) return 0;
    if (CONFIG.performanceMode === 'low') return 6;
    if (CONFIG.performanceMode === 'high') return isMobile ? 20 : 32;
    return isMobile ? 12 : 24;
  }

  // ========== Canvas particles ==========
  function initParticles() {
    const count = getParticleCount();
    if (!particleCanvas || count === 0) return;
    const canvas = document.createElement('canvas');
    particleCanvas.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0;
    let pointer = { x: 0, y: 0 };
    const particles = [];

    function resize() {
      width = particleCanvas.offsetWidth;
      height = particleCanvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }
    function onResize() {
      resize();
      if (particles.length === 0) {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 4 + Math.random() * 6,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            opacity: 0.12 + Math.random() * 0.18,
          });
        }
      }
    }

    particleCanvas.addEventListener('mousemove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    particleCanvas.addEventListener('touchmove', (e) => { if (e.touches[0]) { pointer.x = e.touches[0].clientX; pointer.y = e.touches[0].clientY; } }, { passive: true });
    window.addEventListener('resize', onResize);

    function loop() {
      if (!ctx || !width || !height) { requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, width, height);
      const opacityMult = endingVisible ? 0.25 : 1;
      const influence = 0.02;
      particles.forEach((p) => {
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200 && dist > 0) {
          const f = ((200 - dist) / 200) * influence;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 140, 130, ${p.opacity * opacityMult})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    resize();
    onResize();
    requestAnimationFrame(loop);
  }

  // ========== Confetti hearts ==========
  function runConfettiHearts() {
    if (prefersReducedMotion || !confettiContainer) return;
    const hearts = ['♥', '💕', '💗', '❤️', '💖'];
    const duration = 1500;
    const start = performance.now();
    function spawn() {
      if (performance.now() - start > duration) return;
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('span');
        el.className = 'confetti-heart';
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-20px';
        el.style.setProperty('--dx', (Math.random() - 0.5) * 400 + 'px');
        el.style.setProperty('--dy', 400 + Math.random() * 300 + 'px');
        el.style.setProperty('--r', Math.random() * 360 + 'deg');
        el.style.animationDuration = 1.2 + Math.random() * 0.6 + 's';
        confettiContainer.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      }
      requestAnimationFrame(spawn);
    }
    requestAnimationFrame(spawn);
  }

  // ========== Firefly sparkles (2s) ==========
  function runFireflySparkles() {
    if (prefersReducedMotion || !fireflyContainer) return;
    const count = 15;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('span');
        el.className = 'firefly';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 100 + 'vh';
        el.style.setProperty('--fx', (Math.random() - 0.5) * 60 + 'px');
        el.style.setProperty('--fy', (Math.random() - 0.5) * 60 + 'px');
        fireflyContainer.appendChild(el);
        setTimeout(() => el.remove(), 2200);
      }, i * 80);
    }
  }

  // ========== GIF modal (load GIF only on open) ==========
  function showGifModal() {
    var dataSrc = gifImg && gifImg.getAttribute('data-src');
    if (gifImg && dataSrc && gifImg.src.indexOf('data:') === 0) gifImg.src = dataSrc;
    if (gifModal) gifModal.classList.add('open');
  }
  function hideGifModal() {
    if (gifModal) gifModal.classList.remove('open');
  }
  if (gifClose) gifClose.addEventListener('click', hideGifModal);
  if (gifModal) gifModal.addEventListener('click', (e) => { if (e.target === gifModal) hideGifModal(); });
  if (gifImg) gifImg.addEventListener('error', () => { hideGifModal(); });

  // ========== Proposal: Yes vs Always ==========
  function showProposalResponse(message) {
    if (!proposalResponse || !proposalResponseText) return;
    proposalResponseText.textContent = message;
    proposalResponse.hidden = false;
    proposalResponse.classList.add('shake');
    if (replayBtn) replayBtn.style.display = 'block';
    setTimeout(() => proposalResponse.classList.remove('shake'), 600);
  }

  function onYesClick(ev) {
    runConfettiHearts();
    showGifModal();
    showProposalResponse(CONFIG.yesMessage);
    runFireflySparkles();
    addRipple(document.getElementById('btn-yes'), ev);
  }

  function onAlwaysClick(ev) {
    runConfettiHearts();
    showProposalResponse(CONFIG.alwaysMessage);
    addRipple(document.getElementById('btn-always'), ev);
  }

  function initProposalButtons() {
    const btnYes = document.getElementById('btn-yes');
    const btnAlways = document.getElementById('btn-always');
    if (btnYes) btnYes.addEventListener('click', (ev) => onYesClick(ev));
    if (btnAlways) btnAlways.addEventListener('click', (ev) => onAlwaysClick(ev));
    if (replayBtn) replayBtn.addEventListener('click', () => { runConfettiHearts(); runFireflySparkles(); proposalResponse.classList.remove('shake'); requestAnimationFrame(() => proposalResponse.classList.add('shake')); setTimeout(() => proposalResponse.classList.remove('shake'), 600); });
    if (replayInline) replayInline.addEventListener('click', () => { runConfettiHearts(); runFireflySparkles(); });
  }

  function addRipple(button, ev) {
    if (!button || !ev) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (ev.clientX - rect.left) + 'px';
    ripple.style.top = (ev.clientY - rect.top) + 'px';
    ripple.style.width = ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    button.style.position = 'relative';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // ========== Magnetic buttons (RAF-throttled) ==========
  function initMagneticButtons() {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      var pending = false;
      var lastX = 0, lastY = 0;
      function update() {
        var rect = btn.getBoundingClientRect();
        var dx = (lastX - rect.left - rect.width / 2) * 0.15;
        var dy = (lastY - rect.top - rect.height / 2) * 0.15;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        pending = false;
      }
      btn.addEventListener('mousemove', function (e) {
        lastX = e.clientX;
        lastY = e.clientY;
        if (!pending) {
          pending = true;
          requestAnimationFrame(update);
        }
      }, { passive: true });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ========== Set proposal question ==========
  function setProposalContent() {
    const q = document.getElementById('proposal-question');
    if (q && CONFIG.proposalQuestion) q.textContent = CONFIG.proposalQuestion;
  }

  // ========== Ending + particle fade ==========
  function initEndingReveal() {
    const text = document.getElementById('ending-text');
    const endingSection = document.getElementById('ending');
    if (!text) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal--visible');
            if (e.target.id === 'ending') endingVisible = true;
          } else if (e.target.id === 'ending') endingVisible = false;
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.2 }
    );
    text.classList.add('reveal');
    observer.observe(text);
    if (endingSection) observer.observe(endingSection);
  }

  // ========== Letter link (use config URL) ==========
  function initLetterLink() {
    const link = document.getElementById('proposal-letter-link');
    if (link && CONFIG.letterPageURL) link.href = CONFIG.letterPageURL;
  }

  // ========== Init ==========
  function init() {
    try {
      const t = localStorage.getItem('valentineTheme');
      if (t !== null) setTheme(parseInt(t, 10));
      else setTheme(0);
    } catch (e) { setTheme(0); }
    setProposalContent();
    initLoveLines();
    initReasonsGrid();
    initTimeline();
    initScrollReveal();
    initProposalButtons();
    initMagneticButtons();
    initParticles();
    initAudio();
    initThemeControls();
    initSpotlight();
    initEndingReveal();
    initLetterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
