/**
 * Seed 芥子 — Main Application Script
 * Handles dynamic content rendering, animations, and interactions.
 */

(async function() {
  'use strict';

  // ---------- Helper functions (defined first to avoid TDZ issues) ----------

  function updateLangButton(lang) {
    const label = document.getElementById('langLabel');
    if (label) {
      label.textContent = lang === 'zh' ? 'EN' : '中文';
    }
  }

  // ---------- Render Functions ----------

  function renderAllSections(data) {
    if (!data) return;
    renderProblemGrid(data);
    renderLevelsGrid(data);
    renderSecurityGrid(data);
    renderStatsGrid(data);
    renderLanguageBadges(data);
    renderWorkflow(data);
    renderUseCases(data);
    renderDistribution(data);
    // Re-observe for animations
    observeAnimations();
  }

  function renderProblemGrid(data) {
    const grid = document.getElementById('problemGrid');
    if (!grid || !data.problem || !data.problem.items) return;
    grid.innerHTML = data.problem.items.map((item, i) => `
      <div class="problem-card fade-in" style="transition-delay: ${i * 0.1}s">
        <div class="problem-icon pain">✕</div>
        <div class="problem-text">
          <div class="problem-pain">${item.pain}</div>
          <div class="problem-solution">${item.solution}</div>
        </div>
      </div>
    `).join('');
  }

  function renderLevelsGrid(data) {
    const grid = document.getElementById('levelsGrid');
    if (!grid || !data.protection || !data.protection.levels) return;
    grid.innerHTML = data.protection.levels.map((level, i) => {
      const stars = '★'.repeat(level.stars) + '☆'.repeat(5 - level.stars);
      const recommended = level.recommended ? ' recommended' : '';
      const recLabel = (data.protection && data.protection.recommended) || 'Recommended';
      const perfLabel = (data.protection && data.protection.perfImpact) || 'Perf. Impact';
      return `
        <div class="level-card${recommended} fade-in" style="transition-delay: ${i * 0.15}s">
          <div class="level-name">${level.name}</div>
          <div class="level-label">${level.label}</div>
          ${level.recommended ? `<div class="level-badge">${recLabel}</div>` : ''}
          <div class="level-stars">${stars}</div>
          <div class="level-perf">${perfLabel}: ${level.perf}</div>
          <div class="level-desc">${level.desc}</div>
        </div>
      `;
    }).join('');
  }

  function renderSecurityGrid(data) {
    const grid = document.getElementById('securityGrid');
    if (!grid || !data.security || !data.security.features) return;
    grid.innerHTML = data.security.features.map((feat, i) => `
      <div class="security-card fade-in" style="transition-delay: ${i * 0.05}s">
        <div class="security-icon">${feat.icon}</div>
        <div class="security-name">${feat.name}</div>
        <div class="security-desc">${feat.desc}</div>
      </div>
    `).join('');
  }

  function renderStatsGrid(data) {
    const grid = document.getElementById('statsGrid');
    if (!grid || !data.stats || !data.stats.items) return;
    grid.innerHTML = data.stats.items.map((stat, i) => `
      <div class="stat-card fade-in" style="transition-delay: ${i * 0.1}s">
        <span class="stat-value">${stat.value}</span>
        <span class="stat-label">${stat.label}</span>
      </div>
    `).join('');
  }

  function renderLanguageBadges(data) {
    const tier1 = document.getElementById('tier1Badges');
    const tier2 = document.getElementById('tier2Badges');
    if (!tier1 || !tier2 || !data.languages) return;

    if (data.languages.tier1) {
      tier1.innerHTML = data.languages.tier1.map(lang => `
        <span class="lang-badge tier1"><span class="lang-dot"></span>${lang}</span>
      `).join('');
    }

    if (data.languages.tier2) {
      tier2.innerHTML = data.languages.tier2.map(lang => `
        <span class="lang-badge"><span class="lang-dot"></span>${lang}</span>
      `).join('');
    }
  }

  function renderWorkflow(data) {
    const container = document.getElementById('workflowSteps');
    if (!container || !data.workflow || !data.workflow.steps) return;
    container.innerHTML = data.workflow.steps.map((step, i) => `
      <div class="step-card fade-in" style="transition-delay: ${i * 0.15}s">
        <div class="step-num">${step.num}</div>
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.desc}</div>
      </div>
    `).join('');
  }

  function renderUseCases(data) {
    const grid = document.getElementById('usecasesGrid');
    if (!grid || !data.useCases || !data.useCases.items) return;
    grid.innerHTML = data.useCases.items.map((item, i) => `
      <div class="usecase-card fade-in" style="transition-delay: ${i * 0.1}s">
        <div class="usecase-icon">${item.icon}</div>
        <div class="usecase-name">${item.name}</div>
        <div class="usecase-desc">${item.desc}</div>
      </div>
    `).join('');
  }

  function renderDistribution(data) {
    const grid = document.getElementById('distributionGrid');
    if (!grid || !data.distribution || !data.distribution.modes) return;
    const recLabel = (data.protection && data.protection.recommended) || 'Recommended';
    grid.innerHTML = data.distribution.modes.map((mode, i) => `
      <div class="dist-card${mode.recommended ? ' recommended' : ''} fade-in" style="transition-delay: ${i * 0.15}s">
        <div class="dist-name">${mode.name}</div>
        <div class="dist-product">${mode.product}</div>
        <div class="dist-scenario">${mode.scenario}</div>
        ${mode.recommended ? `<div class="dist-badge">${recLabel}</div>` : ''}
      </div>
    `).join('');
  }

  // ---------- Intersection Observer for animations ----------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  function observeAnimations() {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ---------- Initialize i18n ----------
  const lang = await I18n.init();
  updateLangButton(lang);

  // Listen for language changes to re-render dynamic content
  I18n.onChange((newLang, data) => {
    updateLangButton(newLang);
    renderAllSections(data);
  });

  // Initial render
  renderAllSections(I18n.getData());

  // ---------- Language Toggle ----------
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await I18n.toggle();
      } catch (err) {
        console.error('[app] Language toggle failed:', err);
      }
    });
  }

  // ---------- Navbar Scroll ----------
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ---------- Mobile Menu ----------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileMenuBtn.classList.remove('active');
      });
    });
  }

  // ---------- Smooth scroll for anchor links (only page-internal) ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // Only intercept in-page anchors (starting with #), not external pages
      if (href && href.startsWith('#') && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ---------- Active nav link highlight ----------
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }, { passive: true });

})();
