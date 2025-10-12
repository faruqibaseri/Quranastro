/* ===== Simple carousel helper ===== */
function makeCarousel(rootSelector, prevBtn, nextBtn, dotsContainer, visibleDesktop = 3) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  let index = 0;
  const slides = Array.from(root.children);

  function visibleCount() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return visibleDesktop;
  }

  function update() {
    const vis = visibleCount();
    const totalPages = Math.max(1, Math.ceil(slides.length / vis));
    index = Math.max(0, Math.min(index, totalPages - 1));

    const slideWidth = root.clientWidth / vis;
    root.style.scrollBehavior = "auto";
    root.scrollTo({ left: index * slideWidth * vis });
    setTimeout(() => (root.style.scrollBehavior = "smooth"), 0);

    // dots
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < totalPages; i++) {
        const b = document.createElement("button");
        b.type = "button";
        if (i === index) b.setAttribute("aria-current", "true");
        b.addEventListener("click", () => { index = i; update(); });
        dotsContainer.appendChild(b);
      }
    }
  }

  function next() { index++; update(); }
  function prev() { index--; update(); }

  window.addEventListener("resize", () => update());
  if (nextBtn) document.querySelector(nextBtn)?.addEventListener("click", next);
  if (prevBtn) document.querySelector(prevBtn)?.addEventListener("click", prev);

  update();
}

/* Gallery (images) */
makeCarousel(".gallery", ".gallery-prev", ".gallery-next", null, 3);

/* Testimonials (with dots) */
makeCarousel(".testi", ".testi-prev", ".testi-next", document.querySelector(".dots"), 3);

/* ===== Contact/Review form ===== */
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  // Simple “sent” feel + basic checks
  if (!data.name || !data.email) {
    note.textContent = "Please fill in your name and email.";
    note.style.color = "#b91c1c";
    return;
  }

  // Simulate success
  note.textContent = "Thanks! Your message has been received.";
  note.style.color = "#059669";
  form.reset();
}



);


const items = document.querySelectorAll('.accordion button');

function toggleAccordion() {
  const itemToggle = this.getAttribute('aria-expanded');

  for (i = 0; i < items.length; i++) {
    items[i].setAttribute('aria-expanded', 'false');
  }

  if (itemToggle == 'false') {
    this.setAttribute('aria-expanded', 'true');
  }
}

items.forEach((item) => item.addEventListener('click', toggleAccordion));


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

const slides = document.querySelector(".slides");
const slideImages = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots");

let currentIndex = 0;
let slideInterval;

// buat dots ikut jumlah slide
slideImages.forEach((_, index) => {
  const dot = document.createElement("span");
  dot.classList.add("dot");
  if (index === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(index));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dot");

function goToSlide(index) {
  currentIndex = index;
  slides.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
}

function updateDots() {
  dots.forEach(dot => dot.classList.remove("active"));
  dots[currentIndex].classList.add("active");
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slideImages.length;
  goToSlide(currentIndex);
}

// auto slide setiap 4s
function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 4000);
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

startAutoSlide();


    // Mobile dropdown toggle
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});