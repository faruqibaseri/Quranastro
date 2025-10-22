/* AstronoVerse interactions: slider, mobile menu, scroll reveal, tilt, back-to-top */
(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})(); // Added () for immediate execution

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

let musicOn = true;
let soundOn = true; // Initialize soundOn

const bgMusic = document.getElementById('bg-music');

// Get all toggle buttons (desktop + mobile)
const toggleMusicBtns = document.querySelectorAll('#toggle-music-desktop, #toggle-music-mobile');
const toggleSoundBtns = document.querySelectorAll('#toggle-sound-desktop, #toggle-sound-mobile');

// --- Auto play music on page load ---
window.addEventListener('load', () => {
  bgMusic.play().catch(() => {
    console.log("Autoplay blocked. Waiting for user interaction...");
    document.body.addEventListener('click', startMusicOnce, { once: true });
  });
});

function startMusicOnce() {
  bgMusic.play().catch(() => {});
}


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




/* ====== Elements ====== */

document.getElementById('btn-home').addEventListener('click', () => {
  window.location.href = 'game_menu.html';
});

const screens = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};
const gridEl = document.getElementById('grid');
const wordListEl = document.getElementById('wordList');
const timeLabel = document.getElementById('timeLabel');
const levelLabel = document.getElementById('levelLabel');
const progressLabel = document.getElementById('progressLabel');
const resultText = document.getElementById('resultText');
const resultTitle = document.getElementById('resultTitle');
const resultBonus = document.getElementById('resultBonus');
const boardEl = document.getElementById('board');

const sfx = {
  select: document.getElementById('sfx-select'),
  found:  document.getElementById('sfx-found'),
  win:    document.getElementById('sfx-win'),
  finish: document.getElementById('sfx-finished'),
  click: document.getElementById('sfx-click'),
};
// soundOn is initialized at the top of the script

/* ====== Navigation ====== */
function show(screen){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screen].classList.add('active');
}
document.querySelectorAll('[data-screen]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSound(sfx.select);
    stopConfetti();
    const t = btn.getAttribute('data-screen');
    if(t === 'leaderboard') renderBoard();
    show(t);
  });
});

/* ====== Game Data ====== */
const WORDS_BASE = [
  "CELESTIAL","CRESCENT","GRAVITY","ECLIPSE","MANAZIL","SPHERICAL",
  "AXIS","ORBIT","HEAT","HELIUM","ASTRO","LIGHT",
  "SOLAR","LUNAR","NEUTRON","QUASARS"
];

const LEVELS = {
  easy:   { size: 10, pick: 8   },
  medium: { size: 12, pick: 10  },
  hard:   { size: 14, pick: 12  }
};

let level = 'easy';
let gridSize = 10;
let words = [];
let found = new Set();
let grid = [];
let timer = null;
let seconds = 0;
let paused = false;

/* ====== UI binds ====== */
document.getElementById('btn-start').addEventListener('click', start);
document.getElementById('btn-start-2').addEventListener('click', start);
document.getElementById('btn-hint').addEventListener('click', useHint);
document.getElementById('btn-pause').addEventListener('click', togglePause);
document.getElementById('btn-restart').addEventListener('click', start);
document.getElementById('btn-play-again').addEventListener('click', start);
document.getElementById('btn-clear-board').addEventListener('click', ()=>{
  if(confirm('Clear all leaderboard records?')) localStorage.removeItem('ws_board_v1'), renderBoard();
});


/* ====== Start game ====== */
function start(){
  const sel = document.querySelector('input[name="level"]:checked');
  level = sel ? sel.value : 'easy';

  gridSize = LEVELS[level].size;
  levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  found.clear();
  playSound(sfx.click);
  words = pickWords(WORDS_BASE, LEVELS[level].pick);
  grid = buildGrid(gridSize, words);
  renderGrid(grid);
  renderWordList(words, found);
  stopConfetti();

  seconds = 0; paused = false;
  if(timer) clearInterval(timer);
  timer = setInterval(tick, 1000);
  updateHUD();

  show('game');
}

