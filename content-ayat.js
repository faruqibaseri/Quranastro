/* script.js — interactive features for moon-tafsir page */
document.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elements
  const audio = document.getElementById('recitationAudio');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const audioWave = document.getElementById('audioWave');
  const tooltip = document.getElementById('tooltip');
  const arabicBox = document.getElementById('arabicBox');

  // Audio play/pause UI
  playBtn?.addEventListener('click', async () => {
    try {
      await audio.play();
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-flex';
    } catch (e) {
      // autoplay blocked; still set UI
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'inline-flex';
    }
  });
  pauseBtn?.addEventListener('click', () => {
    audio.pause();
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'inline-flex';
  });
  audio?.addEventListener('ended', () => {
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'inline-flex';
  });

  // Audio Wave (WebAudio API + Canvas)
  function setupAudioVisualizer() {
    if (!audioWave) return;
    const canvas = audioWave;
    const ctx = canvas.getContext('2d');
    function resizeCanvas(){
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (!window.AudioContext && !window.webkitAudioContext) {
      // fallback: show pulsing background
      canvas.style.background = 'linear-gradient(90deg, rgba(0,122,255,0.06), rgba(255,216,107,0.06))';
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      analyser.getByteTimeDomainData(dataArray);
      ctx.lineWidth = 2;
      ctx.strokeStyle = getComputedStyle(document.body).backgroundColor ? '#007aff' : '#007aff';
      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;
      ctx.moveTo(0, height/2);
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (height/2);
        ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    // start draw only after user interaction (due to autoplay policies)
    function resumeAndDraw() {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      draw();
      // remove listeners to avoid repeated calls
      playBtn.removeEventListener('click', resumeAndDraw);
    }
    playBtn.addEventListener('click', resumeAndDraw);
  }
  setupAudioVisualizer();

  // Tooltip on arabic word hover (desktop) & focus (keyboard)
  function positionTooltip(evt, text) {
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    const rect = evt.target.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();
    // place above the word if possible
    let left = rect.left + (rect.width/2) - (ttRect.width/2);
    if (left < 8) left = 8;
    if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
    let top = rect.top - ttRect.height - 10;
    if (top < 8) top = rect.bottom + 10; // place below if no space
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  document.querySelectorAll('.arab-word').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const meaning = el.getAttribute('data-meaning') || '—';
      positionTooltip(e, meaning);
    });
    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
    // keyboard accessibility
    el.setAttribute('tabindex', '0');
    el.addEventListener('focus', (e) => {
      const meaning = el.getAttribute('data-meaning') || '—';
      positionTooltip(e, meaning);
    });
    el.addEventListener('blur', () => {
      tooltip.style.display = 'none';
    });
    el.addEventListener('click', (e) => {
      // optional: read meaning via speechSynthesis (non-Arabic)
      const meaning = el.getAttribute('data-meaning');
      if ('speechSynthesis' in window && meaning){
        const utter = new SpeechSynthesisUtterance(meaning);
        utter.lang = 'ms-MY';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    });
  });

  // Smooth reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const ro = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        ro.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  reveals.forEach(r => ro.observe(r));

  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tabpanel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected','false');
      });
      panels.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('hidden','true');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const target = tab.dataset.target;
      const panel = document.getElementById(target);
      if (panel){
        panel.classList.add('active');
        panel.removeAttribute('hidden');
      }
    });
  });
});

const audio = document.getElementById("audioTest");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const progressBar = document.getElementById("progressBar");
const timeDisplay = document.getElementById("timeDisplay");
const progressContainer = document.querySelector(".progress-container");

function playAudio() {
  audio.play();
  playBtn.style.display = "none";
  pauseBtn.style.display = "flex";
}

function pauseAudio() {
  audio.pause();
  playBtn.style.display = "flex";
  pauseBtn.style.display = "none";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Update masa dan bar
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const total = audio.duration || 0;
  const percent = (current / total) * 100;
  progressBar.style.width = `${percent}%`;

  timeDisplay.textContent = `${formatTime(current)} / ${formatTime(total)}`;
});

// Bila habis
audio.addEventListener("ended", () => {
  playBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  progressBar.style.width = "0%";
});

// Boleh klik progress bar untuk lompat ke masa lain
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
});

/* ========= Mobile menu (basic) ========= */
const burger = document.querySelector('.hamburger');
const nav = document.querySelector('.main-nav');
burger.addEventListener('click', ()=>{
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  nav.style.display = open ? 'none' : 'flex';
});

/* ========= Init ========= */
window.addEventListener('load', ()=>{
  // default: Events
  const active = document.querySelector('.tab.is-active');
  moveInkToTab(active);
  renderCards('events');
  observeReveals();
});
window.addEventListener('resize', ()=>{
  const active = document.querySelector('.tab.is-active');
  if (active) moveInkToTab(active);
});


(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile menu */
const burger = document.getElementById('hamburger');
const mobile = document.getElementById('mobileMenu');

if (burger && mobile) {
  burger.addEventListener('click', () => {
    // Toggle menu visibility
    mobile.classList.toggle('open');
    
    // Toggle hamburger animation
    burger.classList.toggle('active');
    
    // Update accessibility attributes
    const isOpen = mobile.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);
  });
}

  /* Back to top */
  const toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', () => {
      toTop.style.display = window.scrollY > 600 ? 'block' : 'none';
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();

    // Mobile dropdown toggle
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});