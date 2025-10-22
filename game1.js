/* AstronoVerse interactions: slider, mobile menu, scroll reveal, tilt, back-to-top */
(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // Toggle mobile menu
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  });

  // Close menu when clicking any nav link (except sound/music toggles)
  mobileMenu.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('nav__link') &&
      !e.target.id.includes('toggle-')
    ) {
      mobileMenu.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', false);
    }
  });
});


// === Sound & Music Controls ===

window.addEventListener('load', () => {
  bgMusic.play().catch(() => {
    console.log("Autoplay blocked. Waiting for user interaction...");
    document.body.addEventListener('click', startMusicOnce, { once: true });
  });
});

function startMusicOnce() {
  bgMusic.play().catch(() => {});
}


let musicOn = true;

const bgMusic = document.getElementById('bg-music');

// Get all toggle buttons (desktop + mobile)
const toggleMusicBtns = document.querySelectorAll('#toggle-music-desktop, #toggle-music-mobile');
const toggleSoundBtns = document.querySelectorAll('#toggle-sound-desktop, #toggle-sound-mobile');

// --- Auto play music on page load ---
window.addEventListener('load', () => {
  bgMusic.play().catch(() => {}); // Catch autoplay block
});

// --- Music toggle (both desktop & mobile) ---
toggleMusicBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicOn = true;
      updateMusicButtons('🎵 Music');
    } else {
      bgMusic.pause();
      musicOn = false;
      updateMusicButtons('🔇 Music');
    }
  });
});

// --- Sound toggle (both desktop & mobile) ---
toggleSoundBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    updateSoundButtons(soundOn ? '🔊 Sound' : '🔈 Sound');
  });
});

// --- Helper functions to sync button text ---
function updateMusicButtons(text) {
  toggleMusicBtns.forEach(btn => btn.textContent = text);
}

function updateSoundButtons(text) {
  toggleSoundBtns.forEach(btn => btn.textContent = text);
}

