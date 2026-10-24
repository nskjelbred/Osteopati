(() => {
  'use strict';
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const I18N = window.I18N || {};
  const LANGS = ['nn', 'en', 'de'];
  const CODES = { nn: 'NO', en: 'EN', de: 'DE' };
  const t = (key) => (I18N[root.dataset.lang] || {})[key] || I18N.nn[key];

  root.classList.add('js');

  // === Theme ===
  const themeBtn = document.getElementById('theme-btn');
  const isDark = () => (root.getAttribute('data-theme') || (mq.matches ? 'dark' : 'light')) === 'dark';
  themeBtn?.addEventListener('click', () => {
    const mode = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', mode);
    store.set('theme', mode);
  });

  // === Mobile menu ===
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      setMenu(open);
      if (open) nav.querySelector('a')?.focus();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  // === Language ===
  // The Norwegian text is the page markup itself. Remember it so we can switch back.
  const pairs = (el) => el.dataset.i18nAttr.split(',').map(p => p.split(':').map(s => s.trim()));
  const original = new Map();
  document.querySelectorAll('[data-i18n]').forEach(el => original.set(el, { html: el.innerHTML }));
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const o = original.get(el) || {};
    o.attrs = Object.fromEntries(pairs(el).map(([a]) => [a, el.getAttribute(a)]));
    original.set(el, o);
  });

  const langBtn = document.getElementById('lang-btn');
  const langMenu = document.getElementById('lang-menu');

  function setLang(lang) {
    const dict = lang === 'nn' ? {} : I18N[lang] || {};
    original.forEach((o, el) => {
      if (o.html !== undefined) el.innerHTML = dict[el.dataset.i18n] ?? o.html;
      if (o.attrs) pairs(el).forEach(([a, k]) => el.setAttribute(a, dict[k] ?? o.attrs[a]));
    });
    document.querySelectorAll('[data-lang-panel]').forEach(p => { p.hidden = p.dataset.langPanel !== lang; });
    root.lang = lang;
    root.dataset.lang = lang;
    if (langBtn) {
      langBtn.querySelector('.flag').className = `flag flag-${lang}`;
      langBtn.querySelector('.lang-code').textContent = CODES[lang];
      langMenu.querySelectorAll('[data-set-lang]').forEach(a => a.setAttribute('aria-current', String(a.dataset.setLang === lang)));
    }
    if (menuBtn) menuBtn.setAttribute('aria-label', t(nav.classList.contains('open') ? 'menu.close' : 'menu.open'));
    root.classList.remove('i18n-wait');
  }

  function setLangMenu(open) {
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', String(open));
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener('click', () => {
      const open = langMenu.hidden;
      setLangMenu(open);
      if (open) langMenu.querySelector('[aria-current="true"]')?.focus();
    });
    langMenu.addEventListener('click', (e) => {
      const a = e.target.closest('[data-set-lang]');
      if (!a) return;
      e.preventDefault();
      store.set('lang', a.dataset.setLang);
      setLang(a.dataset.setLang);
      setLangMenu(false);
      langBtn.focus();
    });
  }

  // A ?lang= link is an explicit choice, so remember it like a menu click.
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) store.set('lang', fromUrl);
  setLang(LANGS.includes(root.dataset.lang) ? root.dataset.lang : 'nn');

  // === Close open menus on outside click / Escape ===
  document.addEventListener('click', (e) => {
    if (nav?.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    if (langMenu && !langMenu.hidden && !langMenu.contains(e.target) && !langBtn.contains(e.target)) setLangMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav?.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    if (langMenu && !langMenu.hidden) { setLangMenu(false); langBtn.focus(); }
  });
})();
