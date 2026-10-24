(() => {
  'use strict';
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

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
    menuBtn.setAttribute('aria-label', open ? 'Lukk meny' : 'Opne meny');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      setMenu(open);
      if (open) nav.querySelector('a')?.focus();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  // === Language tabs (om-meg) ===
  const tabs = [...document.querySelectorAll('.lang-tabs [role="tab"]')];
  if (tabs.length) {
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      store.set('lang', tab.dataset.lang);
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (step) select(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find(t => t.dataset.lang === store.get('lang')) || tabs[0]);
  }
})();