// --- Play sound effect function ---
function playSound(audio) {
  if (!soundOn || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

/* ====== State ====== */

document.getElementById('btn-home').addEventListener('click', () => {
  window.location.href = 'game_menu.html';
  stopGameFinishedSound();
});

const SCREENS = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

const questionEl = document.getElementById('question');
const optionsEl  = document.getElementById('options');
const infoEl     = document.getElementById('info');
const qIndexEl   = document.getElementById('qIndex');
const scoreEl    = document.getElementById('score');
const timerEl    = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const finalScoreEl = document.getElementById('final-score');

const sfx = {
  correct: document.getElementById('sfx-correct'),
  wrong:   document.getElementById('sfx-wrong'),
  click:   document.getElementById('sfx-click'),
  applause: document.getElementById('applause-sound'),
  finished: document.getElementById('game-finished'),
  next: document.getElementById('sfx-next'),
  prev: document.getElementById('sfx-prev'),
  start: document.getElementById('sfx-start'),
};
let soundOn = true;

let current = 0;
let score = 0;
let timeLeft = 20;
let timerId = null;

const questions = [
  {
    q: "Which chapter (Surah) of the Qur'an mentions the phases of the Moon, stating that it returns to look like an old dried date-stalk?",
    options: ["Surah Al-Fussilat", "Surah Yasin", "Surah Al-A'raf", "Surah Az-Zumar"],
    answer: 1,
    info: "Surah Yasin mentions the phases of the Moon, describing how it changes shape until it looks like an old curved date stalk."
  },
  {
    q: "According to the Qur'an, which celestial body produces its own light (Ḍiyā’)?",
    options: ["The Moon", "The Stars", "The Sun", "The Earth"],
    answer: 2,
    info: "The Sun produces its own light (ḍiyā’) and is the main source of light and energy for the solar system."
  },
  {
    q: "The phenomenon of Day and Night is a result of the Earth doing what?",
    options: ["Orbiting the Sun", "Rotating on its axis", "Moving towards the Hercules constellation", "Moving towards the center of the Milky Way"],
    answer: 1,
    info: "The Earth rotates on its axis, causing the change between day and night."
  },
  {
    q: "The Qur'an states that the Sun and the Moon were created to help humans determine what?",
    options: ["The speed of light", "The colour spectrum", "The number of years and calculations (time)", "The structure of the Earth"],
    answer: 2,
    info: "The Sun and the Moon help humans determine the number of years and measure time for calendars and calculations."
  },
  {
    q: "The Moon is described as having 'Nūr' (sinaran/light). What does Nūr refer to?",
    options: ["Light produced by nuclear fusion", "Light that pierces space", "Reflected light from an object that does not burn", "Light that causes shadows"],
    answer: 2,
    info: "Nūr refers to reflected light that comes from an object which does not produce its own light."
  },
  {
    q: "The Tafsir Munir mentions that the specific paths/stations (manāzil) that the Moon travels through total how many?",
    options: ["Six", "Twelve", "Twenty-eight", "One hundred"],
    answer: 2,
    info: "The Moon passes through twenty-eight (28) stations or phases in its monthly orbit around the Earth."
  },
  {
    q: "The Arabic word 'Yukawwiru' (يُكَوِّرُ) used to describe the Day and Night coiling over each other (Az-Zumar: 5) subtly hints at the Earth having what shape?",
    options: ["Flat", "Cone-shaped", "Square", "Spherical (or round)"],
    answer: 3,
    info: "The word “Yukawwiru” suggests that the Earth is spherical (round), as day and night wrap around it like a ball."
  },
  {
    q: "Which term is used in the Qur'an to describe a star that 'pierces (with its light)'?",
    options: ["Al-Falak (The Orbit)", "An-Najm ath-Thāqib (The Piercing Star)", "Al-Qamar (The Moon)", "As-Sabḥ (The Swimming)"],
    answer: 1,
    info: "The term An-Najm ath-Thāqib means “The Piercing Star”, describing a star whose light shines brightly through darkness."
  },
  {
    q: "What is the main function of the Night as described in the Qur'an?",
    options: ["Time for work", "Time for seeking knowledge", "Time for travel", "Time for rest and tranquility"],
    answer: 3,
    info: "The Night is described as a time for rest and tranquility, allowing living beings to recover energy and find peace."
  },
  {
    q: "The phrase ‘كُلٌّ فِي فَلَكٍ يَسْبَحُونَ’ (Al-Anbiya: 33) states that the Sun, Moon, and other celestial bodies are each doing what in their orbits (falak)?",
    options: ["Standing still", "Rotating", "Floating/moving in their own orbits", "Cooling down"],
    answer: 2,
    info: "The Sun, Moon, and other celestial bodies are described as moving in their own orbits, each following a precise and balanced path."
  }
];

/* ====== Navigation helpers ====== */
function show(id){
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[id].classList.add('active');
}
function playSfx(aud){ if(!soundOn) return; aud.currentTime = 0; aud.play().catch(()=>{}); }

/* ====== Quiz flow ====== */
function startQuiz(){
  current = 0; score = 0; scoreEl.textContent = score;
  updateProgress();
  loadQuestion();
  show('quiz');
}

function loadQuestion(){
  clearTimer();
  timeLeft = 20; updateTimer();
  timerId = setInterval(tick, 1000);

  const q = questions[current];
  qIndexEl.textContent = `${current+1}/${questions.length}`;
  questionEl.textContent = q.q;
  infoEl.textContent = '';
  optionsEl.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.innerHTML = `<span>${opt}</span>`;
    btn.addEventListener('click', ()=> selectAnswer(idx));
    optionsEl.appendChild(btn);
  });

  document.getElementById('btn-prev').disabled = current === 0;
}

function selectAnswer(idx){
  const q = questions[current];
  const opts = Array.from(document.querySelectorAll('.option'));
  opts.forEach(o => o.classList.add('disabled'));

  if(idx === q.answer){
    opts[idx].classList.add('correct');
    score++; scoreEl.textContent = score;
    playSfx(sfx.correct);
    infoEl.textContent = '✅ Correct! ' + q.info;
  }else{
    opts[idx].classList.add('wrong');
    opts[q.answer].classList.add('correct');
    playSfx(sfx.wrong);
    infoEl.textContent = '❌ Wrong. Correct answer: ' + q.options[q.answer] + '. ' + q.info;
  }
  clearTimer();
}

function nextQuestion(){
  if(current < questions.length - 1){
    current++;
    updateProgress();
    loadQuestion();
  }else{
    endQuiz();
  }
}
function prevQuestion(){
  if(current > 0){
    current--;
    updateProgress();
    loadQuestion();
  }
}

function updateProgress(){
  const pct = Math.round((current / questions.length) * 100);
  progressEl.style.width = `${pct}%`;
}

