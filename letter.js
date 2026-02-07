/**
 * Letter page — Envelope open, type-in reveal, theme sync, music resume.
 */

(function () {
  'use strict';

  const envelope = document.getElementById('envelope');
  const envelopeWrap = document.getElementById('envelope-wrap');
  const letterContent = document.getElementById('letter-content');
  const letterFirstLine = document.getElementById('letter-first-line');
  const letterSecondLine = document.getElementById('letter-second-line');
  const saveMomentBtn = document.getElementById('save-moment');
  const bgAudio = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  const themeOverlay = document.getElementById('theme-overlay');

  const AUDIO_SRC = 'the_mountain-valentine-317783.mp3';
  const THEME_GRADIENTS = [
    'linear-gradient(135deg, #faf8f6 0%, #f5e1e3 40%, #e8d5d2 70%, #f5f0eb 100%)',
    'linear-gradient(135deg, #f0eef8 0%, #e0d8f0 40%, #c4bce0 70%, #e8e4f4 100%)',
    'linear-gradient(135deg, #e8f4f4 0%, #c8e8e8 40%, #a8d4d4 70%, #dceeef 100%)',
    'linear-gradient(135deg, #faf6f0 0%, #f0e6d4 40%, #e8d9a8 70%, #f5efe4 100%)',
    'linear-gradient(135deg, #2a1e22 0%, #3d2a30 40%, #4a3540 70%, #2a1e22 100%)',
  ];

  // First paragraph: type-in reveal (two lines, exact text from letter)
  const firstParagraphLine1 = 'From the very first moment, the world felt gentler,';
  const firstParagraphLine2 = 'as if fate itself leaned closer and smiled.';

  // ========== Theme sync (from index) ==========
  function applyThemeFromStorage() {
    try {
      const t = localStorage.getItem('valentineTheme');
      if (t !== null) {
        const index = parseInt(t, 10);
        if (index >= 0 && index <= 4) {
          document.body.setAttribute('data-theme', String(index));
        }
      }
    } catch (e) {}
  }

  function saveTheme(index) {
    try {
      localStorage.setItem('valentineTheme', String(index));
    } catch (e) {}
  }

  applyThemeFromStorage();

  // ========== Envelope open ==========
  function openEnvelope() {
    if (!envelope || envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    envelope.setAttribute('aria-label', 'Letter opened');
    setTimeout(() => {
      if (envelopeWrap) envelopeWrap.style.display = 'none';
      if (letterContent) {
        letterContent.classList.add('visible');
        startTypeIn();
      }
    }, 600);
  }

  if (envelope) {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  // ========== Type-in reveal (first paragraph, two lines) ==========
  function startTypeIn() {
    if (!letterFirstLine) return;
    const speed = 50;
    letterFirstLine.textContent = '';
    letterFirstLine.classList.remove('done');
    if (letterSecondLine) {
      letterSecondLine.textContent = '';
      letterSecondLine.classList.remove('done');
    }

    function typeLine(el, text, onDone) {
      let i = 0;
      function typeChar() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(typeChar, speed);
        } else {
          el.classList.add('done');
          if (onDone) setTimeout(onDone, 300);
        }
      }
      typeChar();
    }

    function startSecondLine() {
      if (letterSecondLine) typeLine(letterSecondLine, firstParagraphLine2);
    }
    setTimeout(function () {
      typeLine(letterFirstLine, firstParagraphLine1, startSecondLine);
    }, 400);
  }

  // ========== Save moment (print) ==========
  if (saveMomentBtn) {
    saveMomentBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ========== Music resume ==========
  function loadAudioState() {
    try {
      const s = localStorage.getItem('valentineMusic');
      if (!s || !bgAudio) return;
      const state = JSON.parse(s);
      if (!state.playing) return;
      const source = bgAudio.querySelector('source');
      if (source) source.src = AUDIO_SRC;
      bgAudio.currentTime = state.currentTime || 0;
      bgAudio.volume = (state.volume !== undefined ? state.volume : 30) / 100;
      if (musicToggle) {
        musicToggle.style.display = 'inline-block';
        musicToggle.setAttribute('aria-pressed', 'true');
      }
      bgAudio.play().catch(function() {});
    } catch (e) {}
  }

  function initAudio() {
    if (!bgAudio) return;
    const source = bgAudio.querySelector('source');
    if (source) source.src = AUDIO_SRC;
    bgAudio.addEventListener('error', () => {
      if (musicToggle) musicToggle.style.display = 'none';
    });
    if (musicToggle) {
      musicToggle.addEventListener('click', () => {
        const isOn = musicToggle.getAttribute('aria-pressed') === 'true';
        if (isOn) {
          bgAudio.pause();
          musicToggle.setAttribute('aria-pressed', 'false');
        } else {
          bgAudio.volume = 0.25;
          bgAudio.play().then(() => musicToggle.setAttribute('aria-pressed', 'true')).catch(() => {});
        }
        try {
          localStorage.setItem('valentineMusic', JSON.stringify({
            playing: !bgAudio.paused,
            currentTime: bgAudio.currentTime,
            volume: 30,
          }));
        } catch (e) {}
      });
    }
    loadAudioState();
  }

  initAudio();

  // ========== Light particles (optional, subtle) ==========
  const particleCanvas = document.getElementById('particle-canvas');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initParticles() {
    if (!particleCanvas || prefersReducedMotion) return;
    const canvas = document.createElement('canvas');
    particleCanvas.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0;
    const particles = [];
    const count = 8;

    function resize() {
      w = particleCanvas.offsetWidth;
      h = particleCanvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    }
    function initP() {
      if (particles.length > 0) return;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 3 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          opacity: 0.08 + Math.random() * 0.1,
        });
      }
    }
    window.addEventListener('resize', () => { resize(); initP(); });

    function loop() {
      if (!ctx || !w || !h) { requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
        if (p.x <= 0 || p.x >= w) p.vx *= -1;
        if (p.y <= 0 || p.y >= h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 120, 110, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    resize();
    initP();
    requestAnimationFrame(loop);
  }

  initParticles();
})();
