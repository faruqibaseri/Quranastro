/* ---------- init DOM ---------- */
const SCREENS = {
  menu: document.getElementById('screen-menu'),
  levels: document.getElementById('screen-levels'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

const hudLevel = document.getElementById('hud-level');
const hudScore = document.getElementById('hud-score');
const hudTimer = document.getElementById('hud-timer');
const hudProgress = document.getElementById('hud-progress');
const targetsEl = document.getElementById('targets');
const draggablesEl = document.getElementById('draggables');

const startBtn = document.getElementById('startBtn');
const startBtn2 = document.getElementById('startBtn2');
const abortBtn = document.getElementById('abortBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const hintBtn = document.getElementById('hintBtn');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.getElementById('modalClose');

const sfxDrop = document.getElementById('sfx-drop');
const sfxWrong = document.getElementById('sfx-wrong');
const sfxClick = document.getElementById('sfx-click');
const muteBtn = document.getElementById('muteBtn');

let soundOn = true;
let level = 1;
let score = 0;
let timer = null;
let timeLeft = 30;
let totalTargets = 3;
let matched = 0;

/* ---------- sample assets & templates ---------- */
/* Prepare items per level (you may add more images in assets/) */
const ITEMS = [
  { id: 'sun', label: 'Sun', img: 'assets/sun.png' },
  { id: 'moon', label: 'Moon', img: 'assets/moon.png' },
  { id: 'star', label: 'Star', img: 'assets/star.png' },
];

/* ---------- navigation ---------- */
document.querySelectorAll('.nav-btn[data-target], [data-target]').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const t = e.currentTarget.getAttribute('data-target');
    showScreen(t);
    playClick();
    if(t === 'leaderboard') renderLeaderboard();
  });
});
startBtn.addEventListener('click', ()=> startLevel(1));
startBtn2.addEventListener('click', ()=> startLevel(1));
abortBtn.addEventListener('click', ()=> { if(confirm('Tamatkan permainan?')) { stopTimer(); showScreen('menu'); }});
shuffleBtn && shuffleBtn.addEventListener('click', ()=> spawnDraggables(true));
hintBtn && hintBtn.addEventListener('click', ()=> { timeLeft = Math.max(5, timeLeft - 5); playClick(); showModal('Hint digunakan! Masa -5s'); });

modalClose && modalClose.addEventListener('click', ()=> modal.style.display='none');
window.addEventListener('click', e=> { if(e.target === modal) modal.style.display='none'; });

muteBtn.addEventListener('click', ()=> { soundOn = !soundOn; muteBtn.textContent = soundOn ? '🔊' : '🔈'; });

function showScreen(name){
  Object.values(SCREENS).forEach(s=> s.classList.remove('active'));
  if(SCREENS[name]) SCREENS[name].classList.add('active');
}

/* ---------- game flow ---------- */
function startLevel(l=1){
  level = l;
  score = 0;
  matched = 0;
  hudLevel.textContent = level;
  hudScore.textContent = score;
  totalTargets = 3 + (level - 1); // more targets for higher level
  timeLeft = 30 - (level-1)*5; if(timeLeft < 10) timeLeft = 10;
  spawnTargets();
  spawnDraggables();
  updateProgress();
  showScreen('game');
  startTimer();
}

function spawnTargets(){
  targetsEl.innerHTML = '';
  // For variety: shuffle a copy of ITEMS, pick totalTargets (repeat with random labels)
  const pool = [];
  for(let i=0;i<totalTargets;i++){
    const it = ITEMS[i % ITEMS.length];
    pool.push({...it, uid: it.id + '-' + i});
  }
  // shuffle
  pool.sort(()=> Math.random()-0.5);
  pool.forEach(item=>{
    const t = document.createElement('div');
    t.className = 'target';
    t.dataset.accept = item.id; // which item this target accepts
    t.id = 'target-'+item.uid;
    t.innerHTML = `<div><strong>${item.label}</strong></div>`;
    targetsEl.appendChild(t);

    // allow drop
    t.addEventListener('dragover', (ev)=> ev.preventDefault());
    t.addEventListener('drop', (ev)=> onDrop(ev, t));
  });
}

function spawnDraggables(shuffle=false){
  draggablesEl.innerHTML = '';
  // create a draggable list that includes correct items + extra distractors if level high
  const list = [];
  for(let i=0;i<totalTargets;i++){
    const template = ITEMS[i % ITEMS.length];
    list.push({...template, uid: template.id + '-d' + i});
  }
  // add some distractors
  const extras = Math.min(level, 3);
  for(let e=0;e<extras;e++){
    const idx = Math.floor(Math.random()*ITEMS.length);
    const t = ITEMS[idx];
    list.push({...t, uid: t.id + '-x' + e});
  }
  if(shuffle) list.sort(()=>Math.random()-0.5);
  list.forEach(item=>{
    const d = document.createElement('div');
    d.className = 'drag-item';
    d.draggable = true;
    d.id = 'drag-'+item.uid;
    d.innerHTML = `<img src="${item.img}" alt="${item.label}" /><div style="display:none">${item.id}</div>`;
    draggablesEl.appendChild(d);
    d.addEventListener('dragstart', (ev)=> {
      ev.dataTransfer.setData('text/plain', item.id); // pass id (sun/moon/star)
      d.classList.add('dragging');
    });
    d.addEventListener('dragend', ()=> d.classList.remove('dragging'));
  });
}

