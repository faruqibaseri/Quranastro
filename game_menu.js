/* AstronoVerse interactions: slider, mobile menu, scroll reveal, tilt, back-to-top */
(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile menu */
const burger = document.getElementById('hamburger');
const mobile = document.getElementById('mobileMenu');

if (burger && mobile) {
  burger.addEventListener('click', () => {
    // Toggle menu visibility
    mobile.classList.toggle('open');
    
    // Toggle hamburger animation
    burger.classList.toggle('active');
    
    // Update accessibility attributes
    const isOpen = mobile.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);
  });
}

/* Scroll reveal */
  const ro = new IntersectionObserver((ents)=>{
    ents.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.classList.add('is-visible');
        ro.unobserve(ent.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  /* Tilt effect (subtle) */
  document.querySelectorAll('.tilt').forEach(el => {
    let rAF;
    function onMove(e){
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rx = (dy * -6).toFixed(2);
      const ry = (dx * 6).toFixed(2);
      if(rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(()=>{
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    }
    function reset(){ el.style.transform = 'none'; }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
  });


  /* Back to top */
  const toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', () => {
      toTop.style.display = window.scrollY > 600 ? 'block' : 'none';
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();


// 🌌 Modal functions
function openModal(gameName) {
  document.getElementById("modalTitle").innerText = gameName;
  document.getElementById("gameModal").style.display = "flex";
  document.getElementById("clickSound").play();
}
function closeModal() {
  document.getElementById("gameModal").style.display = "none";
}

// 🌌 Stars animation
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let starsArray = [];
let numStars = 120;
for (let i = 0; i < numStars; i++) {
  starsArray.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.2
  });
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.beginPath();
  starsArray.forEach(star => {
    ctx.moveTo(star.x, star.y);
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
  });
  ctx.fill();

  starsArray.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animateStars);
}
animateStars();

// Resize responsive
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

  function playAndRedirect(url) {
    const sound = document.getElementById("clickSound");
    sound.currentTime = 0;
    sound.play();

setTimeout(() => {
  window.location.href = url;
}, 500);

  }

      // Mobile dropdown toggle
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});
