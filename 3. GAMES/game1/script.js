/* ====== State ====== */
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
    q: "Apakah bintang terdekat dengan Bumi?",
    options: ["Sirius", "Matahari", "Alpha Centauri", "Betelgeuse"],
    answer: 1,
    info: "Matahari ialah bintang kelas G2V dan sumber utama tenaga di sistem suria."
  },
  {
    q: "Mengapa Bulan kelihatan bercahaya pada waktu malam?",
    options: ["Bulan menghasilkan cahaya sendiri", "Bulan memantulkan cahaya Matahari", "Bulan menyerap cahaya bintang lain", "Atmosfera Bumi memancarkan cahaya"],
    answer: 1,
    info: "Permukaan Bulan memantulkan cahaya Matahari—albedo purata ~0.12."
  },
  {
    q: "Apakah fasa Bulan apabila bahagian yang menghadap Bumi gelap sepenuhnya?",
    options: ["Bulan Penuh", "Suku Pertama", "Anak Bulan (New Moon)", "Bulan Tua"],
    answer: 2,
    info: "Anak Bulan berlaku apabila Bulan berada di antara Bumi dan Matahari."
  },
  {
    q: "Planet manakah yang mempunyai hari paling pendek (putaran terpantas)?",
    options: ["Bumi", "Musytari (Jupiter)", "Marikh", "Uranus"],
    answer: 1,
    info: "Musytari berputar ~9 jam 56 minit bagi satu putaran."
  },
  {
    q: "Buruj manakah yang mengandungi bintang Polaris (Bintang Utara)?",
    options: ["Ursa Minor", "Orion", "Scorpius", "Lyra"],
    answer: 0,
    info: "Polaris ialah bintang paling cerah dalam Ursa Minor (Little Dipper)."
  },
  {
    q: "Apakah lapisan paling luar Matahari?",
    options: ["Fotosfera", "Kromosfera", "Korona", "Konveksi"],
    answer: 2,
    info: "Korona sangat panas (jutaan K) dan nampak jelas ketika gerhana penuh."
  },
  {
    q: "Bulan mengorbit Bumi kira-kira setiap…",
    options: ["7 hari", "14 hari", "27.3 hari", "40 hari"],
    answer: 2,
    info: "Tempoh sidera Bulan ~27.3 hari; sinodik (antara Bulan Penuh) ~29.5 hari."
  },
  {
    q: "Fenomena 'meteor' berlaku apabila…",
    options: ["Komet meletup di angkasa", "Meteoroid memasuki atmosfera Bumi", "Asteroid bertembung", "Bintang kehabisan bahan bakar"],
    answer: 1,
    info: "Meteoroid bergesel dengan atmosfera lalu menyala—kita lihat sebagai 'tahi bintang'."
  },
  {
    q: "Objek manakah yang BUKAN bintang?",
    options: ["Sirius", "Matahari", "Jupiter", "Vega"],
    answer: 2,
    info: "Jupiter ialah planet gergasi gas, bukan bintang."
  },
  {
    q: "Apakah nama galaksi tempat kita berada?",
    options: ["Andromeda", "Bima Sakti (Milky Way)", "Sombrero", "Whirlpool"],
    answer: 1,
    info: "Sistem suria kita berada di lengan Orion Galaksi Bima Sakti."
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
    infoEl.textContent = '✅ Betul! ' + q.info;
  }else{
    opts[idx].classList.add('wrong');
    opts[q.answer].classList.add('correct');
    playSfx(sfx.wrong);
    infoEl.textContent = '❌ Salah. Jawapan tepat: ' + q.options[q.answer] + '. ' + q.info;
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
    infoEl.textContent = '⏱️ Masa tamat! Jawapan: ' + q.options[q.answer] + '. ' + q.info;
    clearTimer();
  }
}
function updateTimer(){ timerEl.textContent = `${timeLeft}s`; }
function clearTimer(){ if(timerId){ clearInterval(timerId); timerId = null; } }

function endQuiz(){
  show('result');
  finalScoreEl.textContent = `Anda dapat ${score}/${questions.length}`;
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
    list.innerHTML = `<li>Belum ada skor. Jadi yang pertama! 🚀</li>`;
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

  const pieces = Array.from({length: 120}).map(()=>({
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
  if(confirm('Padam semua rekod Leaderboard?')){
    localStorage.removeItem(BOARD_KEY);
    renderBoard();
  }
});

// Sound toggle
document.getElementById('toggle-sound').addEventListener('click', (e)=>{
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? '🔊' : '🔈';
});

// Prevent leaving quiz with running timer memory leak
window.addEventListener('beforeunload', clearTimer);
