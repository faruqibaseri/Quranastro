/* ====== Elements & State ====== */

document.getElementById('btn-home').addEventListener('click', () => {
  window.location.href = 'index.html';
});

const SCREENS = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

const hudTargets = document.getElementById('hudTargets');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const trayEl = document.getElementById('tray');

const sfx = {
  drop:  document.getElementById('sfx-drop'),
  wrong: document.getElementById('sfx-wrong'),
  click: document.getElementById('sfx-click'),
  win:   document.getElementById('sfx-win'),
};
let soundOn = true;

let totalSlots = 0;
let filledCorrect = 0;
let score = 0;
let seconds = 60;
let timer = null;

const ITEMS = [
  { id:'moon',   label:'Moon',   img:'assets/moon.png'   },
  { id:'star',   label:'Star',   img:'assets/star.png'   },
  { id:'planet', label:'Planet', img:'assets/planet.png' }
];

/* ====== Navigation ====== */
function show(id){
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[id].classList.add('active');
}
function playSfx(a){ if(!soundOn) return; a.currentTime=0; a.play().catch(()=>{}); }

document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    const t = btn.getAttribute('data-target');
    if(t === 'leaderboard') renderBoard();
    show(t);
    if(t !== 'result') stopConfetti();
  });
});

document.getElementById('btn-start').addEventListener('click', ()=>{ playSfx(sfx.click); startGame(); });
document.getElementById('btn-start-2').addEventListener('click', ()=>{ playSfx(sfx.click); startGame(); });
document.getElementById('btn-play-again').addEventListener('click', ()=>{ playSfx(sfx.click); startGame(); });

document.getElementById('btn-restart').addEventListener('click', ()=>{ playSfx(sfx.click); startGame(); });
document.getElementById('btn-shuffle').addEventListener('click', ()=>{ playSfx(sfx.click); buildTray(true); });

/* ====== Music & Sound ====== */
const bgMusic = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggle-music');
const toggleSoundBtn = document.getElementById('toggle-sound');

window.addEventListener('load', ()=>{
  bgMusic.play().catch(()=>{}); // might be blocked by autoplay policy
});
toggleMusicBtn.addEventListener('click', ()=>{
  if(bgMusic.paused){ bgMusic.play().catch(()=>{}); toggleMusicBtn.textContent='🎵 Music'; }
  else { bgMusic.pause(); toggleMusicBtn.textContent='🔇 Music'; }
});
toggleSoundBtn.addEventListener('click', ()=>{
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? '🔊 Sound' : '🔈 Sound';
});

/* ====== Game Setup ====== */
function startGame(){
  // reset state
  filledCorrect = 0;
  score = 0; scoreEl.textContent = score;
  seconds = 60; updateTimer();
  progressEl.style.width = '0%';

  // clear any filled slots
  document.querySelectorAll('.slot').forEach(s=>{
    s.classList.remove('correct','wrong');
    s.innerHTML = '';
    s.dataset.filled = '0';
  });

  // target counts
  totalSlots = document.querySelectorAll('.slot').length;
  hudTargets.textContent = `${filledCorrect}/${totalSlots}`;

  // build tray items (equal to needed + a few extras)
  buildTray();

  // start timer
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{
    seconds--;
    updateTimer();
    if(seconds<=0){ clearInterval(timer); endGame(false); }
  },1000);

  show('game');
}

function buildTray(shuffle=false){
  trayEl.innerHTML = '';
  // 2 moons, 2 stars, 2 planets (to match slots)
  const list = [
    { ...ITEMS[0] }, { ...ITEMS[0] },
    { ...ITEMS[1] }, { ...ITEMS[1] },
    { ...ITEMS[2] }, { ...ITEMS[2] },
  ];
  // Add 2 distractors (random)
  for(let i=0;i<2;i++){
    const r = ITEMS[Math.floor(Math.random()*ITEMS.length)];
    list.push({...r});
  }
  if(shuffle) list.sort(()=>Math.random()-0.5);

  list.forEach((it, idx)=>{
    const d = document.createElement('div');
    d.className = 'draggable';
    d.draggable = true;
    d.dataset.type = it.id;
    d.innerHTML = `
      <img src="${it.img}" alt="${it.label}">
      <span class="tag">${it.label}</span>
    `;
    trayEl.appendChild(d);

    // HTML5 drag
    d.addEventListener('dragstart', (ev)=>{
      ev.dataTransfer.setData('text/plain', it.id);
      d.classList.add('dragging');
    });
    d.addEventListener('dragend', ()=> d.classList.remove('dragging'));

    // Touch fallback (pointer)
    d.addEventListener('touchstart', (e)=> startTouchDrag(e, d), {passive:false});
  });

  // enable drop on slots
  document.querySelectorAll('.slot').forEach(slot=>{
    slot.addEventListener('dragover', (ev)=> ev.preventDefault());
    slot.addEventListener('drop', (ev)=> {
      const type = ev.dataTransfer.getData('text/plain');
      handleDrop(slot, type);
    });
  });
}

