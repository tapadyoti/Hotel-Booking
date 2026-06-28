/* ============================================================
    app.js
   Shared functionality across all pages
   ============================================================ */

/* ── Theme Management ─────────────────────────────────────── */
const ThemeManager = (() => {
  const key = 'lumiere_theme';
  const toggle = document.getElementById('theme-toggle');

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(key, theme);
  }

  function init() {
    const saved = localStorage.getItem(key) || 'dark';
    apply(saved);
    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        apply(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  return { init };
})();

/* ── Loading Screen ───────────────────────────────────────── */
const Loader = (() => {
  function init() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;
    window.addEventListener('load', () => {
      setTimeout(() => screen.classList.add('hidden'), 900);
    });
  }
  return { init };
})();

/* ── Sticky Navbar ────────────────────────────────────────── */
const Navbar = (() => {
  function init() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');
    const progressBar = document.getElementById('progress-bar');

    if (!navbar) return;

    // Scroll effects
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Sticky class
      if (scrollY > 60) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');

      // Reading progress bar
      if (progressBar) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = `${(scrollY / docH) * 100}%`;
      }

      // Back to top
      const backBtn = document.getElementById('back-to-top');
      if (backBtn) {
        if (scrollY > 400) backBtn.classList.add('show');
        else backBtn.classList.remove('show');
      }
    });

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    // Close mobile menu on link click
    document.querySelectorAll('#mobile-menu .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Active link highlight
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      if (link.dataset.page === currentPage) link.classList.add('active');
    });
  }

  return { init };
})();

/* ── Scroll Reveal Animations ─────────────────────────────── */
const ScrollReveal = (() => {
  function init() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ── Back to Top ──────────────────────────────────────────── */
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  return { init };
})();

/* ── Image Sliders ────────────────────────────────────────── */
const Slider = (() => {
  function init(containerSelector) {
    document.querySelectorAll(containerSelector || '.slider-container').forEach(container => {
      const track = container.querySelector('.slider-track');
      const slides = container.querySelectorAll('.slide');
      const prevBtn = container.querySelector('.slider-prev');
      const nextBtn = container.querySelector('.slider-next');
      const dotsContainer = container.querySelector('.slider-dots');

      if (!track || !slides.length) return;

      let current = 0;
      let autoplayTimer;

      // Create dots
      if (dotsContainer) {
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
          dot.setAttribute('aria-label', `Slide ${i + 1}`);
          dot.addEventListener('click', () => goTo(i));
          dotsContainer.appendChild(dot);
        });
      }

      function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dotsContainer?.querySelectorAll('.slider-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }

      function startAutoplay() {
        autoplayTimer = setInterval(() => goTo(current + 1), 4500);
      }

      function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
      }

      if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

      // Touch swipe support
      let touchStartX = 0;
      container.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
      container.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAutoplay(); }
      });

      startAutoplay();
    });
  }

  return { init };
})();

/* ── FAQ Accordion ────────────────────────────────────────── */
const FAQ = (() => {
  function init() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }
  return { init };
})();

/* ── Smooth Scroll for anchor links ──────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ── Testimonials Carousel ────────────────────────────────── */
const Testimonials = (() => {
  function init() {
    const container = document.querySelector('.testimonials-slider');
    if (!container) return;
    // Simple fade rotation for testimonials
    const cards = container.querySelectorAll('.testimonial-card');
    let current = 0;
    if (cards.length <= 1) return;
    setInterval(() => {
      cards[current].style.opacity = '0';
      cards[current].style.transform = 'scale(0.97)';
      current = (current + 1) % cards.length;
      cards[current].style.opacity = '1';
      cards[current].style.transform = 'scale(1)';
    }, 5000);
  }
  return { init };
})();

/* ── Number Counter Animation ─────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (el.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

/* ── Init all on DOMContentLoaded ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Loader.init();
  Navbar.init();
  ScrollReveal.init();
  BackToTop.init();
  Slider.init();
  FAQ.init();
  initSmoothScroll();

  // Counter animation on scroll
  const counterSection = document.querySelector('[data-counter-section]');
  if (counterSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(counterSection);
  }
});