/* AstronoVerse interactions: slider, mobile menu, scroll reveal, tilt, back-to-top */
(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById('hamburger');
  const mobile = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    mobile.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', mobile.classList.contains('open'));
    console.log("Burger clicked!"); // Debug
  });
});






/* ====== State ====== */

document.getElementById('btn-home').addEventListener('click', () => {
  window.location.href = 'game_menu.html';
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
};
let soundOn = true;

let current = 0;
let score = 0;
let timeLeft = 20;
let timerId = null;

const questions = [
  {
    q: "Which star is closest to Earth?",
    options: ["Sirius", "Sun", "Alpha Centauri", "Betelgeuse"],
    answer: 1,
    info: "The Sun is a G2V class star and the main energy source of the solar system."
  },
  {
    q: "Why does the Moon appear bright at night?",
    options: ["The Moon produces its own light", "The Moon reflects sunlight", "The Moon absorbs light from other stars", "Earth's atmosphere emits light"],
    answer: 1,
    info: "The Moon's surface reflects sunlight—average albedo ~0.12."
  },
  {
    q: "What phase is the Moon when the side facing Earth is completely dark?",
    options: ["Full Moon", "First Quarter", "New Moon", "Waning Moon"],
    answer: 2,
    info: "A New Moon occurs when the Moon is between Earth and the Sun."
  },
  {
    q: "Which planet has the shortest day (fastest rotation)?",
    options: ["Earth", "Jupiter", "Mars", "Uranus"],
    answer: 1,
    info: "Jupiter rotates ~9 hours 56 minutes per rotation."
  },
  {
    q: "Which constellation contains Polaris (the North Star)?",
    options: ["Ursa Minor", "Orion", "Scorpius", "Lyra"],
    answer: 0,
    info: "Polaris is the brightest star in Ursa Minor (Little Dipper)."
  },
  {
    q: "What is the outermost layer of the Sun?",
    options: ["Photosphere", "Chromosphere", "Corona", "Convection Zone"],
    answer: 2,
    info: "The corona is extremely hot (millions of K) and visible during total eclipses."
  },
  {
    q: "The Moon orbits Earth approximately every…",
    options: ["7 days", "14 days", "27.3 days", "40 days"],
    answer: 2,
    info: "The Moon's sidereal period ~27.3 days; synodic period (between full moons) ~29.5 days."
  },
  {
    q: "A 'meteor' occurs when…",
    options: ["A comet explodes in space", "A meteoroid enters Earth's atmosphere", "Asteroids collide", "A star runs out of fuel"],
    answer: 1,
    info: "Meteoroids burn up in the atmosphere—we see them as 'shooting stars'."
  },
  {
    q: "Which object is NOT a star?",
    options: ["Sirius", "Sun", "Jupiter", "Vega"],
    answer: 2,
    info: "Jupiter is a gas giant planet, not a star."
  },
  {
    q: "What is the name of the galaxy we live in?",
    options: ["Andromeda", "Milky Way", "Sombrero", "Whirlpool"],
    answer: 1,
    info: "Our solar system is located in the Orion Arm of the Milky Way Galaxy."
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
    btn.innerHTML = `<span>${opt}</span><span class="tag">A${idx+1}</span>`;
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
    clearTimer();
  }
}
function updateTimer(){ timerEl.textContent = `${timeLeft}s`; }
function clearTimer(){ if(timerId){ clearInterval(timerId); timerId = null; } }

function endQuiz(){
  show('result');
  finalScoreEl.textContent = `You scored ${score}/${questions.length}`;
  startConfetti();
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

/* ====== Confetti (simple) ====== */
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
function stopConfetti(){ confettiRunning = false; }

/* ====== Events & wiring ====== */
// Nav buttons
document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    const target = btn.getAttribute('data-target');
    if(target === 'leaderboard'){ renderBoard(); }
    show(target);
    if(target !== 'result') stopConfetti();
  });
});

// Header quick nav
document.querySelectorAll('.nav-btn[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=> playSfx(sfx.click));
});

// Start buttons
document.getElementById('btn-start').addEventListener('click', ()=>{ playSfx(sfx.click); startQuiz(); });
document.getElementById('btn-start-2').addEventListener('click', ()=>{ playSfx(sfx.click); startQuiz(); });

// Prev/Next
document.getElementById('btn-next').addEventListener('click', ()=>{ playSfx(sfx.click); nextQuestion(); });
document.getElementById('btn-prev').addEventListener('click', ()=>{ playSfx(sfx.click); prevQuestion(); });

// Retry
document.getElementById('btn-retry').addEventListener('click', ()=>{ playSfx(sfx.click); startQuiz(); });

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
});

// Clear board
document.getElementById('clear-board').addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});

// Sound toggle
let musicOn = true;      // for background music

const bgMusic = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggle-music');
const toggleSoundBtn = document.getElementById('toggle-sound');

// --- Play music automatically when page loads ---
window.addEventListener('load', ()=>{
  bgMusic.play().catch(()=>{}); // catch error if autoplay is blocked
});

// --- Music toggle button ---
toggleMusicBtn.addEventListener('click', ()=>{
  if(bgMusic.paused){
    bgMusic.play();
    musicOn = true;
    toggleMusicBtn.textContent = '🎵 Music';
  } else {
    bgMusic.pause();
    musicOn = false;
    toggleMusicBtn.textContent = '🔇 Music';
  }
});

// --- Sound effects toggle button ---
toggleSoundBtn.addEventListener('click', ()=>{
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? '🔊 Sound' : '🔈 Sound';
});

// --- Play sound effect function ---
function playSound(audio){
  if(!soundOn || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
}


// Prevent leaving quiz with running timer memory leak
window.addEventListener('beforeunload', clearTimer);
