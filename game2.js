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


/* ========= Elements & State ========= */

document.getElementById('btn-home').addEventListener('click', () => {
  window.location.href = 'game_menu.html';
});

const SCREENS = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};
const boardEl = document.getElementById('board');
const hud = {
  diff: document.getElementById('hud-diff'),
  moves: document.getElementById('hud-moves'),
  matches: document.getElementById('hud-matches'),
  time: document.getElementById('hud-time'),
  progress: document.getElementById('progress'),
};

const sfx = {
  flip:  document.getElementById('sfx-flip'),
  match: document.getElementById('sfx-match'),
  wrong: document.getElementById('sfx-wrong'),
  win:   document.getElementById('sfx-win'),
  click: document.getElementById('sfx-click'),
};
let soundOn = true;

const ITEMS = [
  {id:'sun',   emoji:'☀️', label:'Sun'},
  {id:'moon',  emoji:'🌙', label:'Moon'},
  {id:'star',  emoji:'⭐', label:'Star'},
  {id:'spark', emoji:'✨', label:'Spark'},
  {id:'comet', emoji:'☄️', label:'Comet'},
  {id:'earth', emoji:'🌍', label:'Earth'},
  {id:'sat',   emoji:'🛰️', label:'Satellite'},
  {id:'rocket',emoji:'🚀', label:'Rocket'},
  {id:'ring',  emoji:'🪐', label:'Planet'},
  {id:'telescope', emoji:'🔭', label:'Telescope'},
];

const DIFF_MAP = {
  easy:   8,   // 4 pairs
  medium: 12,  // 6 pairs
  hard:   16,  // 8 pairs
};

let diff = 'medium';
let deck = [];
let first = null;
let lock = false;
let moves = 0;
let matches = 0;
let totalPairs = 0;

let time = 0;
let timerId = null;

/* ========= Helpers ========= */
function show(id){
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[id].classList.add('active');
}
function playSfx(a){ if(!soundOn) return; a.currentTime=0; a.play().catch(()=>{}); }
function formatTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const r = (s%60).toString().padStart(2,'0');
  return `${m}:${r}`;
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

/* ========= Game Setup ========= */
function setupGame(selectedDiff){
  diff = selectedDiff || diff;
  const count = DIFF_MAP[diff];
  totalPairs = count/2;

  const chosen = shuffle(ITEMS.slice()).slice(0, totalPairs);
  deck = shuffle(chosen.flatMap(item => ([
    { key:item.id+'-A', id:item.id, emoji:item.emoji },
    { key:item.id+'-B', id:item.id, emoji:item.emoji },
  ])));

  first = null; lock = false; moves = 0; matches = 0; time = 0;
  hud.diff.textContent = diff.toUpperCase();
  hud.moves.textContent = '0';
  hud.matches.textContent = '0';
  hud.time.textContent = '00:00';
  hud.progress.style.width = '0%';

  boardEl.innerHTML = '';
  deck.forEach(card => {
    const tile = document.createElement('button');
    tile.className = 'card-tile';
    tile.setAttribute('aria-label', 'Card');
    tile.dataset.id = card.id;

    tile.innerHTML = `
      <div class="card-face card-front">🪄</div>
      <div class="card-face card-back">
        <span style="font-size:2.2rem">${card.emoji}</span>
      </div>
    `;
    tile.addEventListener('click', ()=> onFlip(tile));
    boardEl.appendChild(tile);
  });

  clearTimer();
  timerId = setInterval(()=>{
    time+=1; hud.time.textContent = formatTime(time);
  },1000);

  show('game');
}

function onFlip(tile){
  if(lock) return;
  if(tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

  tile.classList.add('flipped');
  playSfx(sfx.flip);

  if(!first){
    first = tile;
    return;
  }

  moves++; hud.moves.textContent = moves;
  const match = first.dataset.id === tile.dataset.id;

  if(match){
    tile.classList.add('matched');
    first.classList.add('matched');
    matches++; hud.matches.textContent = matches;
    const pct = Math.round((matches/totalPairs)*100);
    hud.progress.style.width = pct + '%';
    playSfx(sfx.match);
    first = null;

    if(matches === totalPairs){
      endGame();
    }
  }else{
    lock = true;
    tile.classList.add('wrong');
    first.classList.add('wrong');
    playSfx(sfx.wrong);
    setTimeout(()=>{
      tile.classList.remove('flipped','wrong');
      first.classList.remove('flipped','wrong');
      first = null; lock = false;
    }, 700);
  }
}

function endGame(){
  clearTimer();
  playSfx(sfx.win);
  const stats = document.getElementById('final-stats');
  stats.textContent = `You finished in ${formatTime(time)} with ${moves} moves (${diff.toUpperCase()}).`;
  startConfetti();
  show('result');
}

function clearTimer(){
  if(timerId){ clearInterval(timerId); timerId = null; }
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

/* ========= Leaderboard ========= */
const BOARD_KEY = 'astro_mixmatch_board_v1';

function initBoardStore(){
  const raw = localStorage.getItem(BOARD_KEY);
  if(!raw){
    localStorage.setItem(BOARD_KEY, JSON.stringify({easy:[], medium:[], hard:[]})); 
  }
}
function readBoard(){
  try{ return JSON.parse(localStorage.getItem(BOARD_KEY)) || {easy:[],medium:[],hard:[]}; }
  catch{ return {easy:[],medium:[],hard:[]}; }
}
function writeBoard(obj){ localStorage.setItem(BOARD_KEY, JSON.stringify(obj)); }
function addScore(name, diff, time, moves){
  const data = readBoard();
  data[diff].push({name, time, moves, date: Date.now()});
  data[diff].sort((a,b)=> a.time-b.time || a.moves-b.moves);
  data[diff] = data[diff].slice(0,10);
  writeBoard(data);
}
function renderLeaderboard(){
  const sel = document.getElementById('board-diff').value;
  const list = document.getElementById('board-list');
  const rows = readBoard()[sel];
  list.innerHTML = '';
  if(!rows || rows.length===0){
    list.innerHTML = '<li>No records yet. Be the first! 🚀</li>';
    return;
  }
  rows.forEach((r,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${r.name}</span><span>${formatTime(r.time)} • ${r.moves} moves</span>`;
    list.appendChild(li);
  });
}

/* ========= Wiring ========= */
document.querySelectorAll('[data-diff]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    setupGame(btn.getAttribute('data-diff'));
  });
});

document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    const t = btn.getAttribute('data-target');
    if(t==='leaderboard'){ renderLeaderboard(); }
    if(t!=='result') stopConfetti();
    show(t);
  });
});

document.getElementById('btn-reshuffle').addEventListener('click', ()=>{
  playSfx(sfx.click);
  setupGame(diff);
});
document.getElementById('btn-restart').addEventListener('click', ()=>{
  playSfx(sfx.click);
  setupGame(diff);
});
document.getElementById('btn-play-again').addEventListener('click', ()=>{
  playSfx(sfx.click);
  setupGame(diff);
  stopConfetti();
});

document.getElementById('save-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = (document.getElementById('player-name').value || 'Player').trim();
  addScore(name, diff, time, moves);
  renderLeaderboard();
  show('leaderboard');
  stopConfetti();
});

document.getElementById('board-diff').addEventListener('change', renderLeaderboard);

document.getElementById('clear-board').addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    writeBoard({easy:[],medium:[],hard:[]});
    renderLeaderboard();
  }
});



initBoardStore();
renderLeaderboard();

window.addEventListener('beforeunload', ()=> { if(timerId) clearInterval(timerId); });