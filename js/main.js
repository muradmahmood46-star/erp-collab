/**
 * main.js
 * Handles: sticky nav, mobile menu, active link, scroll reveal, forms.
 * Runs after loader.js fires 'componentsReady'.
 */

export function onReady() {
  initNav();
  initScrollReveal();
  initForms();
}

/* ── Sticky Nav & Active Links ─────────────────────────────────────────── */
function initNav() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('nav-toggle');
  const menu     = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Scroll: add .scrolled class
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  // Close menu on link click
  navLinks.forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) menu.classList.remove('open');
  });
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  let current    = '';
  sections.forEach(s => { if (scrollY >= s.offsetTop) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

/* ── Scroll Reveal ─────────────────────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  const observe = () => {
    document.querySelectorAll('.reveal:not(.visible), .svc-card:not(.visible), .pf-card:not(.visible), .card:not(.visible), .team-card:not(.visible), .tech-badge:not(.visible), .about-glass:not(.visible)').forEach(el => observer.observe(el));
  };

  observe();
  setTimeout(observe, 300);

  // Counter animation for why-stats
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.why-stat-num[data-target]').forEach(el => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const step = 16;
        const increment = target / (duration / step);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = Math.floor(current) + suffix;
          if (current >= target) clearInterval(timer);
        }, step);
      });
      counterObserver.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  const statsEl = document.querySelector('.why-stats');
  if (statsEl) counterObserver.observe(statsEl);
}

/* ── Forms ─────────────────────────────────────────────────────────────── */
function initForms() {
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = Object.fromEntries(new FormData(contactForm));

      try {
        const res = await fetch('https://formspree.io/f/mojgnrob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          btn.textContent = 'Message Sent \u2713';
          btn.style.background = '#16a34a';
          contactForm.reset();
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
            btn.style.background = '';
          }, 3500);
        } else {
          const json = await res.json();
          console.error('Formspree error:', json);
          btn.textContent = 'Failed. Try again.';
          btn.style.background = '#dc2626';
          setTimeout(() => { btn.textContent = original; btn.disabled = false; btn.style.background = ''; }, 3000);
        }
      } catch (err) {
        console.error('Network error:', err);
        btn.textContent = 'Network Error.';
        btn.style.background = '#dc2626';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; btn.style.background = ''; }, 3000);
      }
    });
  }

  // Newsletter form
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = nlForm.querySelector('[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      btn.disabled = true;
      btn.style.background = '#16a34a';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        nlForm.reset();
      }, 3000);
    });
  }
}
