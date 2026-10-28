/* Native chapter links work without JavaScript. Enhancement shows one spread. */
(() => {
  const reader = document.querySelector('.reader');
  const spreads = [...document.querySelectorAll('[data-spread]')];
  const controls = document.querySelector('.reader-controls');
  const previous = document.querySelector('#previous-chapter');
  const next = document.querySelector('#next-chapter');
  const readout = document.querySelector('#chapter-readout');
  if (!reader || !spreads.length || !controls || !previous || !next || !readout) return;
  const labels = ['Hello', 'Savvy', 'OUTPUT', 'EZNest', 'Agents', 'Footnotes'];
  const projects = ['savvy', 'output', 'eznest', 'maiat'];
  let current = 0;
  let activeProject = 'savvy';
  function spreadForHash(hash) {
    if (hash === '#work') return 1;
    const direct = spreads.findIndex(spread => `#${spread.id}` === hash);
    if (direct >= 0) return direct;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    return target ? spreads.indexOf(target.closest('[data-spread]')) : 0;
  }
  function selectProject(key) {
    if (!projects.includes(key)) return;
    activeProject = key;
    document.documentElement.dataset.activeProject = key;
    const link = document.querySelector('#cabinet-read-chapter');
    link.href = `#project-${key}`;
    link.dataset.chapter = `project-${key}`;
    link.textContent = `Read the ${({savvy: 'Savvy', output: 'OUTPUT', eznest: 'EZNest', maiat: 'Maiat + Dojo'})[key]} chapter ↗`;
    document.dispatchEvent(new CustomEvent('projectchange', {detail: key}));
  }
  function showChapter(index, navigate = false, targetHash = null) {
    current = Math.max(0, Math.min(spreads.length - 1, index));
    spreads.forEach((spread, i) => { spread.hidden = i !== current; });
    document.querySelectorAll('.chapter-tabs a').forEach(link => {
      if (link.dataset.chapter === spreads[current].id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    previous.disabled = current === 0;
    next.disabled = current === spreads.length - 1;
    readout.textContent = `${String(current + 1).padStart(2, '0')} / ${String(spreads.length).padStart(2, '0')} — ${labels[current]}`;
    if (current >= 1 && current <= 4) selectProject(projects[current - 1]);
    document.dispatchEvent(new CustomEvent('chapterchange', {detail: spreads[current].id}));
    if (navigate) {
      const destination = targetHash || `#${spreads[current].id}`;
      if (location.hash !== destination) history.pushState(null, '', destination);
      const target = destination === `#${spreads[current].id}` ? reader : document.getElementById(destination.slice(1));
      (target || reader).scrollIntoView({block: 'start'});
      const heading = spreads[current].querySelector('h1,h2');
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll: true});
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-chapter]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    const index = spreadForHash(link.getAttribute('href'));
    if (index < 0) return;
    event.preventDefault(); showChapter(index, true, link.getAttribute('href'));
  });
  document.querySelectorAll('[data-cabinet]').forEach(button => button.addEventListener('click', () => selectProject(button.dataset.cabinet)));
  previous.addEventListener('click', () => showChapter(current - 1, true));
  next.addEventListener('click', () => showChapter(current + 1, true));
  const restore = () => showChapter(Math.max(0, spreadForHash(location.hash)));
  window.addEventListener('popstate', restore);
  window.addEventListener('hashchange', restore);
  document.documentElement.dataset.projectNavigation = 'ready';
  selectProject(activeProject);
  restore();
  controls.hidden = false;
  reader.classList.add('reader-enhanced');
})();
