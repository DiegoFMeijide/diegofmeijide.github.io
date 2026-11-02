(() => {
  'use strict';
  const controls = document.querySelectorAll('[data-language]');
  document.querySelectorAll('.summary-toggle').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.hidden = false;
    panel.hidden = true;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });
  function languageFromUrl() {
    return new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';
  }
  function setLanguage(language, announce = false) {
    const copy = siteCopy[language];
    document.documentElement.lang = language;
    document.title = copy.pageTitle;
    document.querySelector('meta[name="description"]').content = copy.pageDescription;
    document.querySelector('meta[property="og:title"]').content = copy.pageTitle;
    document.querySelector('meta[property="og:description"]').content = copy.pageDescription;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = copy[element.dataset.i18n];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      element.setAttribute('aria-label', copy[element.dataset.i18nAria]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      element.alt = copy[element.dataset.i18nAlt];
    });
    document.querySelectorAll('.original-title [data-i18n$="OriginalTitle"]').forEach(element => {
      const key = element.dataset.i18n;
      element.closest('.original-title').hidden = copy[key] === copy[key.replace('OriginalTitle', 'Title')];
    });
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    if (announce) document.getElementById('language-status').textContent = copy.currentLanguageLabel;
  }
  controls.forEach(button => button.addEventListener('click', () => {
    const language = button.dataset.language;
    setLanguage(language, true);
    const url = new URL(location.href);
    if (language === 'es') url.searchParams.set('lang', 'es');
    else url.searchParams.delete('lang');
    // A static file opened directly should remain usable even if history is restricted.
    try { history.replaceState(null, '', url); } catch { /* Language still changes. */ }
  }));
  window.addEventListener('popstate', () => setLanguage(languageFromUrl()));
  setLanguage(languageFromUrl());

  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionLinks = [...document.querySelectorAll('.header nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = sectionLinks.find(item => item.hash === '#' + entry.target.id);
        if (entry.isIntersecting) {
          sectionLinks.forEach(item => item.removeAttribute('aria-current'));
          link?.setAttribute('aria-current', 'location');
        } else link?.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
