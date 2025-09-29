const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const navLinks = document.querySelectorAll('header nav a[href^="#"]');
const linkBySectionId = new Map(
  [...navLinks].map((link) => [link.getAttribute('href').slice(1), link])
);

const sections = [...linkBySectionId.keys()]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = linkBySectionId.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  },
  { root: null, threshold: 0.6 }
);

sections.forEach((sec) => observer.observe(sec));

const toggleBtn = document.getElementById('toggleHobbies');
const hobbyList = document.getElementById('hobby-list');

if (toggleBtn && hobbyList) {
  toggleBtn.addEventListener('click', () => {
    hobbyList.classList.toggle('hidden');
    const isHidden = hobbyList.classList.contains('hidden');
    toggleBtn.textContent = isHidden ? 'Show Hobbies' : 'Hide Hobbies';
    toggleBtn.setAttribute('aria-expanded', String(!isHidden));
  });
}

const headerEl = document.querySelector('header');
window.addEventListener('scroll', () => {
  headerEl.classList.toggle('scrolled', window.scrollY > 0);
});

const menuToggle = document.getElementById('menuToggle');
const siteNav = document.getElementById('site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