/* ====== Timer ====== */
function tick(){ if(paused) return; seconds++; updateTimeLabel(); }
function updateTimeLabel(){ const m = String(Math.floor(seconds/60)).padStart(2,'0'); const s = String(seconds%60).padStart(2,'0'); timeLabel.textContent = `${m}:${s}`; }
function togglePause(){ paused = !paused; document.getElementById('btn-pause').textContent = paused ? '▶️ Resume' : '⏸️ Pause'; }

/* ====== Build grid ====== */
const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function buildGrid(n, words){
  const mat = Array.from({length:n}, ()=> Array(n).fill(null));
  for(const W of words){
    const word = W.toUpperCase();
    let placed = false, tries = 0;
    while(!placed && tries < 400){
      tries++;
      const dir = DIRS[Math.floor(Math.random()*DIRS.length)];
      const len = word.length;
      const sx = randInt(0, n-1), sy = randInt(0, n-1);
      const ex = sx + dir[0]*(len-1), ey = sy + dir[1]*(len-1);
      if(ex<0||ex>=n||ey<0||ey>=n) continue;

      let ok = true;
      for(let i=0;i<len;i++){
        const x = sx + dir[0]*i, y = sy + dir[1]*i;
        const cell = mat[y][x];
        if(cell && cell !== word[i]){ ok=false; break; }
      }
      if(!ok) continue;

      for(let i=0;i<len;i++){
        const x = sx + dir[0]*i, y = sy + dir[1]*i;
        mat[y][x] = word[i];
      }
      placed = true;
    }
    if(!placed) console.warn('Failed placing word:', W);
  }

  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let y=0;y<n;y++){
    for(let x=0;x<n;x++){
      if(!mat[y][x]) mat[y][x] = A[Math.floor(Math.random()*A.length)];
    }
  }
  return mat;
}
function pickWords(pool, k){ const arr = [...pool]; arr.sort(()=> Math.random()-0.5); return arr.slice(0,k); }
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a }

/* ====== Render grid & interactions ====== */
let dragPath = [];
let selecting = false;

function renderGrid(mat){
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for(let y=0;y<mat.length;y++){
    for(let x=0;x<mat.length;x++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = mat[y][x];
      cell.dataset.x = x; cell.dataset.y = y;
      gridEl.appendChild(cell);
    }
  }

  gridEl.addEventListener('mousedown', startSel);
  gridEl.addEventListener('mousemove', moveSel);
  document.addEventListener('mouseup', endSel);
  gridEl.addEventListener('touchstart', startSel, {passive:false});
  gridEl.addEventListener('touchmove', moveSel, {passive:false});
  document.addEventListener('touchend', endSel);
}

function getCellFromEvent(e){
  const target = (e.touches ? document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) : e.target);
  if(!target || !target.classList.contains('cell')) return null;
  return target;
}

function startSel(e){ e.preventDefault(); if(paused) return; selecting = true; dragPath = []; const cell = getCellFromEvent(e); if(cell) addToPath(cell); playSound(sfx.select); }
function moveSel(e){ if(!selecting || paused) return; const cell = getCellFromEvent(e); if(cell) addToPath(cell); }
function endSel(){ if(!selecting) return; selecting = false; checkPath(); clearPathSel(); }

function addToPath(el){ const x = +el.dataset.x, y = +el.dataset.y; const last = dragPath[dragPath.length-1]; if(last && last.x===x && last.y===y) return; dragPath.push({x,y,el}); el.classList.add('sel'); }
function clearPathSel(){ dragPath.forEach(p=>p.el.classList.remove('sel')); dragPath = []; }

/* ====== Validate selection ====== */
function checkPath(){
  if(dragPath.length < 2) return;

  const x1 = dragPath[0].x, y1 = dragPath[0].y;
  const x2 = dragPath[dragPath.length-1].x, y2 = dragPath[dragPath.length-1].y;
  let dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
  if(dx===0 && dy===0) return;

  const line = [];
  let x=x1, y=y1;
  
  let steps = 0;
  const maxSteps = Math.max(Math.abs(x2-x1), Math.abs(y2-y1)) + 2; 

  while(true){
    if (steps++ > maxSteps) {
      console.warn("Selection path reconstruction failed or was non-linear/too long, exiting.");
      return; 
    }

    line.push({x,y});
    if(x===x2 && y===y2) break;
    x += dx; y += dy;
    
    if(Math.abs(x-x1)!==Math.abs(y-y1) && !(x===x1 || y===y1)) return;
  }

  const str = line.map(p=> grid[p.y][p.x]).join('');
  const rev = str.split('').reverse().join('');

  let matched = null;
  for(const w of words){
    if(found.has(w)) continue;
    if(w===str || w===rev){ matched = w; break; }
  }

  if(matched){
    line.forEach(p=>{
      const idx = p.y*gridSize + p.x;
      gridEl.children[idx].classList.add('found');
    });
    found.add(matched);
    renderWordList(words, found);
    playSound(sfx.found);
    updateHUD();

    if(found.size === words.length) win();
  }
}

