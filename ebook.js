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

let currentSlide = 0;
const slides = document.querySelectorAll('.image img');
const dots = document.querySelectorAll('.dot');
const slider = document.querySelector('.image-slider');

function showSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

// swipe handling
let startX = 0;
let endX = 0;

slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

slider.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

function handleSwipe() {
  const diff = startX - endX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {

      showSlide(currentSlide + 1);
    } else {

      showSlide(currentSlide - 1);
    }
  }
}



const images = document.querySelectorAll(".image img");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Function to show a specific image
function showSlide(index) {
  images.forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
  currentSlide = index;
}

// Fullscreen functionality
fullscreenBtn.addEventListener("click", function (e) {
  e.preventDefault();

  const activeImage = document.querySelector(".image img.active");
  if (!activeImage) return;

  const overlay = document.createElement("div");
  overlay.id = "fullscreenOverlay";

  const img = activeImage.cloneNode();
  overlay.appendChild(img);

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  overlay.addEventListener("click", function () {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 300);
  });
});

setInterval(() => showSlide(currentSlide + 1), 4000);
