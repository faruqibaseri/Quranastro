/* ====== Elements ====== */
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
const boardEl = document.getElementById('board');

const sfx = {
  select: document.getElementById('sfx-select'),
  found:  document.getElementById('sfx-found'),
  win:    document.getElementById('sfx-win')
};
let soundOn = true;

/* ====== Navigation ====== */
function show(screen){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screen].classList.add('active');
}
document.querySelectorAll('[data-screen]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    play(sfx.select);
    const t = btn.getAttribute('data-screen');
    if(t === 'leaderboard') renderBoard();
    show(t);
  });
});
document.getElementById('toggle-sound').addEventListener('click', (e)=>{
  soundOn = !soundOn; e.currentTarget.textContent = soundOn ? '🔊' : '🔈';
});
function play(a){ if(!soundOn) return; a.currentTime = 0; a.play().catch(()=>{}); }

/* ====== Game Data ====== */
const WORDS_BASE = [
  "SUN","MOON","STAR","STARS","ORBIT","COMET",
  "PLANET","GALAXY","NEBULA","ECLIPSE","ASTRO","LIGHT",
  "SOLAR","LUNAR","AURORA","COSMOS"
];

// Level → size & words count
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
  if(confirm('Padam semua rekod?')) localStorage.removeItem('ws_board_v1'), renderBoard();
});

/* ====== Start game ====== */
function start(){
  // read level
  const sel = document.querySelector('input[name="level"]:checked');
  level = sel ? sel.value : 'easy';

  gridSize = LEVELS[level].size;
  levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  found.clear();

  // pick words
  words = pickWords(WORDS_BASE, LEVELS[level].pick);
  // build grid
  grid = buildGrid(gridSize, words);
  renderGrid(grid);
  renderWordList(words, found);

  // reset timer
  seconds = 0; paused = false;
  if(timer) clearInterval(timer);
  timer = setInterval(tick, 1000);
  updateHUD();

  show('game');
}

/* ====== Timer ====== */
function tick(){
  if(paused) return;
  seconds++;
  updateTimeLabel();
}
function updateTimeLabel(){
  const m = String(Math.floor(seconds/60)).padStart(2,'0');
  const s = String(seconds%60).padStart(2,'0');
  timeLabel.textContent = `${m}:${s}`;
}
function togglePause(){
  paused = !paused;
  document.getElementById('btn-pause').textContent = paused ? '▶️ Resume' : '⏸️ Pause';
}

/* ====== Build grid ====== */
const DIRS = [
  [1,0],[-1,0],[0,1],[0,-1], // straight
  [1,1],[1,-1],[-1,1],[-1,-1] // diagonal
];

function buildGrid(n, words){
  // init matrix with null
  const mat = Array.from({length:n}, ()=> Array(n).fill(null));

  // place words
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

      // check path
      let ok = true;
      for(let i=0;i<len;i++){
        const x = sx + dir[0]*i, y = sy + dir[1]*i;
        const cell = mat[y][x];
        if(cell && cell !== word[i]){ ok=false; break; }
      }
      if(!ok) continue;

      // place
      for(let i=0;i<len;i++){
        const x = sx + dir[0]*i, y = sy + dir[1]*i;
        mat[y][x] = word[i];
      }
      placed = true;
    }
    if(!placed){
      console.warn('Failed placing word:', W);
    }
  }

  // fill blanks
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let y=0;y<n;y++){
    for(let x=0;x<n;x++){
      if(!mat[y][x]) mat[y][x] = A[Math.floor(Math.random()*A.length)];
    }
  }
  return mat;
}

function pickWords(pool, k){
  const arr = [...pool];
  arr.sort(()=> Math.random()-0.5);
  return arr.slice(0,k);
}

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a }

/* ====== Render grid & interactions ====== */
let dragPath = []; // [{x,y,el}]
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

  // mouse & touch handlers
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

function startSel(e){
  e.preventDefault();
  if(paused) return;
  selecting = true;
  dragPath = [];
  const cell = getCellFromEvent(e);
  if(cell) addToPath(cell);
  play(sfx.select);
}
function moveSel(e){
  if(!selecting || paused) return;
  const cell = getCellFromEvent(e);
  if(cell) addToPath(cell);
}
function endSel(){
  if(!selecting) return;
  selecting = false;
  checkPath();
  clearPathSel();
}

function addToPath(el){
  const x = +el.dataset.x, y = +el.dataset.y;
  const last = dragPath[dragPath.length-1];
  if(last && last.x===x && last.y===y) return;
  dragPath.push({x,y,el});
  el.classList.add('sel');
}

function clearPathSel(){
  dragPath.forEach(p=>p.el.classList.remove('sel'));
  dragPath = [];
}

