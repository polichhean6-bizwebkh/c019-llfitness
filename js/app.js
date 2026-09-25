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

  /* ---------- Enquiry form: real submission via FormSubmit (AJAX) ----------
     Static site, no backend — FormSubmit.co relays the POST straight to
     info@llfitness-kh.com. The destination inbox only needs to click one
     one-time "activation" link the first time a submission comes through;
     after that every future submission delivers automatically. */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@llfitness-kh.com';

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var submitBtn = contactForm.querySelector('.submit-btn');
    var formNote = document.getElementById('formNote');
    var submitBtnDefaultText = submitBtn ? submitBtn.textContent : 'SUBMIT';
    var isSubmitting = false;

    function setNote(message, state) {
      if (!formNote) return;
      formNote.textContent = message;
      formNote.classList.remove('form-note--success', 'form-note--error');
      if (state) formNote.classList.add('form-note--' + state);
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (isSubmitting) return; // prevent double submission

      // Required-field validation (native browser validation UI)
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Honeypot: real visitors never fill this hidden field. If it's
      // filled, quietly pretend success without sending anything.
      var honey = document.getElementById('formHoney');
      if (honey && honey.value) {
        contactForm.reset();
        setNote('Thank you! Your enquiry has been sent successfully. Our team will contact you shortly.', 'success');
        return;
      }

      var contactMethodEl = contactForm.querySelector('input[name="contactMethod"]:checked');

      var payload = {
        'First Name': document.getElementById('fname').value.trim(),
        'Last Name': document.getElementById('lname').value.trim(),
        'Email': document.getElementById('email').value.trim(),
        'Phone': document.getElementById('phone').value.trim(),
        'Service': document.getElementById('service').value || 'Not specified',
        'Preferred Contact Method': contactMethodEl ? contactMethodEl.value : 'Not specified',
        'How They Heard About Us': document.getElementById('source').value.trim() || 'Not specified',
        'Message': document.getElementById('message').value.trim() || 'Not provided',
        'Submitted At': new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }) + ' (Phnom Penh time)',
        '_subject': 'New Website Enquiry – LL Fitness',
        '_template': 'table',
        '_captcha': 'false'
      };

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING…';
      }
      setNote('Sending your enquiry…');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed with status ' + res.status);
          return res.json();
        })
        .then(function () {
          setNote('Thank you! Your enquiry has been sent successfully. Our team will contact you shortly.', 'success');
          contactForm.reset();
        })
        .catch(function () {
          setNote('Sorry, we couldn’t send your enquiry. Please try again or contact us directly.', 'error');
          // Form is intentionally NOT reset here so the visitor doesn't lose their input.
        })
        .finally(function () {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtnDefaultText;
          }
        });
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
