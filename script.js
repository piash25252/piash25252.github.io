// ================================
// THEME TOGGLE (Dark Mode)
// ================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.documentElement;
const icon = themeToggle?.querySelector('i');

// Check saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = body.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateIcon(next);
});

function updateIcon(theme) {
  if (!icon) return;
  icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

// ================================
// TYPING EFFECT
// ================================
const typedEl = document.getElementById('typed');
const words = ['SQA Engineer', 'Manual Tester', 'Automation Tester', 'API Tester', 'Bug Hunter'];
let wi = 0, ci = 0, deleting = false;

function type() {
  if (!typedEl) return;
  const word = words[wi];
  typedEl.textContent = deleting
    ? word.substring(0, ci - 1)
    : word.substring(0, ci + 1);

  deleting ? ci-- : ci++;

  let speed = deleting ? 50 : 100;
  if (!deleting && ci === word.length) { speed = 2000; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; speed = 500; }

  setTimeout(type, speed);
}

if (typedEl) type();

// ================================
// NUMBERS ANIMATION (Counters)
// ================================
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const endValue = parseInt(target.getAttribute('data-target'));
      let startValue = 0;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / endValue));

      const timer = setInterval(() => {
        startValue += 1;
        target.textContent = startValue + (endValue === 5 || endValue === 3 ? '+' : endValue === 100 ? '%' : '');
        if (startValue === endValue) clearInterval(timer);
      }, stepTime);
      
      statsObserver.unobserve(target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.astat-n').forEach(el => statsObserver.observe(el));

// ================================
// PROFILE IMAGE — hide if broken
// ================================
const img = document.getElementById('profileImg');
if (img) {
  img.addEventListener('error', () => {
    img.style.display = 'none';
  });
  img.addEventListener('load', () => {
    const initials = document.getElementById('initials');
    if (initials) initials.style.display = 'none';
  });
}

// ================================
// TIMELINE SCROLL REVEAL
// ================================
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 180);
      tlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.tl-item').forEach(el => tlObserver.observe(el));

// ================================
// NAVBAR SCROLL EFFECT
// ================================
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 30) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.07)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// ================================
// SMOOTH FADE IN ON SCROLL
// ================================
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeElements() {
  document.querySelectorAll('.skill-cat-card, .proj-card, .ci-card, .section-header').forEach(el => {
    if (!el.classList.contains('observed')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      el.classList.add('observed');
      fadeObserver.observe(el);
    }
  });
}

observeElements();

// Expose observeElements for dynamically added content (like projects)
window.ObserveNewElements = observeElements;