function renderWordList(list, foundSet){ wordListEl.innerHTML = ''; list.forEach(w=>{ const li = document.createElement('li'); li.className = foundSet.has(w) ? 'done' : ''; li.innerHTML = `<span>${w}</span><span>${foundSet.has(w) ? 'FOUND' : ''}</span>`; wordListEl.appendChild(li); }); }
function updateHUD(){ progressLabel.textContent = `${found.size}/${words.length}`; }

/* ====== Hint ====== */
function useHint(){ if(paused) return; const remain = words.filter(w=>!found.has(w)); if(remain.length===0) return; const w = remain[Math.floor(Math.random()*remain.length)];
  const first = w[0];
  for(let y=0;y<gridSize;y++){
    for(let x=0;x<gridSize;x++){
      if(grid[y][x]!==first) continue;
      const idx = y*gridSize+x; const el = gridEl.children[idx];
      el.animate([{outline:'3px solid rgba(255,200,0,.0)'},{outline:'3px solid rgba(255,200,0,.9)'},{outline:'3px solid rgba(255,200,0,.0)'}],{duration:900});
    }
  }
  seconds = Math.max(0, seconds + 5);
  updateTimeLabel();
}

/* ====== Win / Result ====== */
const MESSAGES = [
  'Amazing! You are a cosmic word hunter! ✨',
  'Stellar job — the universe applauds! 🌟',
  'Brilliant! You found every star in the grid! 🚀',
  'You orbit success — well done! 🪐'
];

function win(){
  clearInterval(timer);
  playSound(sfx.win);
  playSound(sfx.finish);
  const msg = MESSAGES[Math.floor(Math.random()*MESSAGES.length)];
  resultTitle.textContent = '🎉 Well done!';
  resultText.textContent = `You found all ${words.length} words in ${timeLabel.textContent}!`;

  // bonus text for speed
  const bestTime = Math.min(9999, seconds);
  if(seconds <= (words.length * 6)){
    resultBonus.textContent = 'Speed bonus unlocked! Badge: FAST FINDER ⚡';
  } else if(seconds <= (words.length * 9)){
    resultBonus.textContent = 'Great pace! Keep going — Badge: EXPLORER ✨';
  } else { resultBonus.textContent = msg; }

  startConfetti();
  show('result');
}

/* ====== Leaderboard ====== */
const BOARD_KEY = 'ws_board_v1';
function getBoard(){ try{ return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]'); }catch{ return []; } }
function setBoard(arr){ localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0,10))); }
function renderBoard(){ const data = getBoard(); boardEl.innerHTML = ''; if(data.length===0){ boardEl.innerHTML = '<li>No records yet. Play now! 🚀</li>'; return; } data.sort((a,b)=> a.time - b.time); data.slice(0,10).forEach((r,i)=>{ const li = document.createElement('li'); li.textContent = `${i+1}. ${r.name} — ${fmt(r.time)}`; boardEl.appendChild(li); }); }
function fmt(s){ const m=String(Math.floor(s/60)).padStart(2,'0'); const sec=String(s%60).padStart(2,'0'); return `${m}:${sec}`; }

document.getElementById('saveForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('playerName').value.trim() || 'Player';
  const board = getBoard();
  board.push({name, time: seconds});
  board.sort((a,b)=> a.time - b.time);
  setBoard(board);
  renderBoard();
  show('leaderboard');
  stopConfetti();
});

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

window.addEventListener('beforeunload', ()=> timer && clearInterval(timer));