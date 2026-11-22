(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const data = JSON.parse($('#site-data').textContent);
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const read = (key, fallback = null) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* The current page remains usable without storage. */ } };
  let theme = read('jhinresh-theme');
  const syncTheme = () => {
    const dark = theme === 'dark' || (theme !== 'light' && system.matches);
    root.classList.toggle('dark', dark);
    if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;
    else delete root.dataset.theme;
    $('meta[name="color-scheme"]').content = dark ? 'dark' : 'light';
    $('meta[name="theme-color"]').content = dark ? '#171719' : '#ffffff';
    $('.theme-toggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  syncTheme();
  $('.theme-toggle').addEventListener('click', () => {
    theme = root.classList.contains('dark') ? 'light' : 'dark';
    write('jhinresh-theme', theme);
    syncTheme();
    dispatchEvent(new CustomEvent('jhinresh:theme-change', { detail: { theme } }));
  });
  // Same-page controls already applied the selected override to the root.
  // Read that live state so blocked storage cannot undo Light/Dark/System.
  addEventListener('jhinresh:theme-change', () => { theme = root.dataset.theme || null; syncTheme(); });
  system.addEventListener('change', syncTheme);
  addEventListener('storage', (event) => {
    if (event.key === 'jhinresh-theme' || event.key === null) { theme = read('jhinresh-theme'); syncTheme(); }
  });
  $('.theme-toggle').hidden = false;

  window.JhinreshBookshelf?.mount($('#personal-bookshelf'), data.books);
  const greeting = $('#about-greeting');
  const updateGreeting = () => {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  };
  updateGreeting();
  const greetingTimer = setInterval(updateGreeting, 60000);
  addEventListener('pagehide', (event) => { if (!event.persisted) clearInterval(greetingTimer); });


  // Screenshot previews keep ordinary links intact and require no third-party frame.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let activePreview = null;
  const dismissPreview = () => {
    if (!activePreview) return;
    activePreview.card.hidden = true;
    activePreview = null;
  };
  data.projects.forEach(project => {
    const row = $('#project-' + project.id);
    const link = row?.querySelector('h3 a');
    if (!row || !link || !project.preview) return;
    const card = document.createElement('div');
    card.id = 'preview-' + project.id;
    card.className = 'project-preview';
    card.setAttribute('role', 'tooltip');
    card.hidden = true;
    const bar = document.createElement('div');
    bar.className = 'project-preview-bar';
    bar.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 3; index++) {
      const dot = document.createElement('span'); dot.className = 'project-preview-dot'; bar.append(dot);
    }
    const domain = document.createElement('span');
    domain.className = 'project-preview-domain'; domain.textContent = new URL(project.href).hostname; bar.append(domain);
    const image = document.createElement('img');
    image.src = project.preview; image.alt = ''; image.decoding = 'async';
    const caption = document.createElement('span');
    caption.className = 'project-preview-caption'; caption.textContent = project.caption;
    card.append(bar, image, caption); document.body.append(card);
    link.setAttribute('aria-describedby', card.id);
    let timer, hovered = false, overCard = false, suppressed = false;
    const interested = () => hovered || overCard || row.contains(document.activeElement);
    const hide = () => { clearTimeout(timer); if (activePreview?.card === card) dismissPreview(); };
    const show = () => {
      clearTimeout(timer);
      if (suppressed || !interested() || !row.getClientRects().length) return;
      dismissPreview(); card.hidden = false; activePreview = {card};
      const rect = row.getBoundingClientRect();
      const width = card.offsetWidth, height = card.offsetHeight;
      const rightFits = rect.right + width + 12 <= innerWidth - 12;
      const left = rightFits ? rect.right + 12 : Math.max(12, Math.min(rect.right - width, innerWidth - width - 12));
      const top = rightFits ? rect.top - 28 : rect.top - height - 10 >= 12 ? rect.top - height - 10 : rect.bottom + 10;
      card.style.left = left + 'px';
      card.style.top = Math.max(12, Math.min(top, innerHeight - height - 12)) + 'px';
    };
    const loseInterest = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!interested()) { hide(); suppressed = false; } }, 160);
    };
    row.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || !finePointer.matches) return;
      hovered = true; clearTimeout(timer); timer = setTimeout(show, 160);
    });
    row.addEventListener('pointerleave', () => { hovered = false; loseInterest(); });
    row.addEventListener('focusin', event => {
      if (!row.contains(event.relatedTarget)) suppressed = false;
      clearTimeout(timer); timer = setTimeout(show, 160);
    });
    row.addEventListener('focusout', event => {
      if (!row.contains(event.relatedTarget)) suppressed = false;
      loseInterest();
    });
    card.addEventListener('pointerenter', () => { overCard = true; clearTimeout(timer); });
    card.addEventListener('pointerleave', () => { overCard = false; loseInterest(); });
    row.addEventListener('click', hide);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && activePreview?.card === card) { suppressed = true; hide(); }
    });
    // Scroll/resize invalidate the original row position. A new entry can reveal it again.
    const invalidate = () => {
      hide();
      // Keyboard focus may scroll smoothly into view; reveal after that settles.
      if (!suppressed && row.contains(document.activeElement)) timer = setTimeout(show, 160);
    };
    window.addEventListener('scroll', invalidate, {passive: true});
    window.addEventListener('resize', invalidate);
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  });

  const searchDialog = $('#search-dialog');
  const destinations = [
    ...data.projects.map(p => ({ name: p.name, detail: p.description, href: p.href })),
    ...data.books.map(b => ({ name: b.title, detail: 'Bookshelf · ' + b.author, href: '#bookshelf' })),
    { name: 'My projects', detail: `${data.projects.length} products in progress`, href: '#work' },
    { name: 'Stack', detail: 'SwiftUI, TypeScript, Solidity, and more', href: '#stack' },
    { name: 'About Jerry', detail: 'A little about me', href: '#about' },
    { name: 'GitHub activity', detail: 'Public development activity', href: '#activity' },
    { name: 'Milestones', detail: '12 project milestones', href: '#recognition' },
    { name: 'Substack', detail: 'Notes along the way', href: 'https://substack.com/@jhinresh' },
    { name: 'Say hello', detail: data.email, href: 'mailto:' + data.email }
  ];
  function renderSearch() {
    const query = $('#search-input').value.toLowerCase().trim();
    const result = $('#search-results'); result.replaceChildren();
    const found = destinations.filter(d => (d.name + ' ' + d.detail).toLowerCase().includes(query));
    found.forEach(item => {
      const link = document.createElement('a'); link.href = item.href;
      const label = document.createElement('span'); label.textContent = item.name;
      const detail = document.createElement('small'); detail.textContent = item.detail;
      link.append(label, detail);
      if (/^https:/.test(item.href)) { link.target = '_blank'; link.rel = 'noreferrer'; }
      link.addEventListener('click', () => searchDialog.close()); result.append(link);
    });
    if (!found.length) { const note = document.createElement('p'); note.className = 'fine-print'; note.textContent = 'No results. Try Savvy, Bookshelf, or GitHub.'; result.append(note); }
  }
  function openSearch() { renderSearch(); if (!searchDialog.open) searchDialog.showModal(); $('#search-input').focus(); }
  $$('[data-search]').forEach(button => button.addEventListener('click', openSearch));
  $('#search-input').addEventListener('input', renderSearch);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (searchDialog.open) searchDialog.close(); else openSearch(); }
  });
  // closedby is progressive enhancement; Safari gets the same outside-pointer dismissal.
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    $$('dialog[closedby="any"]').forEach(dialog => {
      const outside = event => { const r = dialog.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; };
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', event => { pressedOutside = outside(event); });
      dialog.addEventListener('pointerup', event => { if (pressedOutside && outside(event)) dialog.close(); pressedOutside = false; });
    });
  }

  const days = data.github.contributionsCollection.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  function describe(day) { return `${day.date} · ${day.contributionCount} contributions`; }
  const heatmap = $('#contribution-grid');
  // Leave the earlier weekdays in the first partial week empty.
  const leadingDays = new Date(days[0].date).getUTCDay();
  for (let day = 0; day < leadingDays; day++) {
    heatmap.append(document.createElement('span'));
  }
  days.forEach((day, index) => {
    const cell = document.createElement('button'); cell.type = 'button';
    const value = day.contributionCount;
    cell.dataset.level = value === 0 ? '0' : value < 40 ? '1' : value < 80 ? '2' : value < 140 ? '3' : '4';
    cell.title = describe(day); cell.setAttribute('aria-label', describe(day)); cell.tabIndex = index === days.length - 1 ? 0 : -1;
    const select = () => { $('#contribution-detail').textContent = describe(day) + ` · Snapshot ${data.snapshotDate}`; };
    cell.addEventListener('click', select); cell.addEventListener('focus', select);
    cell.addEventListener('keydown', event => {
      let target = index;
      if (event.key === 'ArrowRight') target += 7; else if (event.key === 'ArrowLeft') target -= 7;
      else if (event.key === 'ArrowDown') target++; else if (event.key === 'ArrowUp') target--;
      else if (event.key === 'Home') target = 0; else if (event.key === 'End') target = days.length - 1; else return;
      event.preventDefault(); target = Math.max(0, Math.min(days.length - 1, target));
      const next = heatmap.children[target + leadingDays]; cell.tabIndex = -1; next.tabIndex = 0; next.focus();
    });
    heatmap.append(cell);
  });
  // Native links still work without IntersectionObserver or JavaScript.
  const navigationLinks = $$('.site-header .nav-tab');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const id = visible[0].target.id;
      navigationLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + id;
        if (active) link.setAttribute('data-accent', ''); else link.removeAttribute('data-accent');
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-5% 0px -55% 0px', threshold: [0, .2, .6] });
    $$('#work, #about, #writing').forEach(section => observer.observe(section));
  }
})();
