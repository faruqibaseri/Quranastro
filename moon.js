/* ========= Sample content data (cards) ========= */
const cardsData = [
  {category:"Moon",   title:"Phases of the Moon", surah:"Surah Yaasin", ayat:"Verse 39", img:"2.1 MOON/photo/Moon Phases.png", link: "phases-of-the-moon.html"},
  {category:"Moon",   title:"The Movement of the Moon",    surah:"Surah Ash-Shams", ayat:"Verse 2", img:"2.1 MOON/photo/The Movement of the Moon.jpg", link: "the-movement-of-the-moon.html"},
  {category:"Sun", title:"The Sun as the Determiner of Shadows",     surah:"Surah Al-Furqan", ayat:"Verse 45", img:"2.2 SUN/photo/The Sun as the Determiner of Shadows.png", link: "the-sun-as-the-determiner-of-shadows.html"},
  {category:"Sun", title:"The Sun and Modern Science",          surah:"Surah Ash-Shams", ayat:"Verse 1", img:"2.2 SUN/photo/The Sun and Modern Science.png", link: "the-sun-and-modern-science.html"},
  {category:"Stars", title:"The Light of the Stars",  surah:"Surah Al-Waqi‘ah", ayat:"Verse 75", img:"2.3 STAR/photo/The Light of the Stars.png", link: "the-light-of-the-stars.html"},
  {category:"Stars", title:"Neutron Stars and Quasars",    surah:"Surah At-Tariq", ayat:"Verse 3", img:"2.3 STAR/photo/Neutron Stars and Quasars.png", link: "neutron-stars-and-quasars.html"},
];

/* ========= DOM refs ========= */
const cardsWrap = document.getElementById('cards');
const tabs = document.querySelectorAll('.tab');
const tabInk = document.querySelector('.tab-ink');
const viewAllBtn = document.getElementById('viewAll');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

/* ========= Render cards ========= */
  function renderCards(category, query = "") {
    cardsWrap.innerHTML = "";
    const q = (query || "").trim().toLowerCase();
    const filtered = cardsData.filter(c => {
      const matchCat = !category ? true : c.category === category;
      const matchText = !q ? true : c.title.toLowerCase().includes(q);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      cardsWrap.innerHTML = `<p class="muted">No items found.</p>`;
      return;
    }

    filtered.forEach((c, i) => {
      const el = document.createElement('article');
      el.className = 'card reveal tilt';
      el.style.transitionDelay = `${(i % 3) * 0.05}s`;
      el.innerHTML = `
        <a class="thumb hover-zoom" href="${c.link}">
          <img src="${c.img}" alt="${c.title}">
        <div class="card-body">
          <h4>${c.title}</h4>
          <div class="card-meta"><span>${c.surah}</span>·<span>${c.ayat}</span></div></a>
        </div>
      `;
      cardsWrap.appendChild(el);
    });

    observeReveals(); // re-attach animations
  }

  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const qrImage = document.getElementById("qrImage");

  fullscreenBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const overlay = document.createElement("div");
    overlay.id = "fullscreenOverlay";

    const img = qrImage.cloneNode();
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





/* ========= Tabs logic + animated underline ========= */
function moveInkToTab(activeBtn) {
  if (!activeBtn || !tabInk) return;
  tabInk.style.width = `${activeBtn.offsetWidth}px`;
  tabInk.style.left = `${activeBtn.offsetLeft}px`;
}

// 🔹 Function to auto-switch video when tab changes
function switchVideoByCategory(category) {
  const allItems = document.querySelectorAll('#playlist li');
  let matchedItem = null;

  allItems.forEach(item => {
    if (item.dataset.category === category) {
      matchedItem = item;
    }
  });

  if (matchedItem) {
    playlistItems.forEach(i => i.classList.remove('is-active'));
    matchedItem.classList.add('is-active');
    const videoId = matchedItem.getAttribute('data-video');
    mainVideo.src = `https://www.youtube.com/embed/${videoId}`;
  }
}

// ====== Tabs logic ======
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('is-active'));
    btn.classList.add('is-active');
    tabs.forEach(t => t.setAttribute('aria-selected', t === btn ? 'true' : 'false'));

    const q = searchInput?.value ?? "";
    moveInkToTab(btn);

    try {
      renderCards(btn.dataset.category, q);
    } catch (err) {
      console.error('renderCards error:', err);
    }

    // 🔹 Auto-change the video to match tab category
    switchVideoByCategory(btn.dataset.category);
  });
});


/* ========= Scroll reveal ========= */
let revealObserver;
function observeReveals(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('show'));
    return;
  }
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
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


/* ========= Playlist (switch video) ========= */
const mainVideo = document.getElementById('mainVideo');
const playlist = document.getElementById('playlist');
const playlistItems = document.querySelectorAll('#playlist li');

playlist.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-video]');
  if (!li) return;
  const id = li.getAttribute('data-video');
  mainVideo.src = `https://www.youtube.com/embed/${id}`;
});

// Handle active state and video switching
playlistItems.forEach(item => {
  item.addEventListener('click', () => {
    playlistItems.forEach(i => i.classList.remove('is-active'));
    item.classList.add('is-active');

    const videoId = item.getAttribute('data-video');
    mainVideo.src = `https://www.youtube.com/embed/${videoId}`;
  });
});

