/* ====== Init ====== */
const SCREENS = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

let score = 0;
let timeLeft = 60;
let timerId = null;
let gameRunning = false;
let basketX = 0;
const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const hudScore = document.getElementById('hud-score');
const hudTimer = document.getElementById('hud-timer');
const finalScoreEl = document.getElementById('final-score');

const ITEMS = [
  {id:'sun', img:'1. HOMEPAGE/photo/moon2.png', points:20},
  {id:'moon', img:'1. HOMEPAGE/photo/sun.jpg', points:10},
  {id:'star', img:'1. HOMEPAGE/photo/Neutron-star.jpg', points:5},
];


const fallingItems = [];

const bgMusic = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggle-music');
const toggleSoundBtn = document.getElementById('toggle-sound');
const sfx = {
  correct: document.getElementById('sfx-correct'),
  wrong: document.getElementById('sfx-wrong'),
  click: document.getElementById('sfx-click'),
};
let soundOn = true;
let musicOn = true;

/* ====== Navigation ====== */
function show(name){
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[name].classList.add('active');
}
document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSound(sfx.click);
    show(btn.getAttribute('data-target'));
  });
});
document.getElementById('btn-home').addEventListener('click', ()=> window.location.href='index.html');
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-start-2').addEventListener('click', startGame);
document.getElementById('abortBtn').addEventListener('click', ()=>{ if(confirm('Quit game?')) endGame(false); });
document.getElementById('btn-retry').addEventListener('click', startGame);

/* ====== Music / Sound Toggle ====== */
window.addEventListener('load', ()=> bgMusic.play().catch(()=>{}));

toggleMusicBtn.addEventListener('click', ()=>{
  if(bgMusic.paused){ bgMusic.play(); musicOn=true; toggleMusicBtn.textContent='🎵 Music'; }
  else{ bgMusic.pause(); musicOn=false; toggleMusicBtn.textContent='🔇 Music'; }
});

toggleSoundBtn.addEventListener('click', ()=>{
  soundOn=!soundOn;
  toggleSoundBtn.textContent = soundOn ? '🔊 Sound' : '🔈 Sound';
});
function playSound(audio){ if(!soundOn) return; audio.currentTime=0; audio.play().catch(()=>{}); }

/* ====== Game ====== */
function startGame(){
  score=0; timeLeft=60; hudScore.textContent=score; hudTimer.textContent=`${timeLeft}s`;
  basketX = gameArea.clientWidth/2 - basket.clientWidth/2;
  basket.style.left = basketX + 'px';
  show('game');
  gameRunning=true;
  fallingItems.length=0;
  spawnItems();
  timerId = setInterval(()=>{ timeLeft--; hudTimer.textContent=`${timeLeft}s`; if(timeLeft<=0) endGame(true); },1000);
  requestAnimationFrame(gameLoop);
}

function spawnItems(){
  if(!gameRunning) return;
  const item = ITEMS[Math.floor(Math.random()*ITEMS.length)];
  const el = document.createElement('img');
  el.src = item.img;
  el.className='falling-item';
  el.style.left = Math.random()*(gameArea.clientWidth-50) + 'px';
  el.style.top = '-50px';
  el.dataset.points = item.points;
  gameArea.appendChild(el);
  fallingItems.push(el);
  setTimeout(spawnItems, 800 - Math.min(score*3,500)); // faster spawn as score increases
}

function gameLoop(){
  if(!gameRunning) return;
  for(let i=fallingItems.length-1;i>=0;i--){
    const el = fallingItems[i];
    let top = parseFloat(el.style.top);
    top+=2+score*0.05; // speed increase
    el.style.top=top+'px';
    // collision
    const elRect = el.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();
    if(!(elRect.bottom < basketRect.top || elRect.top > basketRect.bottom || elRect.right < basketRect.left || elRect.left > basketRect.right)){
      score+=parseInt(el.dataset.points);
      hudScore.textContent=score;
      playSound(sfx.correct);
      el.remove(); fallingItems.splice(i,1);
      continue;
    }
    // missed
    if(top>gameArea.clientHeight){
      score=Math.max(0,score-5);
      hudScore.textContent=score;
      playSound(sfx.wrong);
      el.remove(); fallingItems.splice(i,1);
    }
  }
  requestAnimationFrame(gameLoop);
}

/* ====== Basket Control ====== */
document.addEventListener('keydown', e=>{
  if(!gameRunning) return;
  if(e.key==='ArrowLeft') moveBasket(-20);
  if(e.key==='ArrowRight') moveBasket(20);
});
function moveBasket(dx){
  basketX = Math.min(Math.max(0,basketX+dx), gameArea.clientWidth - basket.clientWidth);
  basket.style.left=basketX+'px';
}

/* ====== Touch control ====== */
let touchStartX = null;

gameArea.addEventListener('touchstart', e=>{
  touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', e=>{
  if(!gameRunning) return;
  const touchX = e.touches[0].clientX;
  const dx = touchX - touchStartX;
  moveBasket(dx);
  touchStartX = touchX;
});


/* ====== End Game ====== */
function endGame(timeUp){
  gameRunning=false;
  clearInterval(timerId);
  fallingItems.forEach(e=>e.remove()); fallingItems.length=0;
  finalScoreEl.textContent=`Score: ${score}`;
  show('result');
  startConfetti();
}

/* ====== Leaderboard ====== */
const BOARD_KEY = 'astro_game2_board_v1';

function getBoard(){
  try{
    const raw = localStorage.getItem(BOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{return [];}
}

function setBoard(arr){
  localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0,10)));
}

function renderBoard(){
  const board = getBoard().slice(0,10);
  const list = document.getElementById('board');
  list.innerHTML='';
  if(board.length===0){
    list.innerHTML=`<li>No scores yet. Be the first! 🚀</li>`;
    return;
  }
  board.forEach((row,i)=>{
    const li = document.createElement('li');
    li.innerHTML=`<span>${i+1}. ${row.name}</span><span>${row.score}</span>`;
    list.appendChild(li);
  });
}

// Save score
document.getElementById('save-form').addEventListener('submit', e=>{
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

// Clear leaderboard
document.getElementById('clear-board').addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});
