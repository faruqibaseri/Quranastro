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

  // Gallery configuration
    const galleryConfig = {
      items: [
        {
          title: "Neutron-star",
          image: "1. HOMEPAGE/photo/Neutron-star.jpg",
          position: "47% 35%",
          author: "Neutron-star"
        },
        {
          title: "moon1",
          image: "1. HOMEPAGE/photo/moon1.jpg",
          position: "75% 65%",
          author: "moon1"
        },
        {
          title: "sun",
          image: "1. HOMEPAGE/photo/sun.jpg",
          position: "53% 43%",
          author: "sun"
        },
        {
          title: "Quasar-star",
          image: "1. HOMEPAGE/photo/Quasar-star.jpg",
          position: "50% 30%",
          author: "Quasar-star"
        },
        {
          title: "sun-earth1",
          image: "1. HOMEPAGE/photo/sun-earth1.jpg",
          position: "60% 50%",
          author: "sun-earth1"
        },
        {
          title: "Quasar-star2",
          image: "1. HOMEPAGE/photo/Quasar-star2.jpg",
          position: "45% 30%",
          author: "Quasar-star2"
        },
        {
          title: "moon2",
          image: "1. HOMEPAGE/photo/moon2.png",
          position: "50% 20%",
          author: "moon2"
        },
        {
          title: "sun-earth2",
          image: "1. HOMEPAGE/photo/sun-earth2.jpg",
          position: "50% 35%",
          author: "sun-earth2"
        }
      ],
      rotationSpeed: 0.001
    };

    // Initialize gallery
    function initGallery() {
      const gallery = document.getElementById('galleryAssembly');
      const items = galleryConfig.items;
      
      // Set number of items
      document.documentElement.style.setProperty('--n', items.length);
      
      // Create gallery items
      items.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.setProperty('--i', index);
        galleryItem.style.setProperty('--pos', item.position);
        
        galleryItem.innerHTML = `
          <div class="gallery-figure">
            <img src="${item.image}" alt="${item.title}" class="gallery-img">
            
          </div>
        `;
        
        gallery.appendChild(galleryItem);
      });
      
      // Start rotation
      startRotation();
    }

    // Rotation animation
function startRotation() {
  let rotation = 0;
  let lastTime = 0;
  
  function animateGallery(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    
    rotation += galleryConfig.rotationSpeed * (delta / 16);
    
    // Apply rotation to each gallery item individually
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
      item.style.setProperty('--rotation', rotation + 'turn');
    });
    
    requestAnimationFrame(animateGallery);
  }
  
  requestAnimationFrame(animateGallery);
}

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initGallery);

    // Mobile dropdown toggle
document.querySelectorAll(".mobile__toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.parentElement;
    parent.classList.toggle("open");
  });
});

  function playAndRedirect(url) {
    const sound = document.getElementById("clickSound");
    sound.currentTime = 0;
    sound.play();

    setTimeout(() => {
      window.location.href = url;
    }, 500);
  }