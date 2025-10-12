/* ====== Fill-in-the-Blanks Game (AstronoVerse theme) ====== */

/* ---------- DOM references ---------- */
document.getElementById('btn-home').addEventListener('click', ()=> window.location.href='index.html');

const SCREENS = {
  menu: document.getElementById('screen-menu'),
  howto: document.getElementById('screen-howto'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  leaderboard: document.getElementById('screen-leaderboard'),
};

const levelLabel = document.getElementById('levelLabel');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

const sentenceContainer = document.getElementById('sentenceContainer');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');

const btnStart = document.getElementById('btn-start');
const btnStart2 = document.getElementById('btn-start-2');
const btnPrev = document.getElementById('btn-prev-level');
const btnNext = document.getElementById('btn-next-level');
const btnCheck = document.getElementById('btn-check');
const btnPlayAgain = document.getElementById('btn-play-again');

const saveForm = document.getElementById('save-form');
const boardList = document.getElementById('board');
const clearBoardBtn = document.getElementById('clear-board');

const sfx = {
  correct: document.getElementById('sfx-correct'),
  wrong:   document.getElementById('sfx-wrong'),
  click:   document.getElementById('sfx-click'),
};
let soundOn = true;

/* ---------- Music / sound toggles ---------- */
const bgMusic = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggle-music');
const toggleSoundBtn = document.getElementById('toggle-sound');

window.addEventListener('load', ()=> {
  bgMusic.play().catch(()=>{}); // may be blocked by browser until user gesture
});
toggleMusicBtn.addEventListener('click', ()=>{
  if(bgMusic.paused){ bgMusic.play().catch(()=>{}); toggleMusicBtn.textContent='🎵 Music'; }
  else { bgMusic.pause(); toggleMusicBtn.textContent='🔇 Music'; }
});
toggleSoundBtn.addEventListener('click', ()=>{
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? '🔊 Sound' : '🔈 Sound';
});

/* ---------- Levels data (sentence + blanks + choices) ---------- */
/* blanks array = correct answers in order; sentenceTemplate includes placeholders {0}, {1}, ... */
const LEVELS = [
  {
    title: "Basics — Sun & Moon",
    sentenceTemplate: "The {0} is the center of our solar system. The {1} shines at night and reflects light.",
    blanks: ["Sun","Moon"],
    choices: ["Sun","Moon","Earth","Jupiter","Comet","Star"]
  },
  {
    title: "Stars & Moon",
    sentenceTemplate: "At night we see many {0}. Sometimes the {1} orbits the {2}.",
    blanks: ["Stars","Moon","Earth"],
    choices: ["Stars","Moon","Earth","Mars","Sun","Galaxy","Meteor"]
  },
  {
    title: "Orbital facts",
    sentenceTemplate: "One full orbit of Earth around the {0} takes about {1} days.",
    blanks: ["Sun","365"],
    choices: ["365","30","Sun","Moon","24","Leap"]
  },
  {
    title: "Mixed space",
    sentenceTemplate: "A {0} often has a long tail. A {1} is a giant ball of gas that emits light.",
    blanks: ["Comet","Star"],
    choices: ["Planet","Comet","Star","Rocket","Moon","Asteroid"]
  }
];

/* ---------- State ---------- */
let currentLevel = 0;
let score = 0;
let secondsLeft = 45;
let timerId = null;

/* ---------- Helpers: navigation, sfx ---------- */
function show(screen){
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[screen].classList.add('active');
}
function playSfx(a){ if(!soundOn || !a) return; a.currentTime = 0; a.play().catch(()=>{}); }

/* ---------- Render level ---------- */
function renderLevel(idx){
  const lvl = LEVELS[idx];
  // HUD
  levelLabel.textContent = `${idx+1}/${LEVELS.length}`;
  document.getElementById('levelTitle').textContent = lvl.title;
  scoreEl.textContent = score;
  updateProgress();

  // Build sentence by replacing placeholders with blanks
  // Example template: "The {0} is ... The {1} ..."
  let html = lvl.sentenceTemplate;
  for(let i=0;i<lvl.blanks.length;i++){
    const placeholder = `{${i}}`;
    // replace with a span blank having data-idx
    html = html.replace(placeholder, `<span class="blank empty" data-idx="${i}" data-answer="${lvl.blanks[i]}">Drop here</span>`);
  }
  sentenceContainer.innerHTML = html;

  // Render choices (shuffle order)
  const pool = shuffleArray([...lvl.choices]);
  choicesEl.innerHTML = '';
  pool.forEach(choiceText=>{
    const d = document.createElement('div');
    d.className = 'choice';
    d.draggable = true;
    d.textContent = choiceText;
    d.dataset.value = choiceText;
    choicesEl.appendChild(d);

    // drag handlers
    d.addEventListener('dragstart', (e)=>{
      e.dataTransfer.setData('text/plain', choiceText);
      setTimeout(()=> d.classList.add('dragging'), 0);
      playSfx(sfx.click);
    });
    d.addEventListener('dragend', ()=> d.classList.remove('dragging'));

    // touch fallback
    d.addEventListener('touchstart', (ev)=> startTouchDrag(ev, d), {passive:false});
  });

  // blanks: allow drop
  document.querySelectorAll('.blank').forEach(b=>{
    b.addEventListener('dragover', e=> e.preventDefault());
    b.addEventListener('drop', e=>{
      e.preventDefault();
      const val = e.dataTransfer.getData('text/plain');
      handleDropToBlank(b, val);
    });

    // also allow click to clear filled
    b.addEventListener('click', ()=>{
      if(b.classList.contains('filled')){
        // return item to choice tray
        const val = b.dataset.user || '';
        if(val){
          // create a new choice item and append back
          const newChoice = document.createElement('div');
          newChoice.className = 'choice';
          newChoice.draggable = true;
          newChoice.textContent = val;
          newChoice.dataset.value = val;
          choicesEl.appendChild(newChoice);
          newChoice.addEventListener('dragstart', ev=> {
            ev.dataTransfer.setData('text/plain', val);
            setTimeout(()=> newChoice.classList.add('dragging'),0);
            playSfx(sfx.click);
          });
          newChoice.addEventListener('dragend', ()=> newChoice.classList.remove('dragging'));
          newChoice.addEventListener('touchstart', (ev)=> startTouchDrag(ev, newChoice), {passive:false});
        }
        // clear blank
        b.textContent = 'Drop here';
        b.classList.remove('filled');
        b.classList.add('empty');
        delete b.dataset.user;
      }
    });
  });

  feedbackEl.textContent = '';
}

/* ---------- Drop handling ---------- */
function handleDropToBlank(blankEl, value){
  if(!blankEl || !value) return;
  // set user value
  blankEl.textContent = value;
  blankEl.classList.remove('empty');
  blankEl.classList.add('filled');
  blankEl.dataset.user = value;

  // remove one matching choice from tray (first match)
  const match = Array.from(choicesEl.children).find(c=> c.dataset.value === value);
  if(match) match.remove();
  playSfx(sfx.click);
}

/* ---------- Check answers ---------- */
function checkAnswers(){
  const blanks = Array.from(document.querySelectorAll('.blank'));
  const lvl = LEVELS[currentLevel];
  let correctCount = 0;

  // Must ensure all blanks are filled first
  const allFilled = blanks.every(b => b.classList.contains('filled'));
  if(!allFilled){
    feedbackEl.textContent = 'Please fill all blanks before checking.';
    return;
  }

  blanks.forEach(b=>{
    const user = (b.dataset.user || '').trim();
    const answer = (b.dataset.answer || '').trim();
    if(user === answer){
      b.style.background = '#e8fff7'; // green
      b.style.color = '#043927';
      b.classList.remove('empty'); b.classList.add('filled');
      correctCount++;
    } else {
      b.style.background = '#fff1f1'; // red
      b.style.color = '#7a041a';
    }
  });

  if(correctCount === blanks.length){
    // full correct: reward points and next level
    const timeBonus = Math.max(0, secondsLeft);
    const points = 50 + (10 * blanks.length) + Math.floor(timeBonus/2);
    score += points;
    scoreEl.textContent = score;
    playSfx(sfx.correct);
    feedbackEl.textContent = `✅ All correct! +${points} points. Advancing...`;
    // small delay then next level
    setTimeout(()=> nextLevel(), 900);
  } else {
    // partial or wrong
    playSfx(sfx.wrong);
    feedbackEl.textContent = `❌ ${correctCount}/${blanks.length} correct. Try again or clear wrong answers. (-5s penalty)`;
    secondsLeft = Math.max(0, secondsLeft - 5);
    updateTimerDisplay();
  }
}

/* ---------- Level navigation ---------- */
function nextLevel(){
  if(currentLevel < LEVELS.length - 1){
    currentLevel++;
    startLevel();
  } else {
    // finished all levels -> show result
    endGame(true);
  }
}
function prevLevel(){
  if(currentLevel > 0){
    currentLevel--;
    startLevel();
  }
}

/* ---------- Start / restart / timer ---------- */
function startLevel(){
  // reset timer state per level
  secondsLeft = 45;
  if(timerId) { clearInterval(timerId); timerId = null; }
  timerId = setInterval(()=>{
    secondsLeft--;
    updateTimerDisplay();
    if(secondsLeft <= 0){
      clearInterval(timerId);
      endGame(false);
    }
  }, 1000);

  renderLevel(currentLevel);
  show('game');
}

function startGame(){
  currentLevel = 0;
  score = 0;
  startLevel();
}

function updateTimerDisplay(){
  timerEl.textContent = `${secondsLeft}s`;
}

function updateProgress(){
  const pct = Math.round((currentLevel / (LEVELS.length-1 || 1)) * 100);
  progressEl.style.width = `${pct}%`;
}

/* ---------- End game ---------- */
function endGame(success){
  if(timerId){ clearInterval(timerId); timerId=null; }
  playSfx(success ? sfx.correct : sfx.wrong);
  document.getElementById('final-score').textContent = `You scored ${score}`;
  window.__finalScore = score;
  startConfetti();
  show('result');
}

/* ---------- Leaderboard ---------- */
const BOARD_KEY = 'astro_fill_board_v1';
function getBoard(){ try{ return JSON.parse(localStorage.getItem(BOARD_KEY) || '[]'); }catch{ return []; } }
function setBoard(arr){ localStorage.setItem(BOARD_KEY, JSON.stringify(arr.slice(0,10))); }
function renderBoard(){
  const board = getBoard().slice().sort((a,b)=> b.score - a.score).slice(0,10);
  const el = document.getElementById('board');
  el.innerHTML = '';
  if(board.length===0){ el.innerHTML = '<li>No scores yet. Be the first! 🚀</li>'; return; }
  board.forEach((r,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${i+1}. ${escapeHtml(r.name)}</span><span>${r.score}</span>`;
    el.appendChild(li);
  });
}

/* Save form */
saveForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = (document.getElementById('player-name').value || 'Player').trim();
  const b = getBoard();
  b.push({name, score: window.__finalScore || 0});
  b.sort((a,b2)=> b2.score - a.score);
  setBoard(b);
  renderBoard();
  show('leaderboard');
  stopConfetti();
});

/* Clear board */
clearBoardBtn.addEventListener('click', ()=>{
  if(confirm('Delete all leaderboard records?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});

/* ---------- Drag touch fallback (simple) ---------- */
let touchGhost = null;
let draggingEl = null;
function startTouchDrag(ev, el){
  ev.preventDefault();
  draggingEl = el;
  touchGhost = el.cloneNode(true);
  touchGhost.style.position = 'fixed';
  touchGhost.style.opacity = '0.9';
  touchGhost.style.zIndex = 9999;
  touchGhost.style.pointerEvents = 'none';
  document.body.appendChild(touchGhost);
  moveTouchGhost(ev.touches[0].clientX, ev.touches[0].clientY);
  window.addEventListener('touchmove', onTouchMove, {passive:false});
  window.addEventListener('touchend', onTouchEnd);
}
function onTouchMove(e){
  e.preventDefault();
  moveTouchGhost(e.touches[0].clientX, e.touches[0].clientY);
}
function onTouchEnd(e){
  const t = e.changedTouches[0];
  const target = document.elementFromPoint(t.clientX, t.clientY);
  if(target){
    const blank = target.closest('.blank');
    if(blank){
      handleDropToBlank(blank, draggingEl.dataset.value || draggingEl.textContent);
      draggingEl.remove(); // remove original
    }
  }
  cleanupTouch();
}
function moveTouchGhost(x,y){
  if(!touchGhost) return;
  const rect = touchGhost.getBoundingClientRect();
  touchGhost.style.left = (x - rect.width/2) + 'px';
  touchGhost.style.top = (y - rect.height/2) + 'px';
}
function cleanupTouch(){
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  if(touchGhost){ touchGhost.remove(); touchGhost=null; }
  draggingEl = null;
}

/* ---------- Utilities ---------- */
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

/* ---------- Confetti ---------- */
let confettiRun = false;
function startConfetti(){
  const cvs = document.getElementById('confetti');
  if(!cvs) return;
  const ctx = cvs.getContext('2d');
  const parent = cvs.parentElement;
  const {width, height} = parent.getBoundingClientRect();
  cvs.width = width; cvs.height = height;
  const pieces = Array.from({length: 120}).map(()=>({
    x: Math.random()*width, y: Math.random()*-height, r: Math.random()*6+4, s: Math.random()*2+1, a: Math.random()*360
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

/* ---------- Event wiring ---------- */
// nav buttons
document.querySelectorAll('[data-target]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    playSfx(sfx.click);
    const t = btn.getAttribute('data-target');
    if(t==='leaderboard') renderBoard();
    show(t);
    stopConfetti();
  });
});

// header quick nav click sound
document.querySelectorAll('.nav-btn[data-target]').forEach(btn=> btn.addEventListener('click', ()=> playSfx(sfx.click)));

// start
btnStart.addEventListener('click', ()=> { playSfx(sfx.click); startGame(); });
btnStart2 && btnStart2.addEventListener('click', ()=> { playSfx(sfx.click); startGame(); });

// prev/next/check
btnPrev.addEventListener('click', ()=> { playSfx(sfx.click); prevLevel(); });
btnNext.addEventListener('click', ()=> { playSfx(sfx.click); nextLevel(); });
btnCheck.addEventListener('click', ()=> { playSfx(sfx.click); checkAnswers(); });

// play again
btnPlayAgain.addEventListener('click', ()=> { playSfx(sfx.click); startGame(); });

// initial render
renderBoard();
show('menu');

/* safety: clear timer on unload */
window.addEventListener('beforeunload', ()=> { if(timerId) clearInterval(timerId); });
