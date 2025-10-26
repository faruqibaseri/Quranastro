let likeCount = 0;
const likeBtn = document.getElementById("likeBtn");
const likeCountSpan = document.getElementById("likeCount");

// Like Button
likeBtn.addEventListener("click", () => {
  likeCount++;
  likeCountSpan.textContent = `${likeCount} likes`;
});

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

  /* Back to top */
  const toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', () => {
      toTop.style.display = window.scrollY > 600 ? 'block' : 'none';
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();

    // Mobile dropdown toggle
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});

const imageContainer = document.querySelector('.image');
const slides = document.querySelectorAll('.image img');
const dots = document.querySelectorAll('.dot');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let currentSlide = 0;
let autoSlideInterval = null;
let autoSlidePaused = false;

// === Show slide ===
function showSlide(index) {
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  currentSlide = index;

  imageContainer.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// === Auto-slide ===
function startAutoSlide() {
  stopAutoSlide(); // ensure no duplicate intervals
  autoSlideInterval = setInterval(() => {
    if (!autoSlidePaused) {
      showSlide(currentSlide + 1);
    }
  }, 4000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = null;
}

function pauseAutoSlideTemporarily() {
  autoSlidePaused = true;
  clearTimeout(pauseTimer);
  pauseTimer = setTimeout(() => {
    autoSlidePaused = false;
  }, 2); // resume autoplay after 5s
}

let pauseTimer;

// === Dots navigation ===
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.dataset.index);
    showSlide(index);
    pauseAutoSlideTemporarily();
  });
});

// === Swipe functionality ===
let startX = 0;
let endX = 0;
let isSwiping = false;

imageContainer.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isSwiping = true;
  pauseAutoSlideTemporarily();
});

imageContainer.addEventListener('touchmove', e => {
  if (!isSwiping) return;
  endX = e.touches[0].clientX;
});

imageContainer.addEventListener('touchend', e => {
  if (!isSwiping) return;
  endX = e.changedTouches[0].clientX;
  handleSwipe();
  isSwiping = false;
});

function handleSwipe() {
  const diff = startX - endX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) showSlide(currentSlide + 1);
    else showSlide(currentSlide - 1);
  }
}

// === Fullscreen ===
fullscreenBtn.addEventListener('click', e => {
  e.preventDefault();
  pauseAutoSlideTemporarily();

  const overlay = document.createElement('div');
  overlay.id = 'fullscreenOverlay';

  const activeImg = slides[currentSlide].cloneNode();
  overlay.appendChild(activeImg);

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  overlay.addEventListener('click', () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  });
});

// === Initialize ===
showSlide(0);
startAutoSlide();
