/* Round 2: mobile tools open above the archive, preserving the browsing position. */
(() => {
  'use strict';
  // Browser chrome follows the theme's surface instead of a separate colour.
  const themeChrome = document.querySelector('meta[name="theme-color"]');
  if (themeChrome) themeChrome.content = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
  const mobile = matchMedia('(max-width: 760px)');
  const page = document.querySelector('#archive-page');
  let current = null, openDialog = null, returnFocus = null, savedScroll = 0;
  const moved = [];
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function close(restore = true) {
    if (!openDialog) return;
    const dialog = openDialog;
    openDialog = null;
    dialog.close();
    document.body.classList.remove('rr-modal-open');
    window.scrollTo({top: savedScroll, behavior: 'instant'});
    if (restore && returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  }
  function open(dialog, trigger) {
    if (openDialog) close(false);
    savedScroll = window.scrollY;
    returnFocus = trigger;
    openDialog = dialog;
    document.body.classList.add('rr-modal-open');
    dialog.showModal();
    dialog.querySelector('.rr-close').focus({preventScroll: true});
  }
  function dialog(title, kind) {
    const node = make('dialog', `rr-dialog rr-${kind}`);
    const header = make('header', 'rr-dialog-header');
    const heading = make('h2', '', title);
    heading.id = `rr-title-${kind}`;
    node.setAttribute('aria-labelledby', heading.id);
    const dismiss = make('button', 'rr-close', '×');
    dismiss.type = 'button'; dismiss.setAttribute('aria-label', `Close ${title.toLowerCase()}`);
    dismiss.onclick = () => close();
    header.append(heading, dismiss);
    const body = make('div', 'rr-dialog-body');
    const footer = make('footer', 'rr-dialog-footer');
    const done = make('button', 'rr-done', 'Done'); done.type = 'button'; done.onclick = () => close();
    footer.append(done); node.append(header, body, footer); page.append(node);
    node.addEventListener('cancel', event => {event.preventDefault(); close();});
    node.addEventListener('click', event => {
      if (event.target !== node) return;
      const rect = node.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    // Close before archive navigation, without returning focus to a disappearing page.
    node.addEventListener('click', event => {if (event.target.closest('a[data-archive]')) close(false);}, true);
    return {node, body, done};
  }
  function move(node, target) {
    if (!node) return;
    const marker = document.createComment('responsive original position');
    node.before(marker); moved.push({node, marker, hidden: node.hidden}); target.append(node);
  }
  function button(label, target, bar) {
    const node = make('button', 'rr-tool', label); node.type = 'button';
    node.setAttribute('aria-haspopup', 'dialog');
    node.onclick = () => open(target.node, node); bar.append(node); return node;
  }
  function cleanup() {
    close(false);
    current?.removeReset?.();
    current?.removeShelves?.();
    page.querySelectorAll('.rr-stream-tags').forEach(group => {
      const head = group.querySelector('.rr-tags-heading');
      head?.replaceWith(head.querySelector('.search-filter-group-title'));
      group.querySelector('.rr-tags-browse')?.remove();
      group.classList.remove('rr-stream-tags', 'rr-tags-collapsed');
    });
    for (const {node, marker, hidden} of moved.splice(0)) {
      if (marker.isConnected) {marker.replaceWith(node); if (node.id === 'game-category-browser') node.hidden = hidden;}
    }
    page.querySelectorAll('.search-filter-panel').forEach(n => n.hidden = true);
    page.querySelectorAll('.search-filter-button').forEach(n => n.setAttribute('aria-expanded', 'false'));
    page.querySelectorAll('.archive-filter-shell').forEach(n => n.classList.remove('is-open'));
    page.querySelectorAll('.rr-description-short').forEach(n => n.classList.remove('rr-description-short'));
    page.querySelectorAll('.rr-dialog,.rr-tools,.rr-description-toggle,.rr-category-jump,.rr-year-section,.rr-chapter-meta').forEach(n => n.remove());
    page.querySelectorAll('.rr-month-active').forEach(n => n.classList.remove('rr-month-active'));
    page.classList.remove('rr-mobile', 'rr-browse', 'rr-game', 'rr-date');
    current = null;
  }
  function sync() {
    if (!current || !mobile.matches) return;
    const {kind, search, categories, calendar, month, searchButton, clear} = current;
    if (kind === 'games' || kind === 'streams') {
      const count = page.querySelector(kind === 'games' ? '#archive-game-count' : '#archive-result-count')?.textContent || '';
      const show = kind === 'games' ? count.split(' of ')[0] + ' games' : count;
      search.done.textContent = `Show ${show}`;
      if (categories) categories.done.textContent = `Show ${show}`;
      const input = page.querySelector(kind === 'games' ? '#archive-game-filter' : '#archive-filter');
      const facetCount = Number(page.querySelector('.search-filter-badge')?.textContent || 0);
      const extra = kind === 'streams'
        ? Number(!!page.querySelector('[data-guest][aria-pressed=true]')?.dataset.guest)
          + Number(!!page.querySelector('#archive-stream-type')?.value)
          + Number(!!page.querySelector('#archive-golden-kappa[aria-pressed=true]'))
        : Number(!!page.querySelector('.game-title-alphabet [aria-pressed=true]')?.dataset.letter);
      const active = Number(!!input?.value) + facetCount + extra;
      searchButton.textContent = active ? `Search & filter · ${active}` : 'Search & filter';
      clear.hidden = !active;
      if (kind === 'streams') {
        current.searchYear.value = page.querySelector('#archive-years [aria-pressed=true]')?.dataset.year || '';
        const tagInput = search.body.querySelector('.archive-tag-search input');
        const group = tagInput?.closest('.search-filter-group');
        if (group && !group.classList.contains('rr-stream-tags')) {
          group.classList.add('rr-stream-tags');
          const title = group.querySelector('.search-filter-group-title');
          const head = make('div', 'rr-tags-heading'); title.before(head); head.append(title);
          const reset = make('button', 'rr-tags-reset', 'Reset'); reset.type = 'button';
          reset.onclick = () => page.querySelector('#archive-reset').click(); head.append(reset);
          const browse = make('button', 'rr-tags-browse'); browse.type = 'button';
          const options = group.querySelector('.archive-tag-options'); options.id = 'rr-stream-tag-options';
          browse.setAttribute('aria-controls', options.id); options.before(browse);
          const update = () => {
            const expanded = !!current.tagsExpanded;
            group.classList.toggle('rr-tags-collapsed', !expanded && !tagInput.value.trim());
            browse.textContent = expanded ? 'Hide tag list' : 'Browse all tags';
            browse.setAttribute('aria-expanded', String(expanded));
          };
          browse.onclick = () => {current.tagsExpanded = !current.tagsExpanded; update();};
          tagInput.addEventListener('input', update); update();
        }
      }
      if (calendar) {
        const year = page.querySelector('#archive-calendar-year').textContent;
        calendar.year.value = year;
        const months = [...page.querySelectorAll('.archive-month')];
        page.querySelectorAll('[data-calendar-year]').forEach(node => node.classList.toggle('rr-year-active', node.dataset.calendarYear === year));
        months.forEach(node => node.classList.toggle('rr-month-active', Number(node.dataset.month) === month));
        calendar.monthButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === month)));
      }
    } else if (kind === 'game') {
      page.querySelectorAll('.archive-chapter-row').forEach(row => {
        if (row.querySelector('.rr-chapter-meta')) return;
        const meta = make('div', 'rr-chapter-meta'); row.append(meta);
        move(row.querySelector('.archive-chapter-runtime'), meta);
        move(row.querySelector('.archive-chapter-dates'), meta);
      });
    }
  }
  function mount(kind) {
    cleanup();
    current = {kind};
    if (!mobile.matches) {
      if (kind === 'date') mountShelves();
      return;
    }
    page.classList.add('rr-mobile');
    if (kind === 'games' || kind === 'streams') {
      page.classList.add('rr-browse');
      const bar = make('div', 'rr-tools');
      page.querySelector('.archive-heading').after(bar);
      const search = dialog(kind === 'games' ? 'Find a game' : 'Find a stream', 'search');
      const toolbar = page.querySelector(kind === 'games' ? '.archive-game-toolbar' : '.archive-stream-toolbar');
      move(toolbar, search.body);
      // Advanced choices share one scrolling surface instead of a nested popover.
      const panel = toolbar.querySelector('.search-filter-panel');
      panel.hidden = false;
      toolbar.querySelector('.search-filter-button').setAttribute('aria-expanded', 'true');
      const reset = toolbar.querySelector(kind === 'games' ? '#archive-game-reset' : '#archive-reset');
      const resetMobile = event => {
        if (!mobile.matches || !current) return;
        event.preventDefault(); event.stopImmediatePropagation();
        const input = toolbar.querySelector('input[type=search]'); input.value = ''; input.dispatchEvent(new Event('input', {bubbles: true}));
        if (kind === 'streams') {
          current.tagsExpanded = false;
          const tagInput = toolbar.querySelector('.archive-tag-search input'); if (tagInput) tagInput.value = '';
          page.querySelector('#archive-golden-kappa[aria-pressed=true]')?.click();
          toolbar.querySelector('[data-guest=""]').click();
          const type = toolbar.querySelector('#archive-stream-type'); type.value = ''; type.dispatchEvent(new Event('change', {bubbles: true}));
          page.querySelector('#archive-years [data-year]:not([data-year=""])').click();
        } else page.querySelector('.game-title-alphabet [data-letter=""]').click();
        toolbar.querySelector('.search-filter-reset').click();
        sync();
      };
      reset.addEventListener('click', resetMobile, true);
      // This listener lives on the retained toolbar; remove it when restoring desktop.
      current.removeReset = () => reset.removeEventListener('click', resetMobile, true);
      const searchButton = button('Search & filter', search, bar);
      if (kind === 'streams') move(toolbar.querySelector('#archive-golden-kappa'), bar);
      const clear = make('button', 'rr-clear', 'Clear'); clear.type = 'button'; clear.hidden = true;
      clear.onclick = () => page.querySelector(kind === 'games' ? '#archive-game-reset' : '#archive-reset').click();
      bar.append(clear);
      Object.assign(current, {search, searchButton, clear});
      if (kind === 'games') {
        const categories = dialog('Browse categories', 'categories');
        move(page.querySelector('#game-category-browser'), categories.body);
        page.querySelector('#game-category-browser').hidden = false;
        const jump = make('details', 'rr-category-jump');
        jump.append(make('summary', '', 'Jump to a category letter'));
        const letters = page.querySelector('#game-category-letters'); letters.before(jump); move(letters, jump);
        button('Categories', categories, bar);
        const alphabet = make('div', 'rr-letter-section');
        alphabet.append(make('h3', '', 'Game title starts with'));
        search.body.append(alphabet); move(page.querySelector('.game-title-alphabet'), alphabet);
        Object.assign(current, {categories});
      } else {
        const years = make('div', 'rr-year-section');
        const searchYearLabel = make('label', '', 'Search in year');
        const searchYear = make('select', 'rr-search-year');
        for (const b of page.querySelectorAll('#archive-years [data-year]')) {
          const option = make('option', '', b.dataset.year ? `${b.dataset.year} (${b.querySelector('small')?.textContent.trim() || '0'} dates)` : 'All years');
          option.value = b.dataset.year; searchYear.append(option);
        }
        searchYear.onchange = () => page.querySelector(`#archive-years [data-year="${searchYear.value}"]`).click();
        searchYearLabel.append(searchYear); years.append(searchYearLabel); current.searchYear = searchYear;
        toolbar.querySelector('.archive-filter-shell').before(years); move(page.querySelector('#archive-years'), years);
        const calendar = dialog('Choose a stream date', 'calendar');
        const controls = make('div', 'rr-calendar-controls');
        const yearLabel = make('label', '', 'Year'); const year = make('select', '');
        for (const b of page.querySelectorAll('[data-year]')) {
          if (!b.dataset.year) continue;
          const option = make('option', '', b.dataset.year); option.value = b.dataset.year; year.append(option);
        }
        yearLabel.append(year); controls.append(yearLabel); calendar.body.append(controls);
        const months = make('div', 'rr-month-picker'); months.setAttribute('aria-label', 'Choose month');
        const monthButtons = Array.from({length: 12}, (_, i) => {
          const b = make('button', '', new Intl.DateTimeFormat('en', {month: 'short'}).format(new Date(2026, i, 1)));
          b.type = 'button'; b.onclick = () => {current.month = i; sync();}; months.append(b); return b;
        });
        calendar.body.append(months); move(page.querySelector('.archive-calendar-shell'), calendar.body);
        year.onchange = () => page.querySelector(`[data-year="${year.value}"]`).click();
        const latest = window.SARKIVE_CATALOGUE?.dates.filter(d => d.date.startsWith(page.querySelector('#archive-calendar-year').textContent)).map(d => d.date).sort().at(-1);
        Object.assign(calendar, {year, monthButtons}); Object.assign(current, {calendar, month: latest ? Number(latest.slice(5,7)) - 1 : 0});
        button('Choose date', calendar, bar);
      }
    } else if (kind === 'game') {
      page.classList.add('rr-game');
      const hero = page.querySelector('.archive-game-hero');
      const description = page.querySelector('.archive-description');
      move(description, hero);
      if (description && description.textContent.length > 150) {
        const more = make('button', 'rr-description-toggle', 'Read more'); more.type = 'button'; more.setAttribute('aria-expanded', 'false');
        description.classList.add('rr-description-short'); description.after(more);
        more.onclick = () => {const expanded = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', String(expanded)); more.textContent = expanded ? 'Read less' : 'Read more'; description.classList.toggle('rr-description-short', !expanded);};
      }
      move(page.querySelector('.archive-play'), hero);
      move(page.querySelector('.archive-hero-copy > .archive-muted'), hero);
    } else if (kind === 'date') {
      page.classList.add('rr-date');
    }
    sync();
  }
  function mountShelves() {
    const removers = [];
    page.classList.add('rr-desktop-date');
    page.querySelectorAll('.archive-date-page > section > .archive-vod-grid,.archive-date-page > section > .archive-game-grid').forEach((track, index) => {
      if (!track.children.length) return;
      const wrapper = make('div', 'rr-stream-shelf');
      track.before(wrapper); wrapper.append(track);
      track.classList.add('rr-shelf-track');
      track.querySelectorAll('strong').forEach(title => title.setAttribute('title', title.textContent));
      const previousId = track.id;
      track.id = `rr-shelf-${index}`;
      const label = wrapper.parentElement.querySelector('h2')?.textContent.toLowerCase() || 'items';
      const arrows = [-1, 1].map(direction => {
        const arrow = make('button', `archive-shelf-arrow archive-shelf-arrow--${direction < 0 ? 'previous' : 'next'}`, direction < 0 ? '‹' : '›');
        arrow.type = 'button';
        arrow.setAttribute('aria-label', `${direction < 0 ? 'Previous' : 'Next'} ${label}`);
        arrow.setAttribute('aria-controls', track.id);
        arrow.onclick = () => track.scrollBy({left: direction * Math.max(200, track.clientWidth * .85), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
        wrapper.append(arrow); return arrow;
      });
      const update = () => {
        arrows[0].hidden = track.scrollLeft <= 2;
        arrows[1].hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      };
      track.addEventListener('scroll', update, {passive: true});
      const observer = new ResizeObserver(update); observer.observe(track);
      update();
      removers.push(() => {
        observer.disconnect(); track.removeEventListener('scroll', update);
        track.classList.remove('rr-shelf-track'); track.id = previousId;
        wrapper.replaceWith(track);
      });
    });
    // Fit the original stream content. Clips extend below it in the normal page flow.
    const clips = page.querySelector('.archive-date-clips');
    const lastPrimarySection = clips?.previousElementSibling;
    const fit = () => {
      const tracks = [...page.querySelectorAll('.rr-shelf-track')];
      tracks.forEach(track => track.style.removeProperty('--rr-card-width'));
      for (let pass = 0; pass < 5; pass++) {
        const clipSpace = lastPrimarySection
          ? clips.getBoundingClientRect().bottom - lastPrimarySection.getBoundingClientRect().bottom
          : 0;
        const bottom = page.getBoundingClientRect().bottom + window.scrollY - clipSpace;
        const shellBottom = parseFloat(getComputedStyle(page.parentElement).paddingBottom) || 0;
        const excess = bottom + shellBottom + 8 - innerHeight;
        if (excess <= 1) break;
        const heights = tracks.map(track => track.querySelector('img')?.getBoundingClientRect().height || 0);
        const total = heights.reduce((sum, height) => sum + height, 0);
        if (!total) break;
        const scale = Math.max(.5, 1 - (excess + 8) / total);
        tracks.forEach(track => {
          const width = track.children[0].getBoundingClientRect().width;
          const minimum = track.classList.contains('archive-vod-grid') ? 160 : 72;
          track.style.setProperty('--rr-card-width', `${Math.max(minimum, width * scale)}px`);
        });
      }
    };
    const headingObserver = new ResizeObserver(fit);
    headingObserver.observe(page.querySelector('.archive-stream-heading'));
    window.addEventListener('resize', fit);
    fit();
    current.removeShelves = () => {
      headingObserver.disconnect(); window.removeEventListener('resize', fit);
      page.classList.remove('rr-desktop-date');
      page.querySelectorAll('.rr-shelf-track').forEach(track => track.style.removeProperty('--rr-card-width'));
      removers.forEach(remove => remove());
    };
  }
  mobile.addEventListener('change', () => {const kind = current?.kind; if (kind) mount(kind);});
  window.addEventListener('popstate', () => close(false));
  new MutationObserver(() => {if (page.hidden && current) cleanup();}).observe(page, {attributes: true, attributeFilter: ['hidden']});
  window.SARKIVE_RESPONSIVE = {mount, sync, cleanup};
})();
