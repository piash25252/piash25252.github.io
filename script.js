// ================================
// TYPING EFFECT
// ================================
const typedEl = document.getElementById('typed');
const words = ['Manual Tester', 'Automation Tester', 'API Tester', 'Bug Hunter', 'QA Advocate'];
let wi = 0, ci = 0, deleting = false;

function type() {
  const word = words[wi];
  typedEl.textContent = deleting
    ? word.substring(0, ci - 1)
    : word.substring(0, ci + 1);

  deleting ? ci-- : ci++;

  let speed = deleting ? 55 : 95;
  if (!deleting && ci === word.length) { speed = 1800; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; speed = 300; }

  setTimeout(type, speed);
}

if (typedEl) type();

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
// NAVBAR ACTIVE LINK ON SCROLL
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

document.querySelectorAll('.skill-cat-card, .proj-card, .ci-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

// ================================
// CONTACT FORM SUBMIT
// ================================
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-primary');
  const original = btn.textContent;
  btn.textContent = '✓ Message Sent!';
  btn.style.background = '#16a34a';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}