/* ====== Touch drag fallback ====== */
let ghost = null;
let draggingEl = null;

function startTouchDrag(e, el){
  e.preventDefault();
  draggingEl = el;
  // create ghost
  ghost = el.cloneNode(true);
  ghost.style.position='fixed';
  ghost.style.pointerEvents='none';
  ghost.style.opacity='0.9';
  ghost.style.zIndex='9999';
  ghost.style.transform='scale(.95)';
  document.body.appendChild(ghost);
  moveGhost(e.touches[0].clientX, e.touches[0].clientY);
  window.addEventListener('touchmove', onTouchMove, {passive:false});
  window.addEventListener('touchend', onTouchEnd);
}
function onTouchMove(e){
  e.preventDefault();
  moveGhost(e.touches[0].clientX, e.touches[0].clientY);
}
function onTouchEnd(e){
  const t = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(t.clientX, t.clientY);
  if(dropTarget){
    const slot = dropTarget.closest('.slot');
    if(slot){
      handleDrop(slot, draggingEl.dataset.type);
    }
  }
  cleanupGhost();
}
function moveGhost(x,y){
  const rect = ghost.getBoundingClientRect();
  ghost.style.left = (x - rect.width/2) + 'px';
  ghost.style.top = (y - rect.height/2) + 'px';
}
function cleanupGhost(){
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  if(ghost){ ghost.remove(); ghost=null; }
  draggingEl = null;
}

/* ====== Drop logic ====== */
function handleDrop(slot, type){
  if(slot.dataset.filled === '1') return; // already filled

  const accept = slot.dataset.accept; // moon/star/planet
  if(type === accept){
    // success
    slot.dataset.filled = '1';
    slot.classList.remove('wrong');
    slot.classList.add('correct');
    slot.innerHTML = renderPlaced(type);
    playSfx(sfx.drop);

    filledCorrect++;
    hudTargets.textContent = `${filledCorrect}/${totalSlots}`;
    score += 10 + Math.max(0, seconds); // time bonus
    scoreEl.textContent = score;

    // remove one matching item from tray
    const match = Array.from(trayEl.children).find(el=> el.dataset.type===type);
    if(match) match.remove();

    updateProgress();
    if(filledCorrect === totalSlots){
      clearInterval(timer);
      endGame(true);
    }
  }else{
    // wrong
    slot.classList.add('wrong');
    playSfx(sfx.wrong);
    seconds = Math.max(0, seconds - 5);
    updateTimer();
    setTimeout(()=> slot.classList.remove('wrong'), 350);
  }
}

function renderPlaced(type){
  const it = ITEMS.find(x=>x.id===type);
  return `<img src="${it.img}" alt="${it.label}" style="width:40px;height:40px">`;
}

/* ====== Timer/Progress ====== */
function updateTimer(){ timerEl.textContent = `${seconds}s`; }
function updateProgress(){
  const pct = Math.round((filledCorrect/totalSlots)*100);
  progressEl.style.width = pct + '%';
}

/* ====== End / Result ====== */
function endGame(success){
  playSfx(sfx.win);
  const final = document.getElementById('final-score');
  final.textContent = success
    ? `Score: ${score} — Perfect orbit!`
    : `Score: ${score} — Time's up!`;
  startConfetti();
  show('result');
  window.__finalScore = score;
}

/* ====== Leaderboard ====== */
const BOARD_KEY = 'astro_orbit_board_v1';

function getBoard(){
  try{ return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]'); }
  catch{ return []; }
}
function setBoard(arr){
  localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0,10)));
}
function renderBoard(){
  const list = document.getElementById('board-list');
  const data = getBoard().slice().sort((a,b)=> b.score - a.score).slice(0,10);
  list.innerHTML = '';
  if(data.length===0){ list.innerHTML = '<li>No scores yet. Be the first! 🚀</li>'; return; }
  data.forEach((r,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${r.name}</span><span>${r.score}</span>`;
    list.appendChild(li);
  });
}

document.getElementById('save-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = (document.getElementById('player-name').value || 'Player').trim();
  const board = getBoard();
  board.push({name, score: window.__finalScore || 0});
  board.sort((a,b)=> b.score - a.score);
  setBoard(board);
  renderBoard();
  show('leaderboard');
  stopConfetti();
});

document.getElementById('clear-board').addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});

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

/* ====== Misc ====== */
window.addEventListener('beforeunload', ()=> timer && clearInterval(timer));
renderBoard(); // initial
