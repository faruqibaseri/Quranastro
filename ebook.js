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

// === Fullscreen (fixed autoplay resume) ===
fullscreenBtn.addEventListener('click', e => {
  e.preventDefault();

  // Pause the slider while we create/open the fullscreen view
  autoSlidePaused = true;       // pause autoplay while fullscreen is open
  clearTimeout(pauseTimer);     // cancel any temporary resume timer

  const overlay = document.createElement('div');
  overlay.id = 'fullscreenOverlay';

  const panWrapper = document.createElement('div');
  panWrapper.className = 'pan-wrapper';

  const activeImg = slides[currentSlide].cloneNode();
  activeImg.draggable = false;
  activeImg.style.userSelect = "none";
  activeImg.style.pointerEvents = "none"; // prevent image click events
  panWrapper.appendChild(activeImg);
  overlay.appendChild(panWrapper);

  // Zoom controls
  const zoomControls = document.createElement('div');
  zoomControls.className = 'zoom-controls';
  zoomControls.innerHTML = `
    <button class="zoom-btn" id="zoomIn">+</button>
    <button class="zoom-btn" id="zoomOut">−</button>
  `;
  overlay.appendChild(zoomControls);

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  // === pan / zoom variables ===
  let scale = 1, minScale = 1, maxScale = 5;
  let startX = 0, startY = 0, currentX = 0, currentY = 0;
  let isDragging = false, hasDragged = false;
  let initialDistance = 0;

  function updateTransform() {
    panWrapper.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  }

  function recenterImage() {
    currentX = 0;
    currentY = 0;
    panWrapper.style.transition = "transform 0.3s ease";
    updateTransform();
    setTimeout(() => (panWrapper.style.transition = "transform 0.1s ease"), 300);
  }

  // Wheel zoom
  overlay.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomAmount = e.deltaY * -0.0015;
    scale = Math.min(Math.max(scale + zoomAmount, minScale), maxScale);
    updateTransform();
    if (scale <= 1.01) recenterImage();
  }, { passive: false });

  // Pointer (mouse/touch) pan on wrapper
  panWrapper.addEventListener('pointerdown', e => {
    if (scale === 1) return; // don't pan at base zoom
    isDragging = true;
    hasDragged = false;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    panWrapper.setPointerCapture(e.pointerId);
    panWrapper.style.cursor = 'grabbing';
  });

  panWrapper.addEventListener('pointermove', e => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateTransform();
    hasDragged = true;
  });

  panWrapper.addEventListener('pointerup', e => {
    isDragging = false;
    try { panWrapper.releasePointerCapture(e.pointerId); } catch (err) {}
    panWrapper.style.cursor = scale > 1 ? 'grab' : 'default';
    setTimeout(() => (hasDragged = false), 50);
  });

  // Touch pinch zoom
  overlay.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  overlay.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const zoomFactor = newDistance / initialDistance;
      scale = Math.min(Math.max(scale * zoomFactor, minScale), maxScale);
      initialDistance = newDistance;
      updateTransform();
      if (scale <= 1.01) recenterImage();
    } else if (e.touches.length === 1 && scale > 1 && isDragging) {
      // single-finger pan on touch (we already handle pointer events, but keep safe)
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      updateTransform();
    }
  }, { passive: false });

  // Zoom buttons
  document.getElementById('zoomIn').addEventListener('click', ev => {
    ev.stopPropagation();
    scale = Math.min(scale + 0.2, maxScale);
    updateTransform();
  });

  document.getElementById('zoomOut').addEventListener('click', ev => {
    ev.stopPropagation();
    scale = Math.max(scale - 0.2, minScale);
    updateTransform();
    if (scale <= 1.01) recenterImage();
  });

  // Close overlay: only when clicking the background (not after dragging)
overlay.addEventListener('click', e => {
  if (!hasDragged && scale === 1) {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      autoSlidePaused = false;
      if (!autoSlideInterval) startAutoSlide();
    }, 300);
  }
});
  // If user closes with Escape key, also resume autoplay
  function handleEscClose(ev) {
    if (ev.key === 'Escape') {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        autoSlidePaused = false;
        if (!autoSlideInterval) startAutoSlide();
      }, 300);
      window.removeEventListener('keydown', handleEscClose);
    }
  }
  window.addEventListener('keydown', handleEscClose);
});


// === Initialize ===
showSlide(0);
startAutoSlide();
