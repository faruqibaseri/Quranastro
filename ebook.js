let likeCount = 0;
const likeBtn = document.getElementById("likeBtn");
const likeCountSpan = document.getElementById("likeCount");
const darkModeToggle = document.getElementById("darkModeToggle");

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