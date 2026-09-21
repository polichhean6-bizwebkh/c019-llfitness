(function () {
  var PAGES = ['home', 'about', 'services', 'contact', 'rewards'];
  var DEFAULT_PAGE = 'home';

  function getPageFromHash() {
    var hash = (window.location.hash || '').replace('#', '').trim();
    return PAGES.indexOf(hash) !== -1 ? hash : DEFAULT_PAGE;
  }

  function pageTitle(page) {
    var names = {
      home: 'LLFitness Phnom Penh | Personal Training, Physiotherapy & Nutrition',
      about: 'LLFitness — About Us',
      services: 'LLFitness — Services',
      contact: 'LLFitness — Contact',
      rewards: 'LLFitness — Rewards Circle'
    };
    return names[page] || 'LLFitness';
  }

  function showPage(page) {
    PAGES.forEach(function (p) {
      var section = document.getElementById('view-' + p);
      if (section) section.classList.toggle('hidden', p !== page);
    });

    document.querySelectorAll('[data-nav]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-nav') === page);
    });

    var nav = document.getElementById('mainNav');
    if (nav) nav.classList.remove('open');

    window.scrollTo(0, 0);
    document.title = pageTitle(page);

    armEntranceAnimations();
  }

  function navigate(page) {
    if (window.location.hash === '#' + page) {
      showPage(page);
    } else {
      window.location.hash = page;
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-nav]');
    if (el) {
      e.preventDefault();
      navigate(el.getAttribute('data-nav'));
    }
  });

  var toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.getElementById('mainNav').classList.toggle('open');
    });
  }

  window.addEventListener('hashchange', function () {
    showPage(getPageFromHash());
  });

  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('show', window.scrollY > 500);
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Team card "Read More" expand ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.read-more-btn');
    if (!btn) return;
    var card = btn.closest('.team-card');
    if (!card) return;
    var expanded = card.classList.toggle('expanded');
    btn.innerHTML = expanded
      ? 'Read Less <span class="arrow">→</span>'
      : 'Read More <span class="arrow">→</span>';
  });

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      if (note) {
        note.textContent = 'Thank you — your enquiry has been received.';
      }
      contactForm.reset();
    });
  }

  /* ---------- Entrance animations ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var observer = null;

  function armEntranceAnimations() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    document.body.classList.add('anim-ready');

    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }

    var activePage = document.querySelector('main > section:not(.hidden)');
    var scope = activePage || document;
    var targets = scope.querySelectorAll('[data-animate]:not(.in-view)');

    targets.forEach(function (el, i) {
      var delay = Math.min(i % 6, 5) * 60;
      el.style.transitionDelay = delay + 'ms';
      observer.observe(el);
    });
  }

  showPage(getPageFromHash());
})();