/* ====== Validate selection ====== */
function checkPath(){
  if(dragPath.length < 2) return;

  // compute direction
  const x1 = dragPath[0].x, y1 = dragPath[0].y;
  const x2 = dragPath[dragPath.length-1].x, y2 = dragPath[dragPath.length-1].y;
  let dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
  if(dx===0 && dy===0) return;

  // rebuild straight line between endpoints
  const line = [];
  let x=x1, y=y1;
  while(true){
    line.push({x,y});
    if(x===x2 && y===y2) break;
    x += dx; y += dy;
    // if not straight/diagonal, abort
    if(Math.abs(x-x1)!==Math.abs(y-y1) && !(x===x1 || y===y1)) return;
  }

  // read letters
  const str = line.map(p=> grid[p.y][p.x]).join('');
  const rev = str.split('').reverse().join('');

  // match words
  let matched = null;
  for(const w of words){
    if(found.has(w)) continue;
    if(w===str || w===rev){ matched = w; break; }
  }

  if(matched){
    // mark found in UI
    line.forEach(p=>{
      const idx = p.y*gridSize + p.x;
      gridEl.children[idx].classList.add('found');
    });
    found.add(matched);
    renderWordList(words, found);
    play(sfx.found);
    updateHUD();

    if(found.size === words.length){
      win();
    }
  }
}

function renderWordList(list, foundSet){
  wordListEl.innerHTML = '';
  list.forEach(w=>{
    const li = document.createElement('li');
    li.className = foundSet.has(w) ? 'done' : '';
    li.innerHTML = `<span>${w}</span><span>${foundSet.has(w) ? 'FOUND' : ''}</span>`;
    wordListEl.appendChild(li);
  });
}

function updateHUD(){
  progressLabel.textContent = `${found.size}/${words.length}`;
}

/* ====== Hint ====== */
function useHint(){
  if(paused) return;
  // pick a word not found
  const remain = words.filter(w=>!found.has(w));
  if(remain.length===0) return;
  const w = remain[Math.floor(Math.random()*remain.length)];

  // search grid for first letter chain – simple reveal: highlight first letter cell temporarily
  const first = w[0];
  for(let y=0;y<gridSize;y++){
    for(let x=0;x<gridSize;x++){
      if(grid[y][x]!==first) continue;
      // flash this cell
      const idx = y*gridSize+x;
      const el = gridEl.children[idx];
      el.animate([{outline:'3px solid rgba(255,200,0,.0)'},{outline:'3px solid rgba(255,200,0,.9)'},{outline:'3px solid rgba(255,200,0,.0)'}],{duration:900});
    }
  }
  // penalty
  seconds = Math.max(0, seconds + 5);
  updateTimeLabel();
}

/* ====== Win / Result ====== */
function win(){
  clearInterval(timer);
  play(sfx.win);
  resultText.textContent = `Anda jumpa semua ${words.length} perkataan dalam ${timeLabel.textContent}!`;
  startConfetti();
  show('result');
}

/* ====== Leaderboard ====== */
const BOARD_KEY = 'ws_board_v1';
function getBoard(){
  try{ return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]'); }catch{ return []; }
}
function setBoard(arr){ localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0,10))); }
function renderBoard(){
  const data = getBoard();
  boardEl.innerHTML = '';
  if(data.length===0){ boardEl.innerHTML = '<li>Belum ada rekod. Main sekarang! 🚀</li>'; return; }
  data.sort((a,b)=> a.time - b.time);
  data.slice(0,10).forEach((r,i)=>{
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${r.name} — ${fmt(r.time)}`;
    boardEl.appendChild(li);
  });
}
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

/* ====== Confetti ====== */
let confettiRun = false;
function startConfetti(){
  const cvs = document.getElementById('confetti');
  const ctx = cvs.getContext('2d');
  const parent = cvs.parentElement;
  const {width, height} = parent.getBoundingClientRect();
  cvs.width = width; cvs.height = height;

  const pieces = Array.from({length: 140}).map(()=>({
    x: Math.random()*width, y: Math.random()*-height,
    s: Math.random()*2+1, r: Math.random()*6+4, a: Math.random()*360
  }));
  confettiRun = true;
  (function loop(){
    if(!confettiRun) return;
    ctx.clearRect(0,0,width,height);
    pieces.forEach(p=>{
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a*Math.PI/180);
      ctx.fillStyle = `hsl(${(p.a*3)%360} 80% 60%)`;
      ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
      ctx.restore();
      p.y += p.s; p.a += 6; if(p.y>height){ p.y=-10; p.x=Math.random()*width; }
    });
    requestAnimationFrame(loop);
  })();
}
function stopConfetti(){ confettiRun=false; }

/* ====== Helpers ====== */
window.addEventListener('beforeunload', ()=> timer && clearInterval(timer));
