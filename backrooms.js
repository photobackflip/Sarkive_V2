(() => {
  'use strict';

  const raw = window.SARKIVE_BACKROOMS_DATA;
  if (!raw) {
    window.SARKIVE_BACKROOMS_UI = { show() {}, hide() {} };
    return;
  }

  const games = Array.isArray(raw.games) ? raw.games : [];
  const appearances = Array.isArray(raw.appearances) ? raw.appearances : [];
  const days = (Array.isArray(raw.days) ? raw.days : []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const gameById = new Map(games.map(game => [game.id, game]));
  const appearanceById = new Map(appearances.map(appearance => [appearance.id, appearance]));
  const dayById = new Map(days.map(day => [day.id, day]));
  const dayByDate = new Map(days.map(day => [day.date, day]));
  const latestDay = days[days.length - 1] || null;
  const monthNames = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

  const elements = {
    page: document.querySelector('#backrooms-page'),
    gamesPlayed: document.querySelector('#backrooms-games-played'),
    gamesTotal: document.querySelector('#backrooms-games-total'),
    progressFill: document.querySelector('#backrooms-progress-fill'),
    progressLabel: document.querySelector('#backrooms-progress-label'),
    search: document.querySelector('#backrooms-search'),
    latest: document.querySelector('#backrooms-latest'),
    viewToggle: document.querySelector('#backrooms-view-toggle'),
    calendarPanel: document.querySelector('.backrooms-calendar-panel'),
    calendarPrevious: document.querySelector('#backrooms-calendar-previous'),
    calendarNext: document.querySelector('#backrooms-calendar-next'),
    calendarLabel: document.querySelector('#backrooms-calendar-label'),
    calendarGrid: document.querySelector('#backrooms-calendar-grid'),
    calendarView: document.querySelector('#backrooms-calendar-view'),
    listView: document.querySelector('#backrooms-list-view'),
    dayList: document.querySelector('#backrooms-day-list'),
    showIndex: document.querySelector('#backrooms-show-index'),
    resultsKicker: document.querySelector('#backrooms-results-kicker'),
    resultsTitle: document.querySelector('#backrooms-results-title'),
    resultsCount: document.querySelector('#backrooms-results-count'),
    results: document.querySelector('#backrooms-results'),
    teaserOpen: document.querySelector('#backrooms-teaser-open'),
    teaserModal: document.querySelector('#backrooms-teaser-modal'),
    teaserBackdrop: document.querySelector('#backrooms-teaser-backdrop'),
    teaserClose: document.querySelector('#backrooms-teaser-close'),
    teaserVideo: document.querySelector('#backrooms-teaser-video')
  };

  const state = {
    initialized: false,
    visible: false,
    selectedDate: latestDay?.date || '',
    query: '',
    mode: 'date',
    browserMode: 'date',
    calendarYear: latestDay ? Number(latestDay.date.slice(0, 4)) : new Date().getFullYear(),
    calendarMonth: latestDay ? Number(latestDay.date.slice(5, 7)) - 1 : new Date().getMonth(),
    timerInterval: null
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function humanDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return String(date || '');
    const [year, month, day] = date.split('-').map(Number);
    return `${String(day).padStart(2, '0')} ${monthNames[month - 1]} ${year}`;
  }

  function compactDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return String(date || '');
    const [year, month, day] = date.split('-').map(Number);
    return `${monthNames[month - 1].slice(0, 3)} ${day}, ${year}`;
  }

  function pad(value) {
    return String(Math.max(0, value)).padStart(2, '0');
  }

  function elapsedParts(now) {
    const startedAt = new Date(raw.project?.startedAt || '2026-05-06T08:00:09');
    const stopAt = raw.project?.status === 'complete' && raw.project?.endedAt ? new Date(raw.project.endedAt) : now;
    if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime()) || stopAt <= startedAt) {
      return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    let months = (stopAt.getFullYear() - startedAt.getFullYear()) * 12 + (stopAt.getMonth() - startedAt.getMonth());
    let anchor = new Date(startedAt.getTime());
    anchor.setMonth(startedAt.getMonth() + months);
    if (anchor > stopAt) {
      months -= 1;
      anchor = new Date(startedAt.getTime());
      anchor.setMonth(startedAt.getMonth() + months);
    }

    let remaining = stopAt.getTime() - anchor.getTime();
    const dayMs = 86400000;
    const hourMs = 3600000;
    const minuteMs = 60000;
    const daysPart = Math.floor(remaining / dayMs); remaining -= daysPart * dayMs;
    const hours = Math.floor(remaining / hourMs); remaining -= hours * hourMs;
    const minutes = Math.floor(remaining / minuteMs); remaining -= minutes * minuteMs;
    const seconds = Math.floor(remaining / 1000);
    return { months, days: daysPart, hours, minutes, seconds };
  }

  function updateTimer() {
    if (!state.visible) return;
    const parts = elapsedParts(new Date());
    Object.entries(parts).forEach(([key, value]) => {
      elements.page?.querySelectorAll(`[data-backrooms-timer="${key}"]`).forEach(node => {
        node.textContent = pad(value);
      });
    });
  }

  function startTimer() {
    stopTimer();
    updateTimer();
    if (raw.project?.status !== 'complete') state.timerInterval = window.setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    if (state.timerInterval !== null) window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  function archiveLabel(game) {
    return Number.isFinite(game.archiveNumber) ? `#${String(game.archiveNumber).padStart(3, '0')}` : 'SPECIAL';
  }

  function searchableText(game) {
    return [
      game.title,
      game.archiveNumber,
      game.status,
      game.statusLabel,
      game.releaseDate,
      game.description,
      game.steam?.appId,
      ...(game.developers || []),
      ...(game.publishers || []),
      ...(game.players || []),
      ...(game.notes || []).map(note => note.text)
    ].join(' ').toLocaleLowerCase();
  }

  function matchingGames(query) {
    const needle = String(query || '').trim().toLocaleLowerCase();
    if (!needle) return [];
    return games
      .filter(game => searchableText(game).includes(needle))
      .slice()
      .sort((a, b) => (a.archiveNumber ?? 9999) - (b.archiveNumber ?? 9999) || a.title.localeCompare(b.title));
  }

  function gameAppearances(game) {
    return (game.appearanceIds || [])
      .map(id => appearanceById.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        const da = dayById.get(a.dayId)?.date || '';
        const db = dayById.get(b.dayId)?.date || '';
        return da.localeCompare(db) || a.order - b.order;
      });
  }

  function posterCandidates(game) {
    const candidates = [];
    const add = value => {
      const url = String(value || '').trim();
      if (url && !candidates.includes(url)) candidates.push(url);
    };

    add(game.localImage);
    add(game.image);

    const appId = game.steam?.appId;
    const hash = String(game.steam?.assetHash || '').trim();
    if (appId && game.steam?.useSteamArt !== false) {
      if (hash) {
        add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/${hash}/library_600x900_2x.jpg`);
        add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/${hash}/library_600x900.jpg`);
        add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/${hash}/library_capsule_2x.jpg`);
        add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/${hash}/library_capsule.jpg`);
      }

      add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`);
      add(`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`);
      add(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`);
      add(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`);
      add(`https://shared.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`);
      add(`https://shared.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`);
      add(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`);
    }

    add('assets/backrooms/BR_TILE3.png');
    return candidates;
  }

  function posterUrl(game) {
    return posterCandidates(game)[0] || 'assets/backrooms/BR_TILE3.png';
  }

  function youtubeSourceInfo(source) {
    if (!source || source.kind !== 'youtube') return null;
    let value = String(source.url || '').trim();
    if (value.startsWith('hhttps://')) value = value.slice(1);

    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    let videoId = '';
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      videoId = parsed.searchParams.get('v') || '';
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }
    }
    if (!videoId) return null;

    const rawTime = parsed.searchParams.get('t') || parsed.searchParams.get('start') || '0';
    const secondsMatch = String(rawTime).match(/^\d+/);
    const startSeconds = secondsMatch ? Number(secondsMatch[0]) : 0;
    return { videoId, startSeconds: Number.isFinite(startSeconds) ? startSeconds : 0 };
  }

  function youtubeSources(game) {
    return (game.sources || []).map((source, sourceIndex) => {
      const info = youtubeSourceInfo(source);
      if (!info) return null;
      return {
        ...info,
        sourceIndex,
        sourceId: String(source.id || ''),
        legacyField: String(source.legacyField || '')
      };
    }).filter(Boolean).map((source, sourcePosition) => ({ ...source, sourcePosition }));
  }

  function backroomsWatchNavigation(gameId) {
    const orderedPlayableGames = games
      .filter(game => game.counted !== false && Number.isFinite(Number(game.archiveNumber)) && youtubeSources(game).length)
      .slice()
      .sort((a, b) => Number(a.archiveNumber) - Number(b.archiveNumber));
    const index = orderedPlayableGames.findIndex(game => game.id === gameId);
    return {
      previousGameId: index > 0 ? orderedPlayableGames[index - 1].id : '',
      nextGameId: index >= 0 && index < orderedPlayableGames.length - 1 ? orderedPlayableGames[index + 1].id : ''
    };
  }

  const dayVideoHints = (() => {
    const hints = new Map();
    games.forEach(game => {
      const gameAps = gameAppearances(game);
      if (gameAps.length !== 1) return;
      const dayId = gameAps[0].dayId;
      const counts = hints.get(dayId) || new Map();
      youtubeSources(game).forEach(info => counts.set(info.videoId, (counts.get(info.videoId) || 0) + 1));
      hints.set(dayId, counts);
    });
    return hints;
  })();

  const dominantDayVideo = (() => {
    const videos = new Map();
    dayVideoHints.forEach((counts, dayId) => {
      const videoId = [...counts.entries()]
        .filter(([id]) => id)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      if (videoId) videos.set(dayId, videoId);
    });
    return videos;
  })();

  function appearanceCode(appearance) {
    if (!appearance) return '';
    const day = dayById.get(appearance.dayId);
    if (!day) return '';
    return `D${String(day.dayNumber).padStart(3, '0')}.G${String(appearance.order).padStart(2, '0')}`;
  }

  function vodNumber(source, fallbackIndex = 0) {
    const match = String(source?.legacyField || '').match(/vodLink(\d+)?/i);
    if (match) return Number(match[1] || 1);
    return fallbackIndex + 1;
  }

  function watchEntriesFor(game) {
    const sources = youtubeSources(game);
    const gameAps = gameAppearances(game);
    if (!sources.length) return [];

    const dayUseCounts = new Map();
    return sources.map((source, sourcePosition) => {
      const hintedAppearances = gameAps.filter(ap => dominantDayVideo.get(ap.dayId) === source.videoId);
      let appearance = null;

      if (hintedAppearances.length) {
        const dayId = hintedAppearances[0].dayId;
        const sameDayAppearances = hintedAppearances.filter(ap => ap.dayId === dayId);
        const used = dayUseCounts.get(dayId) || 0;
        appearance = sameDayAppearances[Math.min(used, sameDayAppearances.length - 1)] || null;
        dayUseCounts.set(dayId, used + 1);
      } else if (gameAps.length) {
        appearance = gameAps[Math.min(sourcePosition, gameAps.length - 1)] || null;
      }

      return {
        source,
        sourcePosition,
        appearance,
        vodNumber: vodNumber(source, sourcePosition)
      };
    });
  }

  function watchSourceFor(game, activeAppearance = null) {
    const sources = youtubeSources(game);
    if (!sources.length) return null;
    if (!activeAppearance) return sources[0];

    const hintCounts = dayVideoHints.get(activeAppearance.dayId);
    if (hintCounts?.size) {
      const hintedVideoId = [...hintCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const matching = sources.filter(info => info.videoId === hintedVideoId).sort((a, b) => a.startSeconds - b.startSeconds);
      if (matching.length) {
        const sameDayAppearances = gameAppearances(game).filter(ap => ap.dayId === activeAppearance.dayId);
        const sameDayIndex = Math.max(0, sameDayAppearances.findIndex(ap => ap.id === activeAppearance.id));
        return matching[Math.min(sameDayIndex, matching.length - 1)];
      }
    }

    const gameAps = gameAppearances(game);
    if (sources.length === gameAps.length) {
      const index = gameAps.findIndex(ap => ap.id === activeAppearance.id);
      if (index >= 0 && sources[index]) return sources[index];
    }
    return sources[0];
  }

  function watchPayload(gameId, appearanceId = '', returnHash = '', sourcePosition = null) {
    const game = gameById.get(gameId);
    if (!game) return null;

    const entries = watchEntriesFor(game);
    const requestedSourcePosition = sourcePosition === null || sourcePosition === '' ? null : Number(sourcePosition);
    const requestedEntry = Number.isInteger(requestedSourcePosition)
      ? entries.find(entry => entry.sourcePosition === requestedSourcePosition) || null
      : null;
    const requestedAppearance = appearanceId ? appearanceById.get(appearanceId) || null : null;
    const displayAppearance = requestedAppearance || requestedEntry?.appearance || gameAppearances(game)[0] || null;
    const source = requestedEntry?.source || watchSourceFor(game, requestedAppearance);
    if (!source) return null;

    const displayDay = displayAppearance ? dayById.get(displayAppearance.dayId) || null : null;
    const archiveLabel = game.archiveNumber === null || game.archiveNumber === undefined
      ? ''
      : `#${String(game.archiveNumber).padStart(3, '0')}`;
    const navigation = backroomsWatchNavigation(game.id);
    return {
      gameId: game.id,
      appearanceId: displayAppearance?.id || '',
      title: game.title,
      videoId: source.videoId,
      startSeconds: source.startSeconds,
      previousGameId: navigation.previousGameId,
      nextGameId: navigation.nextGameId,
      metaLabel: [archiveLabel, appearanceCode(displayAppearance)].filter(Boolean).join(' · '),
      returnHash: String(returnHash || '').trim() || (displayDay ? `#page=backrooms&date=${encodeURIComponent(displayDay.date)}` : '#page=backrooms&index=1')
    };
  }

  function renderWatchLinks(game) {
    const entries = watchEntriesFor(game);
    const multipleSources = entries.length > 1;
    const buttons = entries.map(entry => {
      const day = entry.appearance ? dayById.get(entry.appearance.dayId) || null : null;
      const code = appearanceCode(entry.appearance) || `VOD ${entry.vodNumber}`;
      const meta = [day ? compactDate(day.date) : '', multipleSources ? `VOD ${entry.vodNumber}` : ''].filter(Boolean).join(' · ');
      return `<button class="backrooms-appearance-chip backrooms-watch-button" type="button" data-backrooms-watch="${escapeHtml(game.id)}" data-backrooms-watch-appearance="${escapeHtml(entry.appearance?.id || '')}" data-backrooms-watch-source="${entry.sourcePosition}">${escapeHtml(code)}${meta ? ` <span>${escapeHtml(meta)}</span>` : ''}</button>`;
    }).join('');

    return `<div class="backrooms-watch-cell">
      <span class="backrooms-meta-label">WATCH</span>
      <div class="backrooms-watch-list">${buttons || '<span class="backrooms-empty">—</span>'}</div>
    </div>`;
  }

  function filterButton(value, type) {
    return `<button class="backrooms-filter-chip" type="button" data-backrooms-filter="${escapeHtml(value)}" title="Search ${escapeHtml(type)}: ${escapeHtml(value)}">${escapeHtml(value)}</button>`;
  }

  function renderNotes(game) {
    const notes = Array.isArray(game.notes) ? game.notes : [];
    if (!notes.length) return '';
    return `<div class="backrooms-notes-section">
      <button class="backrooms-notes-toggle" type="button" data-backrooms-notes-toggle aria-expanded="false">SHOW NOTES</button>
      <div class="backrooms-notes" data-backrooms-notes hidden>${notes.map(note => {
        const review = note.type === 'steam-review';
        return `<div class="backrooms-note${review ? ' backrooms-note--review' : ''}">
          ${review ? '<span>SARK STEAM REVIEW</span>' : ''}
          <p>${escapeHtml(note.text)}</p>
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  function renderAppearances(game, activeAppearance = null) {
    const gameAps = gameAppearances(game);
    if (!gameAps.length) return '';
    return `<div class="backrooms-appearances">
      <span class="backrooms-meta-label">APPEARANCES</span>
      <div class="backrooms-appearance-list">${gameAps.map(ap => {
        const day = dayById.get(ap.dayId);
        if (!day) return '';
        const isActive = activeAppearance?.id === ap.id;
        return `<button class="backrooms-appearance-chip${isActive ? ' active' : ''}" type="button" data-backrooms-date="${escapeHtml(day.date)}">
          D${String(day.dayNumber).padStart(3,'0')}.G${String(ap.order).padStart(2,'0')} <span>${escapeHtml(compactDate(day.date))}</span>
        </button>`;
      }).join('')}</div>
    </div>`;
  }

  function renderGameCard(game, activeAppearance = null) {
    const developers = (game.developers || []).map(name => filterButton(name, 'developer')).join('');
    const publishers = (game.publishers || []).map(name => filterButton(name, 'publisher')).join('');
    const players = (game.players || []).map(name => filterButton(name, 'player')).join('');
    const statusText = game.statusLabel || '-';
    const appId = game.steam?.appId ? String(game.steam.appId) : '-';
    const appearancesForGame = gameAppearances(game);
    return `<article class="backrooms-game-card" data-game-id="${escapeHtml(game.id)}">
      <div class="backrooms-game-main">
        <div class="backrooms-game-art">
          <img src="${escapeHtml(posterUrl(game))}" alt="" loading="lazy" decoding="async" data-backrooms-poster>
          <span class="backrooms-game-number">${escapeHtml(archiveLabel(game))}</span>
        </div>
        <div class="backrooms-game-copy">
          <div class="backrooms-game-head">
            <div class="backrooms-game-title-block">
              <div class="backrooms-game-eyebrow">
                <span>${escapeHtml(archiveLabel(game))}</span>
                ${activeAppearance ? `<span>D${String(dayById.get(activeAppearance.dayId)?.dayNumber || 0).padStart(3,'0')}.G${String(activeAppearance.order).padStart(2,'0')}</span>` : `<span>${appearancesForGame.length} ${appearancesForGame.length === 1 ? 'APPEARANCE' : 'APPEARANCES'}</span>`}
              </div>
              <h3>${escapeHtml(game.title)}</h3>
            </div>
            <span class="backrooms-status backrooms-status--${escapeHtml(String(game.status || 'unresolved').toLowerCase())}">${escapeHtml(statusText)}</span>
          </div>
          <p class="backrooms-description">${escapeHtml(game.description || 'No description logged.')}</p>
          <div class="backrooms-facts">
            <div><span class="backrooms-meta-label">RELEASE</span><strong>${escapeHtml(game.releaseDate || '-')}</strong></div>
            <div><span class="backrooms-meta-label">STEAM APP ID</span>${game.steam?.appId ? `<a class="backrooms-steam-link" href="https://store.steampowered.com/app/${encodeURIComponent(String(game.steam.appId))}/" target="_blank" rel="noopener noreferrer" title="Open ${escapeHtml(game.title)} on Steam">${escapeHtml(appId)}</a>` : `<strong>${escapeHtml(appId)}</strong>`}</div>
            <div><span class="backrooms-meta-label">DEVELOPER${(game.developers || []).length === 1 ? '' : 'S'}</span><div class="backrooms-chip-row">${developers || '<span class="backrooms-empty">—</span>'}</div></div>
            <div><span class="backrooms-meta-label">PUBLISHER${(game.publishers || []).length === 1 ? '' : 'S'}</span><div class="backrooms-chip-row">${publishers || '<span class="backrooms-empty">—</span>'}</div></div>
            <div><span class="backrooms-meta-label">PLAYED WITH</span><div class="backrooms-chip-row">${players || '<span class="backrooms-empty">—</span>'}</div></div>
            ${renderWatchLinks(game)}
          </div>
        </div>
      </div>
      ${renderNotes(game)}
      ${renderAppearances(game, activeAppearance)}
    </article>`;
  }

  function wireResultActions() {
    elements.results?.querySelectorAll('[data-backrooms-filter]').forEach(button => {
      button.addEventListener('click', () => setQuery(button.dataset.backroomsFilter || ''));
    });
    elements.results?.querySelectorAll('[data-backrooms-date]').forEach(button => {
      button.addEventListener('click', () => selectDate(button.dataset.backroomsDate || ''));
    });
    elements.results?.querySelectorAll('[data-backrooms-notes-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const section = button.closest('.backrooms-notes-section');
        const notes = section?.querySelector('[data-backrooms-notes]');
        if (!notes) return;
        const opening = notes.hidden;
        notes.hidden = !opening;
        section.classList.toggle('is-open', opening);
        button.textContent = opening ? 'HIDE NOTES' : 'SHOW NOTES';
        button.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
    });
    elements.results?.querySelectorAll('[data-backrooms-watch]').forEach(button => {
      button.addEventListener('click', () => {
        const payload = watchPayload(
          button.dataset.backroomsWatch || '',
          button.dataset.backroomsWatchAppearance || '',
          window.location.hash,
          button.dataset.backroomsWatchSource || ''
        );
        if (payload) window.SARKIVE_OPEN_BACKROOMS_WATCH?.(payload);
      });
    });
    elements.results?.querySelectorAll('[data-backrooms-poster]').forEach(image => {
      const card = image.closest('[data-game-id]');
      const game = card ? gameById.get(card.dataset.gameId) : null;
      const candidates = posterCandidates(game || {});
      let candidateIndex = 0;

      image.onerror = () => {
        candidateIndex += 1;
        if (candidateIndex < candidates.length) {
          image.src = candidates[candidateIndex];
          return;
        }
        image.onerror = null;
      };
    });
  }

  function renderResults() {
    let cards = [];
    if (state.mode === 'search') {
      const matches = matchingGames(state.query);
      elements.resultsKicker.textContent = 'BACKROOMS SEARCH';
      elements.resultsTitle.textContent = state.query ? `“${state.query}”` : 'SEARCH';
      elements.resultsCount.textContent = `${matches.length} ${matches.length === 1 ? 'GAME' : 'GAMES'}`;
      cards = matches.map(game => renderGameCard(game));
      if (!cards.length) cards.push('<div class="backrooms-empty-state"><strong>NO MATCHES</strong><p>Nothing in the database matches that search.</p></div>');
    } else if (state.mode === 'index') {
      const indexGames = games.slice().sort((a, b) => (a.archiveNumber ?? 9999) - (b.archiveNumber ?? 9999) || a.title.localeCompare(b.title));
      elements.resultsKicker.textContent = 'GAME INDEX';
      elements.resultsTitle.textContent = 'ALL GAMES';
      elements.resultsCount.textContent = `${indexGames.length} GAMES`;
      cards = indexGames.map(game => renderGameCard(game));
    } else {
      const day = dayByDate.get(state.selectedDate) || latestDay;
      if (!day) return;
      const dayAppearances = (day.appearanceIds || []).map(id => appearanceById.get(id)).filter(Boolean).sort((a,b) => a.order - b.order);
      elements.resultsKicker.textContent = 'DAILY LOG';
      elements.resultsTitle.textContent = `DAY ${String(day.dayNumber).padStart(3,'0')} · ${humanDate(day.date)}`;
      elements.resultsCount.textContent = `${dayAppearances.length} ${dayAppearances.length === 1 ? 'GAME' : 'GAMES'}`;
      cards = dayAppearances.map(ap => {
        const game = gameById.get(ap.gameId);
        return game ? renderGameCard(game, ap) : '';
      }).filter(Boolean);
    }
    elements.results.innerHTML = cards.join('');
    wireResultActions();
  }

  function renderCalendar() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    elements.calendarLabel.textContent = `${monthNames[month]} ${year}`;
    const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push('<span class="backrooms-calendar-day is-blank"></span>');
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      const date = `${year}-${String(month + 1).padStart(2,'0')}-${String(dayNumber).padStart(2,'0')}`;
      const archiveDay = dayByDate.get(date);
      const active = state.mode === 'date' && state.selectedDate === date;
      if (archiveDay) {
        cells.push(`<button class="backrooms-calendar-day has-day${active ? ' active' : ''}" type="button" data-backrooms-calendar-date="${date}" title="Day ${String(archiveDay.dayNumber).padStart(3,'0')} · ${humanDate(date)}"><strong>${dayNumber}</strong><small>D${archiveDay.dayNumber}</small></button>`);
      } else {
        cells.push(`<span class="backrooms-calendar-day"><strong>${dayNumber}</strong></span>`);
      }
    }
    while (cells.length % 7) cells.push('<span class="backrooms-calendar-day is-blank"></span>');
    elements.calendarGrid.innerHTML = cells.join('');
    elements.calendarGrid.querySelectorAll('[data-backrooms-calendar-date]').forEach(button => {
      button.addEventListener('click', () => selectDate(button.dataset.backroomsCalendarDate || ''));
    });
  }


  function renderDayList() {
    if (!elements.dayList) return;
    elements.dayList.innerHTML = days.map(day => {
      const active = state.mode === 'date' && state.selectedDate === day.date;
      const count = Array.isArray(day.appearanceIds) ? day.appearanceIds.length : 0;
      return `<button class="backrooms-day-list-item${active ? ' active' : ''}" type="button" data-backrooms-list-date="${escapeHtml(day.date)}">
        <span class="backrooms-day-list-number">DAY ${String(day.dayNumber).padStart(3, '0')}</span>
        <span class="backrooms-day-list-date">${escapeHtml(humanDate(day.date))}</span>
        <span class="backrooms-day-list-count">${count} ${count === 1 ? 'GAME' : 'GAMES'}</span>
      </button>`;
    }).join('');
    elements.dayList.querySelectorAll('[data-backrooms-list-date]').forEach(button => {
      button.addEventListener('click', () => selectDate(button.dataset.backroomsListDate || ''));
    });
    if (state.browserMode === 'list') {
      const active = elements.dayList.querySelector('.backrooms-day-list-item.active');
      active?.scrollIntoView({ block: 'nearest' });
    }
  }

  function renderBrowser() {
    const listMode = state.browserMode === 'list';
    if (elements.calendarView) elements.calendarView.hidden = listMode;
    if (elements.listView) elements.listView.hidden = !listMode;
    renderCalendar();
    renderDayList();
    if (elements.viewToggle) elements.viewToggle.textContent = listMode ? 'DATE VIEW' : 'LIST VIEW';
    elements.calendarPanel?.classList.toggle('is-list-view', listMode);
    if (listMode && elements.calendarLabel) elements.calendarLabel.textContent = 'STREAM DAYS';
  }

  function toggleBrowserMode() {
    state.browserMode = state.browserMode === 'list' ? 'date' : 'list';
    renderBrowser();
  }

  function setCalendarFromDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return;
    state.calendarYear = Number(date.slice(0,4));
    state.calendarMonth = Number(date.slice(5,7)) - 1;
  }

  function monthKey(year, month) {
    return year * 12 + month;
  }

  function stepCalendar(delta) {
    if (!days.length) return;
    let year = state.calendarYear;
    let month = state.calendarMonth + delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    const first = days[0].date;
    const last = days[days.length - 1].date;
    const minKey = monthKey(Number(first.slice(0,4)), Number(first.slice(5,7)) - 1);
    const maxKey = monthKey(Number(last.slice(0,4)), Number(last.slice(5,7)) - 1);
    const candidate = monthKey(year, month);
    if (candidate < minKey || candidate > maxKey) return;
    state.calendarYear = year;
    state.calendarMonth = month;
    renderCalendar();
  }

  function syncUrl() {
    const params = new URLSearchParams({ page: 'backrooms' });
    if (state.mode === 'search' && state.query) params.set('q', state.query);
    if (state.mode === 'date' && state.selectedDate) params.set('date', state.selectedDate);
    if (state.mode === 'index') params.set('index', '1');
    history.replaceState(null, '', `#${params.toString()}`);
  }

  function selectDate(date, scroll = true) {
    const day = dayByDate.get(date);
    if (!day) return;
    state.mode = 'date';
    state.query = '';
    state.selectedDate = day.date;
    elements.search.value = '';
    setCalendarFromDate(day.date);
    renderBrowser();
    renderResults();
    syncUrl();
    if (scroll) elements.resultsTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setQuery(query, updateInput = true) {
    const value = String(query || '').trim();
    if (!value) {
      selectDate(state.selectedDate || latestDay?.date || '', false);
      return;
    }
    state.mode = 'search';
    state.query = value;
    if (updateInput) elements.search.value = value;
    renderBrowser();
    renderResults();
    syncUrl();
    elements.search.focus({ preventScroll: true });
  }

  function showIndex() {
    state.mode = 'index';
    state.query = '';
    elements.search.value = '';
    renderBrowser();
    renderResults();
    syncUrl();
  }

  function openTeaser() {
    if (!raw.project?.teaser || !elements.teaserModal || !elements.teaserVideo) return;
    elements.teaserVideo.src = raw.project.teaser;
    elements.teaserModal.hidden = false;
    document.body.classList.add('backrooms-teaser-open');
    elements.teaserVideo.play().catch(() => {});
  }

  function closeTeaser() {
    if (!elements.teaserModal || !elements.teaserVideo) return;
    elements.teaserVideo.pause();
    elements.teaserVideo.currentTime = 0;
    elements.teaserModal.hidden = true;
    document.body.classList.remove('backrooms-teaser-open');
  }

  function initialize() {
    if (state.initialized || !elements.page) return;
    state.initialized = true;

    const played = Number(raw.project?.gamesPlayed || 0);
    const total = Number(raw.project?.totalGames || 0);
    const progress = total > 0 ? Math.max(0, Math.min(100, (played / total) * 100)) : 0;
    elements.gamesPlayed.textContent = played.toLocaleString();
    elements.gamesTotal.textContent = total.toLocaleString();
    elements.progressFill.style.width = `${progress}%`;
    elements.progressLabel.textContent = `${progress.toFixed(1)}% OF THE LIST`;

    elements.search?.addEventListener('input', () => {
      const value = String(elements.search.value || '');
      if (value.trim()) setQuery(value, false);
      else selectDate(state.selectedDate || latestDay?.date || '', false);
    });
    elements.latest?.addEventListener('click', () => latestDay && selectDate(latestDay.date));
    elements.viewToggle?.addEventListener('click', toggleBrowserMode);
    elements.calendarPrevious?.addEventListener('click', () => stepCalendar(-1));
    elements.calendarNext?.addEventListener('click', () => stepCalendar(1));
    elements.showIndex?.addEventListener('click', showIndex);
    elements.teaserOpen?.addEventListener('click', openTeaser);
    elements.teaserClose?.addEventListener('click', closeTeaser);
    elements.teaserBackdrop?.addEventListener('click', closeTeaser);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && elements.teaserModal && !elements.teaserModal.hidden) closeTeaser();
    });
  }

  function show(options = {}) {
    initialize();
    state.visible = true;
    const query = String(options.query || '').trim();
    const date = dayByDate.has(String(options.date || '')) ? String(options.date) : '';
    const indexMode = Boolean(options.index);

    if (query) {
      state.mode = 'search';
      state.query = query;
      elements.search.value = query;
    } else if (indexMode) {
      state.mode = 'index';
      state.query = '';
      elements.search.value = '';
    } else {
      state.mode = 'date';
      state.query = '';
      state.selectedDate = date || state.selectedDate || latestDay?.date || '';
      elements.search.value = '';
      setCalendarFromDate(state.selectedDate);
    }

    renderBrowser();
    renderResults();
    startTimer();
  }

  function hide() {
    state.visible = false;
    stopTimer();
    closeTeaser();
  }

  window.SARKIVE_BACKROOMS_UI = { show, hide, watchPayload };
})();
