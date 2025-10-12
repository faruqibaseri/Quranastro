/* AstronoVerse interactions: mobile menu, scroll reveal, tilt, back-to-top */
(function(){
  // 1. Update year in the footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Mobile menu toggle logic
  const burger = document.getElementById('hamburger');
  const mobile = document.getElementById('mobileMenu');

  if (burger && mobile) {
    burger.addEventListener('click', () => {
      mobile.classList.toggle('open');
      burger.classList.toggle('active');
      const isOpen = mobile.classList.contains('open');
      burger.setAttribute('aria-expanded', isOpen);
    });
  }

  // 3. --- Optimization: Disable performance-heavy animations on mobile (max-width: 902px) ---
  const isDesktop = window.matchMedia('(min-width: 903px)').matches;

  /* Scroll reveal (Desktop Only) */
  if (isDesktop) {
    const ro = new IntersectionObserver((ents)=>{
      ents.forEach(ent=>{
        if(ent.isIntersecting){
          ent.target.classList.add('is-visible');
          ro.unobserve(ent.target);
        }
      });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
  }

  /* Tilt effect (Desktop Only) */
  if (isDesktop) {
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
  }
  // -----------------------------------------------------------------------------------

  /* 4. Back to top */
  const toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', () => {
      toTop.style.display = window.scrollY > 600 ? 'block' : 'none';
    });
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();


// Mobile dropdown toggle for 'Explore' submenu
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});

// 5. External redirection function (used by some buttons/links)
function playAndRedirect(url) {
  const sound = document.getElementById("clickSound");
  if(sound) {
    sound.currentTime = 0;
    sound.play();
  }

  setTimeout(() => {
    window.location.href = url;
  }, 500);
}