/* ---------- drop handling ---------- */
function onDrop(ev, targetEl){
  ev.preventDefault();
  const draggedId = ev.dataTransfer.getData('text/plain'); // e.g. "sun"
  const accept = targetEl.dataset.accept; // e.g. "sun"
  // find draggable element by matching the hidden id inside drag item
  // simpler: we check draggedId vs accept
  if(draggedId === accept){
    // success
    targetEl.classList.add('correct');
    targetEl.innerHTML = `<div style="text-align:center"><img src="assets/${accept}.png" style="width:64px"/><div>${accept}</div></div>`;
    playSound(sfxDrop);
    score += 10 + (timeLeft); // reward speed
    hudScore.textContent = score;
    matched++;
    // remove one draggable item that matches (search)
    const el = Array.from(document.querySelectorAll('.drag-item')).find(x=> x.textContent.includes(accept));
    if(el) el.remove();
    updateProgress();
    checkLevelComplete();
  } else {
    // wrong
    targetEl.classList.add('wrong');
    playSound(sfxWrong);
    timeLeft = Math.max(3, timeLeft - 5); // penalty
    setTimeout(()=> targetEl.classList.remove('wrong'), 500);
  }
}

/* ---------- timer & progress ---------- */
function startTimer(){
  stopTimer();
  updateTimerDisplay();
  timer = setInterval(()=>{
    timeLeft--;
    updateTimerDisplay();
    if(timeLeft <= 0){
      stopTimer();
      endLevel(false);
    }
  }, 1000);
}
function stopTimer(){ if(timer){ clearInterval(timer); timer = null; } }
function updateTimerDisplay(){ hudTimer.textContent = `${timeLeft}s`; }

function updateProgress(){
  const pct = Math.round((matched / totalTargets) * 100);
  hudProgress.style.width = pct + '%';
}

/* ---------- completion ---------- */
function checkLevelComplete(){
  if(matched >= totalTargets){
    stopTimer();
    endLevel(true);
  }
}

function endLevel(success){
  // show result screen
  const text = success ? 'Tahniah! Level complete.' : 'Masa tamat / Level gagal';
  document.getElementById('result-text').textContent = text;
  document.getElementById('result-score').textContent = `Skor: ${score}`;
  showScreen('result');
  // allow save to leaderboard: attach score value
  window.currentFinalScore = score;
  // small confetti: optional (not heavy)
  startConfettiShort();
}

/* ---------- sounds ---------- */
function playSound(audio){
  if(!soundOn || !audio) return;
  audio.currentTime = 0;
  audio.play().catch(()=>{});
}
function playClick(){ playSound(sfxClick); }

/* ---------- modal util ---------- */
function showModal(txt){
  modalText.textContent = txt;
  modal.style.display = 'flex';
}

/* ---------- leaderboard (localStorage) ---------- */
const LB_KEY = 'astron_dragdrop_leaderboard_v1';
function getLeaderboard(){ try{ return JSON.parse(localStorage.getItem(LB_KEY)) || []; }catch{ return []; } }
function saveLeaderboard(arr){ localStorage.setItem(LB_KEY, JSON.stringify(arr.slice(0,10))); }
function renderLeaderboard(){
  const list = document.getElementById('leaderboardList');
  const board = getLeaderboard();
  list.innerHTML = '';
  if(board.length === 0) list.innerHTML = `<li>Belum ada skor — jadi yang pertama!</li>`;
  board.forEach((r,i)=>{
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${r.name} — ${r.score}`;
    list.appendChild(li);
  });
}
document.getElementById('clearLb').addEventListener('click', ()=>{
  if(confirm('Padam semua leaderboard?')) { localStorage.removeItem(LB_KEY); renderLeaderboard(); }
});
document.getElementById('saveScoreForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('playerName').value.trim() || 'Player';
  const board = getLeaderboard();
  board.push({name, score: window.currentFinalScore || 0});
  board.sort((a,b)=> b.score - a.score);
  saveLeaderboard(board);
  renderLeaderboard();
  showScreen('leaderboard');
});

/* ---------- small confetti (short burst) ---------- */
function startConfettiShort(){
  const layer = document.createElement('canvas');
  layer.style.position = 'absolute';
  layer.style.inset = 0;
  const rect = document.querySelector('.result-card') || document.body;
  rect.appendChild(layer);
  const ctx = layer.getContext('2d');
  layer.width = rect.clientWidth; layer.height = rect.clientHeight;
  let pieces = Array.from({length:80}).map(()=>({
    x: Math.random()*layer.width, y: Math.random()*-layer.height,
    r: Math.random()*6+4, s: Math.random()*3+1, a: Math.random()*360
  }));
  let run = true;
  (function loop(){
    if(!run) return;
    ctx.clearRect(0,0,layer.width,layer.height);
    pieces.forEach(p=>{
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a*Math.PI/180);
      ctx.fillStyle = `hsl(${(p.a*3)%360} 80% 60%)`;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      ctx.restore();
      p.y += p.s;
      p.a += 6;
      if(p.y > layer.height){ p.y = -10; p.x = Math.random()*layer.width; }
    });
    requestAnimationFrame(loop);
  })();
  setTimeout(()=> { run = false; layer.remove(); }, 1800);
}

/* ---------- simple confetti stop on navigation ---------- */
document.querySelectorAll('.nav-btn').forEach(b=> b.addEventListener('click', ()=> stopTimer()));

/* ---------- init ---------- */
showScreen('menu');
renderLeaderboard();

/* hint: prefetch assets (optional) */
const preload = ITEMS.map(i=>{
  const im = new Image(); im.src = i.img; return im;
});