/* ========= Auto-load the first video on page load ========= */
window.addEventListener('DOMContentLoaded', () => {
  const targetVideoID = '6AviDjR9mmo';
  const allItems = document.querySelectorAll('#playlist li');

  allItems.forEach(item => {
    if (item.getAttribute('data-video') === targetVideoID) {
      item.classList.add('is-active');
      mainVideo.src = `https://www.youtube.com/embed/${targetVideoID}`;
    } else {
      item.classList.remove('is-active');
    }
  });
});

  /* ========= Auto-load YouTube thumbnails ========= */
  const thumbnails = document.querySelectorAll('#playlist li img');
  thumbnails.forEach(img => {
    const videoId = img.closest('li').getAttribute('data-video');
    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  });

// Add event listener
viewAllBtn.addEventListener('click', () => {
  const targetId = viewAllBtn.getAttribute('data-target');
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }
});


/* ========= Mobile menu (basic) ========= */
const burger = document.querySelector('.hamburger');
const nav = document.querySelector('.main-nav');
burger.addEventListener('click', ()=>{
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  nav.style.display = open ? 'none' : 'flex';
});

/* ========= Init ========= */
window.addEventListener('load', ()=>{
  // default: Events
  const active = document.querySelector('.tab.is-active');
  moveInkToTab(active);
  renderCards('Moon');
  observeReveals();
});
window.addEventListener('resize', ()=>{
  const active = document.querySelector('.tab.is-active');
  if (active) moveInkToTab(active);
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



const quotes = [
  "When you feel lost, Look at the stars - They shine even in the dark night.",
  "Every sunrise is a new chance from Allah to begin again.",
  "The moon teaches us that we don't need to be full to shine.",
  "The sun never rushes to rise, yet it always arrives on time - Just like Allah's plan.",
  "Even when the clouds hide the stars, we know they are still there - Just like Allah's mercy.",
  "The Earth spins silently, yet it never stops serving its purpose - just like how faith keeps moving even in silence."
];

const qrImages = [
  "qrcode/qr1.jpg",
  "qrcode/qr2.jpg",
  "qrcode/qr3.jpg",
  "qrcode/qr4.jpg",
  "qrcode/qr5.jpg",
  "qrcode/qr6.jpg",
];

function newQuote() {
  const quoteText = document.getElementById("quoteText");
  const qrImage = document.getElementById("qrImage");

  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[randomIndex];
  qrImage.src = qrImages[randomIndex];
}

window.onload = () => {
  newQuote();
};



const verses = [
  {
    surah: 'Al-Ikhlas (112:1)',
    arabic: '﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾',
    translation: 'Say, ˹O Prophet,˺ “He is Allah—One ˹and Indivisible˺;',
    reflection: 'Belief in the Oneness of Allah strengthens the heart — when we know that the source of all strength is One, we do not easily become anxious in facing trials.'
  },
  {
    surah: 'Ar-Rahman (55:13)',
    arabic: '﴿ فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ ﴾',
    translation: 'Then which of your Lord’s favours will you ˹humans and jinn˺ both deny?',
    reflection: 'Gratitude keeps our hearts humble and aware that every good thing is a gift from Allah, never to be taken for granted.'
  },
  {
    surah: 'Ash-Sharh (94:5)',
    arabic: '﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾',
    translation: 'So, surely with hardship comes ease.',
    reflection: 'In times of hardship, remember that Allah always provides a way out. Do not lose hope, for every test comes with His mercy.'
  },
  {
    surah: 'Al-Baqarah (2:286)',
    arabic: '﴿ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ﴾',
    translation: 'Allah does not require of any soul more than what it can afford.',
    reflection: 'Allah does not test you beyond your ability — believe that true strength appears when we rely on Him.'
  },
  {
    surah: 'An-Nur (24:35)',
    arabic: '﴿ اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ﴾',
    translation: 'Allah is the Light of the heavens and the earth.',
    reflection: "Let the light of Allah illuminate your heart and mind — for the light of faith guides the way through life's darkness."
  },
  {
    surah: 'Al-Insyirah (94:7-8)',
    arabic: '﴿ فَإِذَا فَرَغْتَ فَانصَبْ وَإِلَىٰ رَبِّكَ فَارْغَبْ ﴾',
    translation: 'So once you have fulfilled ˹your duty˺, strive ˹in devotion˺, turning to your Lord ˹alone˺ with hope.',
    reflection: 'Keep striving and never give up — every effort entrusted to Allah will surely bring peace and good outcomes.'
  }
];

const card = document.getElementById('reflectionCard');
const surahName = document.getElementById('surahName');
const arabicText = document.getElementById('arabicText');
const translationText = document.getElementById('translationText');
const reflectionText = document.getElementById('reflectionText');

window.addEventListener('load', () => {
  const randomIndex = Math.floor(Math.random() * verses.length);
  const v = verses[randomIndex];

  surahName.textContent = v.surah;
  arabicText.textContent = v.arabic;
  translationText.textContent = v.translation;
  reflectionText.textContent = v.reflection;

  setTimeout(() => card.classList.add('show'), 100);
});


