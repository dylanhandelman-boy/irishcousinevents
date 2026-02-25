/* ============================================================
   IRISH COUSIN EVENTS — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- Helpers ------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


  /* ---- 1. Navigation: scroll state --------------------- */
  const navHeader  = $('#nav-header');
  const SCROLL_THRESHOLD = 60;

  function updateNavScroll() {
    navHeader.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll(); // run once on load in case page is already scrolled


  /* ---- 2. Navigation: mobile toggle -------------------- */
  const navToggle = $('#nav-toggle');
  const navLinks  = $('#nav-links');

  function openMenu() {
    navLinks.classList.add('is-open');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    // Trap first link focus
    const firstLink = $('a', navLinks);
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  navToggle.addEventListener('click', () => {
    navLinks.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  // Close on any nav link click (including Book Now)
  $$('.nav-link', navLinks).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  // Close when clicking outside the nav
  document.addEventListener('click', e => {
    if (
      navLinks.classList.contains('is-open') &&
      !navHeader.contains(e.target)
    ) {
      closeMenu();
    }
  });


  /* ---- 3. Active nav link on scroll -------------------- */
  const sections = $$('section[id]');
  const navLinkEls = $$('.nav-link:not(.nav-link--cta)', navLinks);

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinkEls.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === `#${id}`);
        });
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(section => sectionObserver.observe(section));


  /* ---- 4. Scroll reveal (fade-in on scroll) ------------ */
  const revealElements = $$('.reveal');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // animate once
      });
    },
    {
      threshold: 0.10,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));


  /* ---- 5. Contact form ---------------------------------- */
  const form = $('#contact-form');

  if (form) {
    const submitBtn   = $('#submit-btn');
    const submitLabel = $('.submit-label', submitBtn);
    const successMsg  = $('#form-success');
    const errorMsg    = $('#form-error');

    form.addEventListener('submit', function handleSubmit(e) {
      e.preventDefault();

      // Reset previous feedback
      successMsg.hidden = true;
      errorMsg.hidden   = true;

      // Validate required fields
      const requiredFields = $$('[required]', form);
      let firstInvalid = null;

      requiredFields.forEach(field => {
        const isEmpty = !field.value.trim();
        if (isEmpty && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        errorMsg.hidden = false;
        firstInvalid.focus();
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // Loading state
      submitLabel.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Submit to Formspree
      const formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(response => {
          submitLabel.textContent = 'Send Message';
          submitBtn.disabled = false;
          if (response.ok) {
            successMsg.hidden = false;
            form.reset();
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            errorMsg.hidden = false;
            errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        })
        .catch(() => {
          submitLabel.textContent = 'Send Message';
          submitBtn.disabled = false;
          errorMsg.hidden = false;
          errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
  }


  /* ---- 6. Smooth scroll offset for fixed header -------- */
  // Native scroll-behavior: smooth is set in CSS.
  // This adjusts for the fixed nav bar height so section
  // headings aren't hidden behind it.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navHeader.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* ---- 7. Review system --------------------------------- */
  const reviewForm     = $('#review-form');
  const starRating     = $('#star-rating');
  const reviewSuccess  = $('#review-success');
  const reviewError    = $('#review-error');
  const allReviewsList = $('#all-reviews-list');   // reviews.html: all reviews

  let selectedRating = 0;

  if (starRating) {
    const starBtns = $$('.star-btn', starRating);

    // Click to select rating
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.value, 10);
        starBtns.forEach(b => {
          b.classList.toggle('is-active', parseInt(b.dataset.value, 10) <= selectedRating);
        });
      });

      // Hover preview
      btn.addEventListener('mouseenter', () => {
        const val = parseInt(btn.dataset.value, 10);
        starBtns.forEach(b => {
          const bVal = parseInt(b.dataset.value, 10);
          b.querySelector('svg').style.fill = bVal <= val ? '#C9A84C' : '';
        });
      });
    });

    starRating.addEventListener('mouseleave', () => {
      starBtns.forEach(b => {
        b.querySelector('svg').style.fill = '';
      });
    });
  }

  // Format name as "First L."
  function formatName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return parts[0];
    return parts[0] + ' ' + parts[parts.length - 1][0].toUpperCase() + '.';
  }

  // Build a testimonial blockquote element from review data
  function createTestimonialEl(review, showDate) {
    const bq = document.createElement('blockquote');
    bq.className = 'testimonial reveal is-visible';

    // Gold accent bar
    const bar = document.createElement('div');
    bar.className = 'testimonial-gold-bar';
    bar.setAttribute('aria-hidden', 'true');

    // Body wrapper
    const body = document.createElement('div');
    body.className = 'testimonial-body';

    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'testimonial-quote';
    quoteDiv.setAttribute('aria-hidden', 'true');
    quoteDiv.innerHTML = '\u201C';

    const textP = document.createElement('p');
    textP.className = 'testimonial-text';
    textP.textContent = review.text;

    const footer = document.createElement('footer');
    footer.className = 'testimonial-footer';

    const starsDiv = document.createElement('div');
    starsDiv.className = 'testimonial-stars';
    starsDiv.setAttribute('role', 'img');
    starsDiv.setAttribute('aria-label', review.rating + ' out of 5 stars');

    for (let i = 0; i < review.rating; i++) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('fill', '#C9A84C');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M8 1l1.91 3.88 4.28.62-3.1 3.02.73 4.27L8 10.77l-3.82 2.02.73-4.27L1.81 5.5l4.28-.62L8 1z');
      svg.appendChild(path);
      starsDiv.appendChild(svg);
    }

    const cite = document.createElement('cite');
    cite.className = 'testimonial-cite';
    cite.textContent = formatName(review.name);

    footer.appendChild(starsDiv);
    footer.appendChild(cite);

    // Optional date display
    if (showDate && review.date) {
      const dateSpan = document.createElement('span');
      dateSpan.className = 'testimonial-date';
      try {
        dateSpan.textContent = new Date(review.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      } catch (e) {
        dateSpan.textContent = '';
      }
      footer.appendChild(dateSpan);
    }

    body.appendChild(quoteDiv);
    body.appendChild(textP);
    body.appendChild(footer);

    bq.appendChild(bar);
    bq.appendChild(body);

    return bq;
  }

  // Reviews summary stats for reviews.html
  function updateReviewsSummary(reviews) {
    const summaryEl = $('#reviews-summary');
    const avgEl     = $('#avg-rating');
    const countEl   = $('#review-count');
    const starsEl   = $('#avg-stars');

    if (!summaryEl || !reviews.length) return;

    const total = reviews.reduce(function (sum, r) { return sum + (r.rating || 0); }, 0);
    const avg   = (total / reviews.length).toFixed(1);

    avgEl.textContent   = avg;
    countEl.textContent = reviews.length + (reviews.length === 1 ? ' review' : ' reviews');

    starsEl.innerHTML = '';
    var roundedAvg = Math.round(parseFloat(avg));
    for (var i = 0; i < 5; i++) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('fill', i < roundedAvg ? '#C9A84C' : 'rgba(201,168,76,0.25)');
      svg.setAttribute('aria-hidden', 'true');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M8 1l1.91 3.88 4.28.62-3.1 3.02.73 4.27L8 10.77l-3.82 2.02.73-4.27L1.81 5.5l4.28-.62L8 1z');
      svg.appendChild(path);
      starsEl.appendChild(svg);
    }

    summaryEl.hidden = false;
  }

  // Load reviews from Firebase — page-aware
  if (typeof reviewsDB !== 'undefined') {

    // REVIEWS PAGE: all reviews
    if (allReviewsList) {
      var allReviews = [];

      reviewsDB.orderByChild('date').once('value', function (snapshot) {
        allReviewsList.innerHTML = '';

        snapshot.forEach(function (child) { allReviews.push(child.val()); });
        allReviews.reverse(); // newest first

        if (allReviews.length === 0) {
          allReviewsList.innerHTML = '<p class="reviews-empty">No reviews yet. Be the first!</p>';
          return;
        }

        allReviews.forEach(function (review) {
          var el = createTestimonialEl(review, true);
          allReviewsList.appendChild(el);
        });

        updateReviewsSummary(allReviews);
      });

      // Real-time updates for new reviews
      var initialLoadDone = false;
      reviewsDB.once('value', function () { initialLoadDone = true; });

      reviewsDB.on('child_added', function (snapshot) {
        if (!initialLoadDone) return;
        var review = snapshot.val();
        if (review) {
          var el = createTestimonialEl(review, true);
          allReviewsList.insertBefore(el, allReviewsList.firstChild);
          allReviews.unshift(review);
          updateReviewsSummary(allReviews);
        }
      });
    }
  }

  // Handle review form submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      reviewSuccess.hidden = true;
      reviewError.hidden = true;

      var name = $('#review-name').value.trim();
      var text = $('#review-text').value.trim();

      if (!name || !text || selectedRating === 0) {
        reviewError.hidden = false;
        return;
      }

      var review = { name: name, text: text, rating: selectedRating, date: new Date().toISOString() };

      if (typeof reviewsDB !== 'undefined') {
        reviewsDB.push(review);
      }

      reviewForm.reset();
      selectedRating = 0;
      $$('.star-btn', starRating).forEach(function (b) { b.classList.remove('is-active'); });
      reviewSuccess.hidden = false;
    });
  }


  /* ---- 8. Gallery keyboard support --------------------- */
  // Gallery items have tabindex="0" — allow Enter/Space to "activate"
  $$('.gallery-item').forEach(item => {
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Toggle the caption visible state for keyboard users
        item.classList.toggle('is-focused');
      }
    });
  });

})();