function tick(){
  timeLeft--;
  updateTimer();
  if(timeLeft <= 0){
    // Auto reveal correct + move on
    const q = questions[current];
    const opts = Array.from(document.querySelectorAll('.option'));
    opts.forEach(o => o.classList.add('disabled'));
    opts[q.answer].classList.add('correct');
    infoEl.textContent = '⏱️ Time\'s up! Answer: ' + q.options[q.answer] + '. ' + q.info;
    playSfx(sfx.wrong),
    clearTimer();
  }
}
function updateTimer(){ timerEl.textContent = `${timeLeft}s`; }
function clearTimer(){ if(timerId){ clearInterval(timerId); timerId = null; } }

function endQuiz() {
  show('result');
  finalScoreEl.textContent = `You scored ${score}/${questions.length}`;
playSfx(sfx.applause);
playSfx(sfx.finished);

  // Start confetti slightly after
  setTimeout(startConfetti, 500);
}

function stopGameFinishedSound() {
  const gameFinishedSound = document.getElementById('game-finished');
  if (gameFinishedSound) {
    gameFinishedSound.pause();
    gameFinishedSound.currentTime = 0;
  }
}

function stopApplauseSound() {
  const applause = document.getElementById('applause-sound');
  if (applause) {
    applause.pause();
    applause.removeAttribute('src');
    applause.load();
  }
}






/* ====== Leaderboard ====== */
const BOARD_KEY = 'astro_quiz_board_v1';

function getBoard(){
  try{
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{ return []; }
}
function setBoard(arr){
  localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0, 10)));
}
function renderBoard(){
  const board = getBoard().slice(0,10);
  const list = document.getElementById('board');
  list.innerHTML = '';
  if(board.length === 0){
    list.innerHTML = `<li>No scores yet. Be the first! 🚀</li>`;
    return;
  }
  board.forEach((row,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${row.name}</span><span>${row.score}</span>`;
    list.appendChild(li);
  });
}

/* ====== confettis (simple) ====== */
let confettiRunning = false;
function startConfetti(){
  const cvs = document.getElementById('confetti');
  const ctx = cvs.getContext('2d');
  const parent = cvs.parentElement;
  const {width, height} = parent.getBoundingClientRect();
  cvs.width = width; cvs.height = height;

  const pieces = Array.from({length: 120}).map(() => ({
    x: Math.random()*width,
    y: Math.random()*-height,
    r: Math.random()*6+4,
    s: Math.random()*2+1,
    a: Math.random()*360,
  }));

  confettiRunning = true;
  (function loop(){
    if(!confettiRunning) return;
    ctx.clearRect(0,0,width,height);
    pieces.forEach(p=>{
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a*Math.PI/180);
      ctx.fillStyle = `hsl(${(p.a*3)%360} 80% 60%)`;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      ctx.restore();

      p.y += p.s;
      p.a += 6;
      if(p.y > height){ p.y = -10; p.x = Math.random()*width; }
    });
    requestAnimationFrame(loop);
  })();
}
function stopConfetti() {
  confettiRunning = false;

  const cvs = document.getElementById('confetti');
  if (cvs) {
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
  }
}


/* ====== Events & wiring ====== */
// Nav buttons
document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    const target = btn.getAttribute('data-target');
    if(target === 'leaderboard'){ renderBoard(); }
    show(target);
    if(target !== 'result') stopConfetti();
    stopGameFinishedSound();
  });
});

// Header quick nav
document.querySelectorAll('.nav-btn[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=> playSfx(sfx.click));
});

// Start buttons
document.getElementById('btn-start').addEventListener('click', ()=>{ playSfx(sfx.start); startQuiz(); });
document.getElementById('btn-start-2').addEventListener('click', ()=>{ playSfx(sfx.start); startQuiz(); });

// Prev/Next
document.getElementById('btn-next').addEventListener('click', ()=>{ playSfx(sfx.next); nextQuestion(); });
document.getElementById('btn-prev').addEventListener('click', ()=>{ playSfx(sfx.prev); prevQuestion(); });

// Retry
document.getElementById('btn-retry').addEventListener('click', ()=>{ playSfx(sfx.click); startQuiz(); stopGameFinishedSound(); stopConfetti(); stopApplauseSound});


// Save score
document.getElementById('save-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('player-name').value.trim() || 'Player';
  const board = getBoard();
  board.push({name, score});
  board.sort((a,b)=> b.score - a.score);
  setBoard(board);
  renderBoard();
  show('leaderboard');
  stopConfetti();
  stopGameFinishedSound();
});

// Clear board
document.getElementById('clear-board').addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});




// Prevent leaving quiz with running timer memory leak
window.addEventListener('beforeunload', clearTimer);
