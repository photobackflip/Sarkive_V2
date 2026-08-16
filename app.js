(() => {
  'use strict';

  const isHttpPage = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  const rawLibrary = window.SARKIVE_DATA;
  const rawPodcastLibrary = window.NERD_POKER_DATA;
  const rawRadioRespawnLibrary = window.RADIO_RESPAWN_DATA;
  const rawRespawnInboxLibrary = window.RESPAWN_INBOX_DATA;
  const rawXPlayLibrary = window.XPLAY_DATA;
  const rawGuestPodcastLibrary = window.SARKIVE_PODCASTS_DATA;
  const rawMarblesScores = window.MARBLES_SCORES_DATA;
  const rawPalsData = window.SARKIVE_PALS_DATA;
  const rawDiscoveryLibrary = window.SARKIVE_DISCOVERY_DATA;
  const rawVodIndex = window.SARKIVE_VOD_INDEX_DATA;
  const rawSarkTvClips = window.SARK_TV_CLIPS;
  const fallbackGameImage = String(rawLibrary?.fallbackGameImage || 'https://static-cdn.jtvnw.net/ttv-static/404_boxart-210x280.jpg').trim();
  const sarkTvClips = [...new Set((Array.isArray(rawSarkTvClips) ? rawSarkTvClips : [])
    .map((slug) => String(slug || '').trim())
    .filter(Boolean))];

  const vodIndexVods = (Array.isArray(rawVodIndex?.vods) ? rawVodIndex.vods : [])
    .filter((vod) => vod && vod.id && vod.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.title).localeCompare(String(b.title)));
  const vodIndexById = new Map(vodIndexVods.map((vod) => [String(vod.id), vod]));
  const vodIndexYears = (Array.isArray(rawVodIndex?.years) ? rawVodIndex.years : [])
    .map(Number)
    .filter((year) => Number.isInteger(year))
    .sort((a, b) => a - b);
  const vodsByDate = new Map();
  vodIndexVods.forEach((vod) => {
    if (!vodsByDate.has(vod.date)) vodsByDate.set(vod.date, []);
    vodsByDate.get(vod.date).push(vod);
  });
  const vodIndexNewestDate = vodIndexVods[0]?.date || '';


  const navSections = [
    [
      { id: 'home', label: 'HOME', icon: 'home' }
    ],
    [
      { id: 'sark-tv', label: 'SARK TV', icon: 'sark-tv' },
      { id: 'sark-radio', label: 'SARK RADIO', icon: 'sark-radio' }
    ],
    [
      { id: 'vod-index', label: 'VOD INDEX', icon: 'vod-index' },
      { id: 'categories', label: 'CATAGORIES', icon: 'categories' },
      { id: 'backrooms', label: 'BACKROOMS', icon: 'backrooms' }
    ],
    [
      { id: 'marbles-scores', label: 'MARBLES SCORES', icon: 'marbles-scores' },
      { id: 'sark-links', label: 'SARK LINKS', icon: 'links' },
      { id: 'pals', label: 'PALS', icon: 'pals' },
      { id: 'shop', label: 'SHOP', icon: 'shop' },
      { id: 'about', label: 'ABOUT', icon: 'about' }
    ]
  ];
  const navItems = navSections.flat();
  const navItemsById = new Map(navItems.map((item) => [item.id, item]));

  const elements = {
    body: document.body,
    siteSidebar: document.querySelector('#site-sidebar'),
    siteMenu: document.querySelector('#site-menu'),
    menuToggle: document.querySelector('#menu-toggle'),
    brandHome: document.querySelector('#brand-home'),
    navScrim: document.querySelector('#nav-scrim'),
    siteSearch: document.querySelector('#site-search'),
    siteSearchInput: document.querySelector('#site-search-input'),
    homePage: document.querySelector('#home-page'),
    homeShelves: document.querySelector('#home-shelves'),
    categoryPage: document.querySelector('#category-page'),
    categoryBack: document.querySelector('#category-back'),
    categoryPageTitle: document.querySelector('#category-page-title'),
    categoryPageDescription: document.querySelector('#category-page-description'),
    categoryGrid: document.querySelector('#category-grid'),
    categoriesPage: document.querySelector('#categories-page'),
    categoriesList: document.querySelector('#categories-list'),
    aboutPage: document.querySelector('#about-page'),
    searchPage: document.querySelector('#search-page'),
    searchSummary: document.querySelector('#search-summary'),
    searchResults: document.querySelector('#search-results'),
    searchFilterShell: document.querySelector('#search-filter-shell'),
    searchFilterButton: document.querySelector('#search-filter-button'),
    searchFilterBadge: document.querySelector('#search-filter-badge'),
    searchFilterPanel: document.querySelector('#search-filter-panel'),
    searchFilterReset: document.querySelector('#search-filter-reset'),
    searchFilterTypes: document.querySelector('#search-filter-types'),
    searchFilterSources: document.querySelector('#search-filter-sources'),
    gamesPage: document.querySelector('#games-page'),
    gameGrid: document.querySelector('#game-grid'),
    gamePage: document.querySelector('#game-page'),
    gameHeroImage: document.querySelector('#game-hero-image'),
    gameDetailTitle: document.querySelector('#game-detail-title'),
    gameDetailTags: document.querySelector('#game-detail-tags'),
    gameDetailDescription: document.querySelector('#game-detail-description'),
    gamePlay: document.querySelector('#game-play'),
    gameGroupSelect: document.querySelector('#game-group-select'),
    gameDetailChapterList: document.querySelector('#game-detail-chapter-list'),
    gameEpisodesTitle: document.querySelector('#game-episodes-title'),
    podcastPage: document.querySelector('#podcast-page'),
    podcastHeroImage: document.querySelector('#podcast-hero-image'),
    podcastHeroKicker: document.querySelector('#podcast-hero-kicker'),
    podcastDetailTitle: document.querySelector('#podcast-detail-title'),
    podcastDetailTags: document.querySelector('#podcast-detail-tags'),
    podcastDetailDescription: document.querySelector('#podcast-detail-description'),
    podcastPlay: document.querySelector('#podcast-play'),
    podcastGroupSelect: document.querySelector('#podcast-group-select'),
    podcastDetailChapterList: document.querySelector('#podcast-detail-chapter-list'),
    podcastEpisodesTitle: document.querySelector('#podcast-episodes-title'),
    nerdPokerPage: document.querySelector('#nerd-poker-page'),
    nerdPokerYoutube: document.querySelector('#nerd-poker-youtube'),
    nerdPokerPlaceholder: document.querySelector('#nerd-poker-placeholder'),
    nerdPokerTitle: document.querySelector('#nerd-poker-title'),
    nerdPokerDate: document.querySelector('#nerd-poker-date'),
    nerdPokerDescription: document.querySelector('#nerd-poker-description'),
    nerdPokerLibraryCount: document.querySelector('#nerd-poker-library-count'),
    nerdPokerEpisodeList: document.querySelector('#nerd-poker-episode-list'),
    nerdPokerPlay: document.querySelector('#nerd-poker-play'),
    nerdPokerPlayLabel: document.querySelector('#nerd-poker-play-label'),
    nerdPokerPrevious: document.querySelector('#nerd-poker-previous'),
    nerdPokerNext: document.querySelector('#nerd-poker-next'),
    nerdPokerDockArtwork: document.querySelector('#nerd-poker-dock-artwork'),
    nerdPokerDockTitle: document.querySelector('#nerd-poker-dock-title'),
    nerdPokerDockMeta: document.querySelector('#nerd-poker-dock-meta'),
    nerdPokerDockContext: document.querySelector('#nerd-poker-dock-context'),
    watchGroupSelect: document.querySelector('#watch-group-select'),
    marblesScoresPage: document.querySelector('#marbles-scores-page'),
    marblesRaceSelect: document.querySelector('#marbles-race-select'),
    marblesPlayerSearch: document.querySelector('#marbles-player-search'),
    marblesPlayerSearchInput: document.querySelector('#marbles-player-search-input'),
    marblesPlayerSearchResults: document.querySelector('#marbles-player-search-results'),
    marblesScoreHeading: document.querySelector('#marbles-score-heading'),
    marblesScoreContext: document.querySelector('#marbles-score-context'),
    marblesScoreTable: document.querySelector('#marbles-score-table'),
    marblesScoreHeaderRow: document.querySelector('#marbles-score-header-row'),
    marblesScoreBody: document.querySelector('#marbles-score-body'),
    marblesBackScorecard: document.querySelector('#marbles-back-scorecard'),
    marblesWatchRace: document.querySelector('#marbles-watch-race'),
    sarkTvPage: document.querySelector('#sark-tv-page'),
    sarkTvPlayer: document.querySelector('#sark-tv-player'),
    sarkTvPlaceholder: document.querySelector('#sark-tv-placeholder'),
    sarkTvPlayPause: document.querySelector('#sark-tv-play-pause'),
    sarkTvPlayPauseLabel: document.querySelector('#sark-tv-play-pause-label'),
    sarkTvNext: document.querySelector('#sark-tv-next'),
    sarkTvStatus: document.querySelector('#sark-tv-status'),
    sarkTvCount: document.querySelector('#sark-tv-count'),
    sarkRadioPage: document.querySelector('#sark-radio-page'),
    sarkRadioLibraryCount: document.querySelector('#sark-radio-library-count'),
    sarkRadioYoutube: document.querySelector('#sark-radio-youtube'),
    sarkRadioPlaceholder: document.querySelector('#sark-radio-placeholder'),
    sarkRadioTrackTitle: document.querySelector('#sark-radio-track-title'),
    sarkRadioTrackMeta: document.querySelector('#sark-radio-track-meta'),
    sarkRadioTrackList: document.querySelector('#sark-radio-track-list'),
    sarkRadioPlay: document.querySelector('#sark-radio-play'),
    sarkRadioPlayLabel: document.querySelector('#sark-radio-play-label'),
    sarkRadioPrevious: document.querySelector('#sark-radio-previous'),
    sarkRadioNext: document.querySelector('#sark-radio-next'),
    sarkRadioFeaturedLink: document.querySelector('#sark-radio-featured-link'),
    sarkRadioDetectionCount: document.querySelector('#sark-radio-detection-count'),
    sarkRadioDockArtwork: document.querySelector('#sark-radio-dock-artwork'),
    sarkRadioDockTitle: document.querySelector('#sark-radio-dock-title'),
    sarkRadioDockMeta: document.querySelector('#sark-radio-dock-meta'),
    sarkRadioDockContext: document.querySelector('#sark-radio-dock-context'),
    vodIndexPage: document.querySelector('#vod-index-page'),
    backroomsPage: document.querySelector('#backrooms-page'),
    vodIndexLogicalCount: document.querySelector('#vod-index-logical-count'),
    vodIndexUploadCount: document.querySelector('#vod-index-upload-count'),
    vodIndexDateCount: document.querySelector('#vod-index-date-count'),
    vodRandom: document.querySelector('#vod-random'),
    vodSearch: document.querySelector('#vod-search'),
    vodDateJump: document.querySelector('#vod-date-jump'),
    vodCalendarPrevious: document.querySelector('#vod-calendar-previous'),
    vodCalendarNext: document.querySelector('#vod-calendar-next'),
    vodCalendarLabel: document.querySelector('#vod-calendar-label'),
    vodYearStrip: document.querySelector('#vod-year-strip'),
    vodCalendarGrid: document.querySelector('#vod-calendar-grid'),
    vodClearDate: document.querySelector('#vod-clear-date'),
    vodResultsTitle: document.querySelector('#vod-results-title'),
    vodResultsCount: document.querySelector('#vod-results-count'),
    vodResults: document.querySelector('#vod-results'),
    vodLoadMore: document.querySelector('#vod-load-more'),
    vodWatchPage: document.querySelector('#vod-watch-page'),
    vodYoutubePlayerShell: document.querySelector('#vod-youtube-player-shell'),
    vodPlayerPlaceholder: document.querySelector('#vod-player-placeholder'),
    vodPlayPause: document.querySelector('#vod-play-pause'),
    vodPlayPauseLabel: document.querySelector('#vod-play-pause-label'),
    vodBack: document.querySelector('#vod-back'),
    vodPlayerTitle: document.querySelector('#vod-player-title'),
    vodPlayerMeta: document.querySelector('#vod-player-meta'),
    vodRuntime: document.querySelector('#vod-runtime'),
    vodCopySelector: document.querySelector('#vod-copy-selector'),
    vodCopySelect: document.querySelector('#vod-copy-select'),
    shopPage: document.querySelector('#shop-page'),
    sarkLinksPage: document.querySelector('#sark-links-page'),
    palsPage: document.querySelector('#pals-page'),
    palsGrid: document.querySelector('#pals-grid'),
    comingSoonPage: document.querySelector('#coming-soon-page'),
    comingSoonTitle: document.querySelector('#coming-soon-title'),
    watchPage: document.querySelector('#watch-page'),
    gameTitle: document.querySelector('#game-title'),
    chapterTitle: document.querySelector('#chapter-title'),
    videoTitleSeparator: document.querySelector('#video-title-separator'),
    segmentLabel: document.querySelector('#segment-label'),
    chapterRuntime: document.querySelector('#chapter-runtime'),
    chapterList: document.querySelector('#chapter-list'),
    watchChaptersTitle: document.querySelector('#watch-chapters-title'),
    playPause: document.querySelector('#play-pause'),
    playPauseLabel: document.querySelector('#play-pause-label'),
    previousChapter: document.querySelector('#previous-chapter'),
    nextChapter: document.querySelector('#next-chapter'),
    backroomsWatchBack: document.querySelector('#backrooms-watch-back'),
    chapterPanel: document.querySelector('#chapter-panel'),
    runtimeBlock: document.querySelector('.runtime-block'),
    playerPlaceholder: document.querySelector('#player-placeholder'),
    youtubePlayerShell: document.querySelector('#youtube-player-shell'),
    archivePlayer: document.querySelector('#archive-player')
  };

  function showFatalError(message) {
    document.body.innerHTML = `<p class="fatal-error">${message}</p>`;
  }

  function scrollPageToTop() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }

  function normalizeLibrary(raw) {
    if (!raw || !Array.isArray(raw.games)) return [];

    const usedGameIds = new Set();

    function normalizeSegment(segment, gameId, chapterId, segmentIndex) {
      if (!segment || typeof segment !== 'object') return null;

      const videoId = String(segment.videoId || '').trim();
      const archiveId = String(segment.archiveId || '').trim();
      const sourceUrl = String(segment.sourceUrl || '').trim();
      const g4Url = String(segment.g4Url || '').trim();
      const sourceType = archiveId ? 'archive' : (videoId ? 'youtube' : (sourceUrl ? 'external' : ''));
      const rawStart = segment.startSeconds;
      const startSeconds = rawStart === undefined || rawStart === null || rawStart === ''
        ? 0
        : Number(rawStart);
      const rawEnd = segment.endSeconds;
      const endSeconds = rawEnd === undefined || rawEnd === null || rawEnd === ''
        ? null
        : Number(rawEnd);
      const label = String(segment.label || '').trim();

      if (!sourceType || !Number.isFinite(startSeconds) || startSeconds < 0) {
        console.warn(`Invalid segment in game "${gameId}", chapter "${chapterId}" at segments[${segmentIndex}].`);
        return null;
      }

      if (endSeconds !== null && (!Number.isFinite(endSeconds) || endSeconds <= startSeconds)) {
        console.warn(`Ignored invalid endSeconds in game "${gameId}", chapter "${chapterId}" at segments[${segmentIndex}].`);
      }

      return {
        sourceType,
        videoId,
        archiveId,
        sourceUrl,
        g4Url,
        startSeconds,
        endSeconds: Number.isFinite(endSeconds) && endSeconds > startSeconds ? endSeconds : null,
        label
      };
    }

    function segmentSource(container) {
      if (!container || typeof container !== 'object') return [];
      if (Array.isArray(container.segments)) return container.segments;
      return container.videoId ? [container] : [];
    }

    return raw.games.flatMap((game, gameIndex) => {
      if (!game || typeof game !== 'object') return [];

      const id = String(game.id || '').trim();
      const title = String(game.title || '').trim();
      const titleLine1 = String(game.titleLine1 || '').trim();
      const titleLine2 = String(game.titleLine2 || '').trim();
      const image = String(game.image || fallbackGameImage).trim() || fallbackGameImage;
      const heroImage = String(game.heroImage || image).trim() || image;
      const description = String(game.description || '').trim();
      const navId = String(game.navId || '').trim();
      const kicker = String(game.kicker || title).trim() || title;
      const episodesLabel = String(game.episodesLabel || 'Episodes').trim() || 'Episodes';
      const chaptersLabel = String(game.chaptersLabel || 'Chapters').trim() || 'Chapters';
      const groupSelectLabel = String(game.groupSelectLabel || 'Select group').trim() || 'Select group';
      const tags = (Array.isArray(game.tags) ? game.tags : [])
        .map((tag) => String(tag || '').trim())
        .filter(Boolean);
      const people = (Array.isArray(game.people) ? game.people : [])
        .map((person) => String(person || '').trim())
        .filter(Boolean);
      const searchTerms = (Array.isArray(game.searchTerms) ? game.searchTerms : [])
        .map((term) => String(term || '').trim())
        .filter(Boolean);

      if (!id || !title || usedGameIds.has(id)) {
        console.warn(`Invalid or duplicate game entry at games[${gameIndex}].`);
        return [];
      }

      let groupInputs = Array.isArray(game.groups) ? game.groups : [];

      if (!groupInputs.length) {
        let chapterInputs = Array.isArray(game.chapters) ? game.chapters : [];
        const rootSegments = segmentSource(game);

        if (!chapterInputs.length && rootSegments.length) {
          chapterInputs = [{
            id: `${id}-playthrough`,
            title: String(game.chapterTitle || 'Playthrough').trim() || 'Playthrough',
            segments: rootSegments
          }];
        }

        if (chapterInputs.length) {
          groupInputs = [{
            id: `${id}-default`,
            title: String(game.groupTitle || title).trim() || title,
            chapters: chapterInputs
          }];
        }
      }

      const usedGroupIds = new Set();
      const usedChapterIds = new Set();
      const chapters = [];
      let chapterOrdinal = 0;

      const groups = groupInputs.flatMap((group, groupIndex) => {
        if (!group || typeof group !== 'object') return [];

        const groupId = String(group.id || `${id}-group-${groupIndex + 1}`).trim();
        const groupTitle = String(group.title || title).trim() || title;
        const groupTags = (Array.isArray(group.tags) ? group.tags : [])
          .map((tag) => String(tag || '').trim())
          .filter(Boolean);
        const groupPeople = (Array.isArray(group.people) ? group.people : [])
          .map((person) => String(person || '').trim())
          .filter(Boolean);
        const groupSearchTerms = (Array.isArray(group.searchTerms) ? group.searchTerms : [])
          .map((term) => String(term || '').trim())
          .filter(Boolean);

        if (!groupId || usedGroupIds.has(groupId)) return [];

        let chapterInputs = Array.isArray(group.chapters) ? group.chapters : [];
        const groupSegments = segmentSource(group);

        if (!chapterInputs.length && groupSegments.length) {
          chapterInputs = [{
            id: `${groupId}-playthrough`,
            title: String(group.chapterTitle || 'Playthrough').trim() || 'Playthrough',
            segments: groupSegments
          }];
        }

        const normalizedChapters = chapterInputs.flatMap((chapter, chapterIndex) => {
          if (!chapter || typeof chapter !== 'object') return [];

          chapterOrdinal += 1;
          const chapterId = String(chapter.id || `${id}-chapter-${chapterOrdinal}`).trim();
          const chapterTitle = String(chapter.title || `Chapter ${chapterOrdinal}`).trim() || `Chapter ${chapterOrdinal}`;
          const chapterDate = String(chapter.date || '').trim();
          const chapterDescriptionText = String(chapter.description || '').trim();
          const orderLabel = String(chapter.orderLabel || '').trim();
          const chapterTags = (Array.isArray(chapter.tags) ? chapter.tags : [])
            .map((tag) => String(tag || '').trim())
            .filter(Boolean);
          const chapterPeople = (Array.isArray(chapter.people) ? chapter.people : [])
            .map((person) => String(person || '').trim())
            .filter(Boolean);
          const chapterSearchTerms = (Array.isArray(chapter.searchTerms) ? chapter.searchTerms : [])
            .map((term) => String(term || '').trim())
            .filter(Boolean);
          const chapterSubject = String(chapter.subject || '').trim();
          const chapterType = String(chapter.type || '').trim();
          const rawRuntimeSeconds = chapter.runtimeSeconds;
          const runtimeSeconds = rawRuntimeSeconds === undefined || rawRuntimeSeconds === null || rawRuntimeSeconds === ''
            ? null
            : Number(rawRuntimeSeconds);

          if (!chapterId || usedChapterIds.has(chapterId)) return [];

          const segments = segmentSource(chapter)
            .map((segment, segmentIndex) => normalizeSegment(segment, id, chapterId, segmentIndex))
            .filter(Boolean);

          if (!segments.length) return [];

          usedChapterIds.add(chapterId);
          const normalizedChapter = {
            id: chapterId,
            title: chapterTitle,
            kind: chapter.kind === 'bonus' ? 'bonus' : 'main',
            date: chapterDate,
            description: chapterDescriptionText,
            orderLabel,
            tags: chapterTags,
            people: chapterPeople,
            searchTerms: chapterSearchTerms,
            groupTags,
            groupPeople,
            groupSearchTerms,
            subject: chapterSubject,
            type: chapterType,
            runtimeSeconds: Number.isFinite(runtimeSeconds) && runtimeSeconds >= 0 ? runtimeSeconds : null,
            groupId,
            groupTitle,
            segments
          };
          chapters.push(normalizedChapter);
          return [normalizedChapter];
        });

        if (!normalizedChapters.length) return [];

        usedGroupIds.add(groupId);
        return [{
          id: groupId,
          title: groupTitle,
          tags: groupTags,
          people: groupPeople,
          searchTerms: groupSearchTerms,
          chapters: normalizedChapters
        }];
      });

      if (!groups.length || !chapters.length) {
        console.warn(`Game "${id}" has no playable entries.`);
        return [];
      }

      usedGameIds.add(id);
      return [{
        id,
        title,
        titleLine1,
        titleLine2,
        image,
        heroImage,
        description,
        navId,
        kicker,
        episodesLabel,
        chaptersLabel,
        groupSelectLabel,
        tags,
        people,
        searchTerms,
        groups,
        chapters
      }];
    });
  }

  function playerRequestForSegment(segment) {
    const request = {
      videoId: segment.videoId,
      startSeconds: segment.startSeconds,
      suggestedQuality: 'large'
    };

    if (Number.isFinite(segment.endSeconds)) {
      request.endSeconds = segment.endSeconds;
    }

    return request;
  }

  const games = normalizeLibrary(rawLibrary);
  const guestPodcastSourceEntries = Array.isArray(rawGuestPodcastLibrary?.podcasts)
    ? rawGuestPodcastLibrary.podcasts
    : [];
  const podcasts = normalizeLibrary({
    games: [
      ...(rawPodcastLibrary?.podcasts || []),
      ...(rawRadioRespawnLibrary?.shows || rawRadioRespawnLibrary?.podcasts || []),
      ...(rawRespawnInboxLibrary?.shows || rawRespawnInboxLibrary?.podcasts || []),
      ...(rawXPlayLibrary?.shows || rawXPlayLibrary?.podcasts || []),
      ...guestPodcastSourceEntries
    ]
  });
  const gamesById = new Map(games.map((game) => [game.id, game]));
  const podcastsById = new Map(podcasts.map((podcast) => [podcast.id, podcast]));
  const playableEntries = [...games, ...podcasts];
  const guestPodcastEntryIds = new Set(guestPodcastSourceEntries
    .map((entry) => String(entry?.id || '').trim())
    .filter(Boolean));

  const pals = (Array.isArray(rawPalsData?.pals) ? rawPalsData.pals : [])
    .map((pal) => ({
      id: String(pal?.id || '').trim(),
      name: String(pal?.name || '').trim(),
      handle: String(pal?.handle || '').trim(),
      avatar: String(pal?.avatar || '').trim(),
      twitch: String(pal?.twitch || '').trim(),
      links: (Array.isArray(pal?.links) ? pal.links : [])
        .map((link) => ({
          label: String(link?.label || '').trim(),
          url: String(link?.url || '').trim(),
          icon: String(link?.icon || '').trim()
        }))
        .filter((link) => link.label && link.url)
    }))
    .filter((pal) => pal.id && pal.name && pal.twitch);


  // Nerd Poker currently keeps editorial episode records separately from its playable
  // chapter structure. Discovery accepts metadata from either representation so a
  // future credits pass cannot silently land in the "wrong" half of the dataset.
  const nerdPokerPlaybackEntryId = String(rawPodcastLibrary?.podcasts?.[0]?.id || '').trim();
  const nerdPokerPlaybackEntry = nerdPokerPlaybackEntryId ? podcastsById.get(nerdPokerPlaybackEntryId) : null;
  const nerdPokerPlaybackMetadataByEpisode = new Map();

  (nerdPokerPlaybackEntry?.chapters || []).forEach((chapter, chapterIndex) => {
    const orderMatch = String(chapter?.orderLabel || '').match(/(?:#|episode\s*)?(\d+)/i);
    const idMatch = String(chapter?.id || '').match(/(?:ep|episode)[-_]?(\d+)/i);
    const episodeNumber = Number(orderMatch?.[1] || idMatch?.[1] || chapterIndex + 1);
    if (Number.isInteger(episodeNumber) && episodeNumber > 0 && !nerdPokerPlaybackMetadataByEpisode.has(episodeNumber)) {
      nerdPokerPlaybackMetadataByEpisode.set(episodeNumber, chapter);
    }
  });

  const nerdPokerEpisodes = (Array.isArray(rawPodcastLibrary?.episodes) ? rawPodcastLibrary.episodes : [])
    .map((episode) => {
      const episodeNumber = Number(episode?.episodeNumber);
      const playbackMetadata = nerdPokerPlaybackMetadataByEpisode.get(episodeNumber) || null;
      return {
        episodeNumber,
        title: String(episode?.title || playbackMetadata?.title || '').trim(),
        date: String(episode?.date || playbackMetadata?.date || '').trim(),
        description: String(episode?.description || playbackMetadata?.description || '').trim(),
        url: String(episode?.url || '').trim(),
        thumbnail: String(episode?.thumbnail || rawPodcastLibrary?.thumbnail || '').trim(),
        videoId: String(episode?.videoId || playbackMetadata?.segments?.[0]?.videoId || '').trim(),
        tags: uniqueDiscoveryTags(playbackMetadata?.groupTags, playbackMetadata?.tags, episode?.tags),
        people: uniqueDiscoveryTags(playbackMetadata?.groupPeople, playbackMetadata?.people, episode?.people),
        searchTerms: uniqueDiscoveryTags(playbackMetadata?.groupSearchTerms, playbackMetadata?.searchTerms, episode?.searchTerms),
        subject: String(episode?.subject || playbackMetadata?.subject || '').trim(),
        type: String(episode?.type || playbackMetadata?.type || '').trim(),
        runtimeSeconds: Number.isFinite(Number(episode?.runtimeSeconds))
          ? Number(episode.runtimeSeconds)
          : (Number.isFinite(Number(playbackMetadata?.runtimeSeconds)) ? Number(playbackMetadata.runtimeSeconds) : null)
      };
    })
    .filter((episode) => Number.isInteger(episode.episodeNumber) && episode.episodeNumber > 0 && episode.title)
    .sort((a, b) => a.episodeNumber - b.episodeNumber);


  const explicitDiscoveryCollectionDefs = (Array.isArray(rawDiscoveryLibrary?.collections) ? rawDiscoveryLibrary.collections : [])
    .map((collection) => ({
      id: String(collection?.id || '').trim(),
      title: String(collection?.title || '').trim(),
      kind: String(collection?.kind || '').trim(),
      entryId: String(collection?.entryId || '').trim(),
      homeImage: String(collection?.homeImage || '').trim(),
      tags: (Array.isArray(collection?.tags) ? collection.tags : []).map((tag) => String(tag || '').trim()).filter(Boolean),
      searchTerms: (Array.isArray(collection?.searchTerms) ? collection.searchTerms : []).map((term) => String(term || '').trim()).filter(Boolean)
    }))
    .filter((collection) => collection.id && collection.title);

  // Guest podcast discovery is generated from podcasts.js. The discovery file may
  // optionally override presentation metadata for an existing entry, but adding a
  // podcast must never require registering the same ID in a second file.
  const guestPodcastDiscoveryOverrides = new Map(explicitDiscoveryCollectionDefs
    .filter((collection) => guestPodcastEntryIds.has(collection.entryId))
    .map((collection) => [collection.entryId, collection]));

  const guestPodcastDiscoveryDefs = guestPodcastSourceEntries
    .map((entry) => {
      const id = String(entry?.id || '').trim();
      if (!id) return null;

      const automatic = {
        id,
        title: String(entry?.discoveryTitle || entry?.title || id).trim(),
        kind: 'show',
        entryId: id,
        homeImage: String(entry?.image || entry?.heroImage || '').trim(),
        tags: (Array.isArray(entry?.tags) ? entry.tags : []).map((tag) => String(tag || '').trim()).filter(Boolean),
        searchTerms: (Array.isArray(entry?.searchTerms) ? entry.searchTerms : []).map((term) => String(term || '').trim()).filter(Boolean)
      };
      const override = guestPodcastDiscoveryOverrides.get(id);
      if (!override) return automatic;

      return {
        ...automatic,
        ...override,
        id,
        entryId: id,
        kind: 'show',
        tags: [...new Set([...automatic.tags, ...override.tags])],
        searchTerms: [...new Set([...automatic.searchTerms, ...override.searchTerms])],
        homeImage: override.homeImage || automatic.homeImage,
        title: override.title || automatic.title
      };
    })
    .filter(Boolean);

  const nonGuestDiscoveryCollectionDefs = explicitDiscoveryCollectionDefs
    .filter((collection) => !guestPodcastEntryIds.has(collection.entryId));
  const guestPodcastInsertIndex = (() => {
    const nerdPokerIndex = nonGuestDiscoveryCollectionDefs.findIndex((collection) => collection.id === 'nerd-poker');
    return nerdPokerIndex >= 0 ? nerdPokerIndex + 1 : nonGuestDiscoveryCollectionDefs.length;
  })();
  const discoveryCollectionDefs = [
    ...nonGuestDiscoveryCollectionDefs.slice(0, guestPodcastInsertIndex),
    ...guestPodcastDiscoveryDefs,
    ...nonGuestDiscoveryCollectionDefs.slice(guestPodcastInsertIndex)
  ];

  const discoveryCollectionsById = new Map(discoveryCollectionDefs.map((collection) => [collection.id, collection]));

  const guestPodcastCategoryRecordIds = guestPodcastSourceEntries
    .map((entry) => String(entry?.id || '').trim())
    .filter(Boolean)
    .map((id) => `collection:${id}`);

  const discoveryCategories = (Array.isArray(rawDiscoveryLibrary?.categories) ? rawDiscoveryLibrary.categories : [])
    .map((category) => {
      const id = String(category?.id || '').trim();
      const configuredRecordIds = (Array.isArray(category?.recordIds) ? category.recordIds : [])
        .map((recordId) => String(recordId || '').trim())
        .filter(Boolean);
      const recordIds = id === 'podcasts'
        ? [...guestPodcastCategoryRecordIds, 'collection:nerd-poker']
        : configuredRecordIds;

      return {
        id,
        title: String(category?.title || '').trim(),
        description: String(category?.description || '').trim(),
        home: category?.home !== false,
        homeLimit: Math.max(1, Number(category?.homeLimit) || 12),
        cardStyle: category?.cardStyle === 'poster' ? 'poster' : 'landscape',
        order: ['alpha', 'random', 'custom'].includes(String(category?.order || '').trim()) ? String(category.order).trim() : 'random',
        homeOrder: ['alpha', 'random', 'custom'].includes(String(category?.homeOrder || '').trim()) ? String(category.homeOrder).trim() : '',
        recordIds,
        rule: category?.rule && typeof category.rule === 'object' ? category.rule : {}
      };
    })
    .filter((category) => category.id && category.title);

  const discoveryCategoriesById = new Map(discoveryCategories.map((category) => [category.id, category]));

  function uniqueDiscoveryTags(...sources) {
    return [...new Set(sources
      .flatMap((source) => Array.isArray(source) ? source : [])
      .map((tag) => String(tag || '').trim())
      .filter(Boolean))];
  }

  function collectionEntry(collectionId) {
    const definition = discoveryCollectionsById.get(collectionId);
    if (!definition?.entryId) return null;
    return podcastsById.get(definition.entryId) || null;
  }

  function discoveryThumbnailForChapter(chapter, fallbackImage = '') {
    const segment = chapter?.segments?.[0];
    if (segment?.sourceType === 'archive' && segment.archiveId) {
      return `https://archive.org/services/img/${encodeURIComponent(segment.archiveId)}`;
    }
    if (segment?.videoId) return `https://i.ytimg.com/vi/${encodeURIComponent(segment.videoId)}/hqdefault.jpg`;
    return fallbackImage || fallbackGameImage;
  }

  function discoveryRoute(record) {
    if (!record) return '#home';
    if (record.kind === 'game') return `#game=${encodeURIComponent(record.entryId)}`;
    if (record.kind === 'chapter') {
      const params = new URLSearchParams({ game: record.entryId, watch: '1', chapter: record.itemId });
      return `#${params.toString()}`;
    }
    if (record.kind === 'tool') return `#page=${encodeURIComponent(record.entryId || record.collectionId)}`;
    if (record.kind === 'collection') {
      if (record.collectionId === 'nerd-poker') return '#page=nerd-poker';
      return `#podcast=${encodeURIComponent(record.entryId)}`;
    }
    if (record.kind === 'episode') {
      if (record.collectionId === 'nerd-poker') {
        return `#page=nerd-poker&episode=${encodeURIComponent(String(record.episodeNumber || ''))}`;
      }
      const params = new URLSearchParams({ podcast: record.entryId, watch: '1', chapter: record.itemId });
      return `#${params.toString()}`;
    }
    return '#home';
  }

  function buildDiscoveryRecords() {
    const records = [];

    games.forEach((game) => {
      // Native scope remains precise, but the parent game discovery card rolls up
      // descendant metadata. This lets a person/tag attached to one session make the
      // game discoverable without falsely inheriting that metadata into every chapter.
      const gameTags = uniqueDiscoveryTags(game.tags, ['games', 'gameplay']);
      const gamePeople = uniqueDiscoveryTags(game.people);
      const gameSearchTerms = uniqueDiscoveryTags(game.searchTerms);
      const descendantTags = uniqueDiscoveryTags(
        game.groups.flatMap((group) => group.tags),
        game.chapters.flatMap((chapter) => chapter.tags)
      );
      const descendantPeople = uniqueDiscoveryTags(
        game.groups.flatMap((group) => group.people),
        game.chapters.flatMap((chapter) => chapter.people)
      );
      const descendantSearchTerms = uniqueDiscoveryTags(
        game.groups.flatMap((group) => group.searchTerms),
        game.chapters.flatMap((chapter) => chapter.searchTerms)
      );
      const discoveryGameTags = uniqueDiscoveryTags(gameTags, descendantTags);
      const discoveryGamePeople = uniqueDiscoveryTags(gamePeople, descendantPeople);
      const discoveryGameSearchTerms = uniqueDiscoveryTags(gameSearchTerms, descendantSearchTerms);

      records.push({
        id: `game:${game.id}`,
        kind: 'game',
        collectionId: 'games',
        entryId: game.id,
        itemId: game.id,
        title: game.title,
        parentTitle: '',
        description: game.description,
        date: '',
        image: game.image,
        tags: discoveryGameTags,
        people: discoveryGamePeople,
        searchTerms: discoveryGameSearchTerms,
        eyebrow: 'GAME',
        metaLine: `${game.chapters.length} ${game.chapters.length === 1 ? 'chapter' : 'chapters'}`
      });

      game.chapters.forEach((chapter) => {
        records.push({
          id: `chapter:${game.id}:${chapter.id}`,
          kind: 'chapter',
          collectionId: 'games',
          entryId: game.id,
          itemId: chapter.id,
          title: chapter.title,
          parentTitle: game.title,
          description: chapter.description || chapterDescription(chapter),
          date: chapter.date,
          image: game.image,
          tags: uniqueDiscoveryTags(gameTags, chapter.groupTags, chapter.tags, [chapter.groupTitle, chapter.subject, chapter.type]),
          people: uniqueDiscoveryTags(gamePeople, chapter.groupPeople, chapter.people),
          searchTerms: uniqueDiscoveryTags(gameSearchTerms, chapter.groupSearchTerms, chapter.searchTerms),
          eyebrow: 'CHAPTER',
          metaLine: [game.title, chapter.date].filter(Boolean).join(' · ')
        });
      });
    });

    discoveryCollectionDefs
      .filter((definition) => definition.kind === 'show')
      .forEach((definition) => {
        const entry = collectionEntry(definition.id);
        if (!entry) return;
        const isNerdPoker = definition.id === 'nerd-poker';
        const isGuestPodcast = guestPodcastEntryIds.has(entry.id);
        const episodeCount = isNerdPoker ? nerdPokerEpisodes.length : (isGuestPodcast ? 1 : entry.chapters.length);
        const collectionTags = uniqueDiscoveryTags(entry.tags, definition.tags);
        const collectionPeople = uniqueDiscoveryTags(entry.people);
        const collectionSearchTerms = uniqueDiscoveryTags(entry.searchTerms, definition.searchTerms);
        const nativeCountLabel = entry.tags.find((tag) => /episode|clip|video/i.test(tag)) || '';

        records.push({
          id: `collection:${definition.id}`,
          kind: 'collection',
          collectionId: definition.id,
          entryId: entry.id,
          itemId: entry.id,
          title: definition.title,
          parentTitle: '',
          description: entry.description,
          date: '',
          image: entry.image,
          tags: collectionTags,
          people: collectionPeople,
          searchTerms: collectionSearchTerms,
          eyebrow: (isNerdPoker || isGuestPodcast) ? 'PODCAST' : 'COLLECTION',
          metaLine: isGuestPodcast ? '1 episode' : (nativeCountLabel || `${episodeCount} ${episodeCount === 1 ? 'item' : (definition.id === 'x-play' ? 'clips' : 'episodes')}`)
        });

        if (isNerdPoker) {
          nerdPokerEpisodes.filter((episode) => episode.videoId).forEach((episode) => {
            records.push({
              id: `episode:nerd-poker:${episode.episodeNumber}`,
              kind: 'episode',
              collectionId: definition.id,
              entryId: entry.id,
              itemId: `nerd-poker-episode-${episode.episodeNumber}`,
              episodeNumber: episode.episodeNumber,
              title: episode.title,
              parentTitle: definition.title,
              description: episode.description,
              date: episode.date,
              image: episode.thumbnail || entry.image,
              tags: uniqueDiscoveryTags(collectionTags, episode.tags, [episode.subject, episode.type]),
              people: uniqueDiscoveryTags(collectionPeople, episode.people),
              searchTerms: uniqueDiscoveryTags(collectionSearchTerms, episode.searchTerms),
              eyebrow: `NERD POKER #${String(episode.episodeNumber).padStart(2, '0')}`,
              metaLine: episode.date
            });
          });
          return;
        }

        entry.chapters.forEach((chapter, chapterIndex) => {
          const order = chapter.orderLabel || String(chapterIndex + 1).padStart(2, '0');
          const itemWord = isGuestPodcast ? 'CHAPTER' : (definition.id === 'x-play' ? 'X-PLAY' : definition.title.toUpperCase());
          records.push({
            id: `episode:${definition.id}:${chapter.id}`,
            kind: 'episode',
            collectionId: definition.id,
            entryId: entry.id,
            itemId: chapter.id,
            title: chapter.title,
            parentTitle: definition.title,
            description: chapter.description || chapterDescription(chapter),
            date: chapter.date,
            image: discoveryThumbnailForChapter(chapter, entry.image),
            tags: uniqueDiscoveryTags(collectionTags, chapter.groupTags, chapter.tags, [chapter.groupTitle, chapter.subject, chapter.type]),
            people: uniqueDiscoveryTags(collectionPeople, chapter.groupPeople, chapter.people),
            searchTerms: uniqueDiscoveryTags(collectionSearchTerms, chapter.groupSearchTerms, chapter.searchTerms),
            eyebrow: `${itemWord}${order ? ` · ${order}` : ''}`,
            metaLine: chapter.date
          });
        });
      });

    discoveryCollectionDefs
      .filter((definition) => definition.kind === 'tool')
      .forEach((definition) => {
        const isVodIndex = definition.id === 'vod-index';
        records.push({
          id: `tool:${definition.id}`,
          kind: 'tool',
          collectionId: definition.id,
          entryId: definition.entryId || definition.id,
          itemId: definition.id,
          title: definition.title,
          parentTitle: '',
          description: isVodIndex ? 'Browse preserved Sark stream VODs by date and jump into a random archive night.' : '',
          date: '',
          image: definition.homeImage || fallbackGameImage,
          tags: uniqueDiscoveryTags(definition.tags),
          people: [],
          searchTerms: uniqueDiscoveryTags(definition.searchTerms),
          eyebrow: 'ARCHIVE TOOL',
          metaLine: isVodIndex && rawVodIndex?.logicalVodCount ? `${Number(rawVodIndex.logicalVodCount).toLocaleString()} VODs` : ''
        });
      });

    return records.map((record) => ({ ...record, route: discoveryRoute(record) }));
  }

  const discoveryRecords = buildDiscoveryRecords();
  const discoveryRecordsById = new Map(discoveryRecords.map((record) => [record.id, record]));

  const searchKindOptions = [
    { id: 'game', label: 'Games' },
    { id: 'chapter', label: 'Chapters' },
    { id: 'episode', label: 'Episodes' },
    { id: 'collection', label: 'Collections' },
    { id: 'tool', label: 'Tools' }
  ];

  const searchSourceOptions = discoveryCollectionDefs.map((collection) => ({
    id: collection.id,
    label: collection.id === 'games' ? 'Games' : collection.title
  }));

  function normalizedSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9&]+/g, ' ')
      .trim();
  }

  const gameTagDirectory = (() => {
    const tagsByKey = new Map();

    games.forEach((game) => {
      game.tags.forEach((tag) => {
        const key = normalizedSearchText(tag);
        if (!key) return;

        if (!tagsByKey.has(key)) {
          tagsByKey.set(key, { key, label: tag, gameIds: [] });
        }
        tagsByKey.get(key).gameIds.push(game.id);
      });
    });

    return [...tagsByKey.values()]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  })();

  const gameTagsByKey = new Map(gameTagDirectory.map((tag) => [tag.key, tag]));

  function discoveryFieldMatches(candidate, query) {
    const normalizedCandidate = normalizedSearchText(candidate);
    const normalizedQuery = normalizedSearchText(query);
    if (!normalizedCandidate || !normalizedQuery) return false;
    if (normalizedCandidate === normalizedQuery || normalizedCandidate.includes(normalizedQuery)) return true;
    return normalizedCandidate.replace(/\s+/g, '').includes(normalizedQuery.replace(/\s+/g, ''));
  }

  function categoryRuleMatches(record, rule) {
    const kinds = Array.isArray(rule?.kinds) ? rule.kinds.map(String) : [];
    const collectionIds = Array.isArray(rule?.collectionIds) ? rule.collectionIds.map(String) : [];
    const tagsAny = Array.isArray(rule?.tagsAny) ? rule.tagsAny.map(normalizedSearchText).filter(Boolean) : [];
    const tagsAll = Array.isArray(rule?.tagsAll) ? rule.tagsAll.map(normalizedSearchText).filter(Boolean) : [];
    const peopleAny = Array.isArray(rule?.peopleAny) ? rule.peopleAny.map(String).filter(Boolean) : [];
    const peopleAll = Array.isArray(rule?.peopleAll) ? rule.peopleAll.map(String).filter(Boolean) : [];

    if (kinds.length && !kinds.includes(record.kind)) return false;
    if (collectionIds.length && !collectionIds.includes(record.collectionId)) return false;

    const recordTags = record.tags.map(normalizedSearchText);
    const recordPeople = Array.isArray(record.people) ? record.people : [];
    if (tagsAny.length && !tagsAny.some((tag) => recordTags.some((candidate) => candidate === tag || candidate.includes(tag)))) return false;
    if (tagsAll.length && !tagsAll.every((tag) => recordTags.some((candidate) => candidate === tag || candidate.includes(tag)))) return false;
    if (peopleAny.length && !peopleAny.some((person) => recordPeople.some((candidate) => discoveryFieldMatches(candidate, person)))) return false;
    if (peopleAll.length && !peopleAll.every((person) => recordPeople.some((candidate) => discoveryFieldMatches(candidate, person)))) return false;
    return true;
  }

  const discoverySessionSeed = (() => {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0];
    }
    return Math.floor((Date.now() + Math.random() * 0xffffffff) % 0xffffffff);
  })();

  function discoveryHash(value) {
    let hash = 2166136261 ^ discoverySessionSeed;
    const input = String(value || '');
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return hash >>> 0;
  }

  function orderCategoryRecords(records, order, categoryId) {
    const ordered = [...records];
    if (order === 'alpha') {
      return ordered.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
    }
    if (order === 'random') {
      return ordered.sort((a, b) => {
        const aHash = discoveryHash(`${categoryId}:${a.id}`);
        const bHash = discoveryHash(`${categoryId}:${b.id}`);
        return aHash - bHash || a.title.localeCompare(b.title);
      });
    }
    return ordered;
  }

  function recordsForCategory(category, context = 'category') {
    if (!category) return [];

    const explicitRecords = category.recordIds.length
      ? category.recordIds.map((id) => discoveryRecordsById.get(id)).filter(Boolean)
      : null;
    const records = explicitRecords || discoveryRecords.filter((record) => categoryRuleMatches(record, category.rule));
    const order = context === 'home' ? (category.homeOrder || category.order) : category.order;
    if (order === 'custom' && explicitRecords) return records;
    return orderCategoryRecords(records, order, category.id);
  }

  function searchScore(record, rawQuery) {
    const query = normalizedSearchText(rawQuery);
    if (!query) return 0;
    const rawTokens = [...new Set(query.split(/\s+/).filter(Boolean))];
    const tokens = rawTokens.filter((token) => token.length > 1 || rawTokens.length === 1);
    const title = normalizedSearchText(record.title);
    const parent = normalizedSearchText(record.parentTitle);
    const description = normalizedSearchText(record.description);
    const tags = normalizedSearchText(record.tags.join(' '));
    const people = normalizedSearchText((record.people || []).join(' '));
    const searchTerms = normalizedSearchText((record.searchTerms || []).join(' '));
    const date = normalizedSearchText(record.date);
    const haystack = [title, parent, description, tags, people, searchTerms, date].join(' ');
    const compactQuery = query.replace(/\s+/g, '');
    const compactIdentity = [title, parent, tags, people, searchTerms].join(' ').replace(/\s+/g, '');
    const hasShortPhraseToken = rawTokens.length > 1 && rawTokens.some((token) => token.length === 1);

    const compactMatch = compactQuery.length >= 3 && compactIdentity.includes(compactQuery);
    if (hasShortPhraseToken && !compactMatch) return 0;
    if (!tokens.every((token) => haystack.includes(token)) && !compactMatch) return 0;

    let score = compactMatch ? 180 : 1;
    if (title === query) score += 700;
    else if (title.startsWith(query)) score += 430;
    else if (title.includes(query)) score += 320;

    if (parent === query) score += 260;
    else if (parent.includes(query)) score += 120;

    tokens.forEach((token) => {
      if (title.split(' ').includes(token)) score += 90;
      else if (title.includes(token)) score += 55;
      if (parent.includes(token)) score += 28;
      if (people.includes(token)) score += 34;
      if (searchTerms.includes(token)) score += 26;
      if (tags.includes(token)) score += 20;
      if (description.includes(token)) score += 8;
      if (date.includes(token)) score += 6;
    });

    if (record.kind === 'collection') score += 35;
    if (record.kind === 'game') score += 25;
    return score;
  }

  function searchDiscovery(rawQuery) {
    return discoveryRecords
      .map((record, index) => ({ record, score: searchScore(record, rawQuery), index }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((match) => match.record);
  }

  const marblesPointValues = Array.isArray(rawMarblesScores?.scoring?.positionPoints)
    ? rawMarblesScores.scoring.positionPoints.map(Number)
    : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const marblesRaces = (Array.isArray(rawMarblesScores?.races) ? rawMarblesScores.races : [])
    .map((race) => {
      const id = String(race?.id || '').trim();
      const date = String(race?.date || '').trim();
      const raceNumber = Number(race?.raceNumber);
      const timestamp = String(race?.timestamp || '').trim();
      const resultType = String(race?.resultType || '').trim();
      const entries = (Array.isArray(race?.entries) ? race.entries : [])
        .map((entry) => ({
          order: Number(entry?.order),
          position: String(entry?.position || '').trim(),
          player: String(entry?.player || '').trim(),
          status: String(entry?.status || '').trim()
        }))
        .filter((entry) => entry.player)
        .sort((a, b) => a.order - b.order);

      if (!id || !date || !Number.isInteger(raceNumber) || raceNumber < 1) return null;
      return { id, date, raceNumber, timestamp, resultType, entries };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date) || a.raceNumber - b.raceNumber);

  const marblesRacesById = new Map(marblesRaces.map((race) => [race.id, race]));
  const marblesGame = gamesById.get('marbles-on-stream');
  const marblesRaceChaptersById = new Map((marblesGame?.chapters || []).map((chapter) => [chapter.id, chapter]));

  function marblesPointsForEntry(entry) {
    if (!entry || entry.status !== 'Finished') return Number(rawMarblesScores?.scoring?.dnfPoints) || 0;
    const value = marblesPointValues[entry.order - 1];
    return Number.isFinite(value) ? value : 0;
  }

  function buildMarblesPlayerProfiles() {
    const players = new Map();

    marblesRaces.forEach((race) => {
      race.entries.forEach((entry) => {
        const current = players.get(entry.player) || {
          player: entry.player,
          points: 0,
          wins: 0,
          podiums: 0,
          appearances: 0,
          finishes: 0,
          bestFinish: null,
          races: []
        };

        const points = marblesPointsForEntry(entry);
        current.appearances += 1;
        current.points += points;
        if (entry.status === 'Finished') {
          current.finishes += 1;
          current.bestFinish = current.bestFinish === null ? entry.order : Math.min(current.bestFinish, entry.order);
          if (entry.order === 1) current.wins += 1;
          if (entry.order <= 3) current.podiums += 1;
        }
        current.races.push({ race, entry, points });
        players.set(entry.player, current);
      });
    });

    players.forEach((profile) => {
      profile.races.sort((a, b) => a.race.date.localeCompare(b.race.date) || a.race.raceNumber - b.race.raceNumber);
    });

    return players;
  }

  const marblesPlayerProfiles = buildMarblesPlayerProfiles();
  const marblesLeaderboard = [...marblesPlayerProfiles.values()]
    .sort((a, b) =>
      b.points - a.points ||
      b.wins - a.wins ||
      b.podiums - a.podiums ||
      a.player.localeCompare(b.player, undefined, { sensitivity: 'base' })
    )
    .slice(0, 10);

  const marblesPlayers = [...marblesPlayerProfiles.keys()]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  function specialPageId(entry) {
    return entry?.navId || (entry?.id === 'radio-respawn' ? 'radio-respawn' : 'nerd-poker');
  }

  function podcastForNavId(navId) {
    return podcasts.find((entry) => specialPageId(entry) === navId) || null;
  }

  if (!games.length) {
    showFatalError('No valid game entries were found in data.js.');
    return;
  }

  const state = {
    game: null,
    gameIndex: 0,
    chapter: null,
    chapterIndex: 0,
    segmentIndex: 0,
    player: null,
    playerReady: false,
    pendingLoadMode: null,
    isPlaying: false,
    segmentTransitioning: false,
    suppressEndedUntil: 0,
    endMonitorId: null,
    view: 'home',
    pageId: 'home',
    contentType: 'game',
    backroomsWatchContext: null,
    sidebarCollapsed: false,
    navOverlayOpen: false,
    sarkTvSlug: '',
    sarkTvClip: null,
    sarkTvPlaying: false,
    searchQuery: '',
    searchBaseResults: [],
    searchFiltersOpen: false,
    searchKinds: new Set(searchKindOptions.map((option) => option.id)),
    searchSources: new Set(searchSourceOptions.map((option) => option.id)),
    vodQuery: '',
    vodSelectedDate: '',
    vodCalendarYear: 0,
    vodCalendarMonth: 0,
    vodVisibleLimit: 60,
    vodCurrent: null,
    vodCopyIndex: 0,
    vodPlayer: null,
    vodPlayerReady: false,
    vodPendingPlay: false,
    vodIsPlaying: false,
    vodReturnState: null
  };

  const nerdPoker = {
    episodes: nerdPokerEpisodes,
    currentIndex: nerdPokerEpisodes.findIndex((episode) => episode.videoId),
    player: null,
    playerReady: false,
    started: false,
    durations: new Map()
  };

  if (nerdPoker.currentIndex < 0 && nerdPoker.episodes.length) nerdPoker.currentIndex = 0;

  const sarkRadio = {
    tracks: [],
    bag: [],
    current: null,
    currentIndex: -1,
    history: [],
    player: null,
    playerReady: false,
    started: false,
    loadingPromise: null,
    featured: null
  };

  function nerdPokerCurrentEpisode() {
    return nerdPoker.episodes[nerdPoker.currentIndex] || null;
  }

  function setNerdPokerPlayingUi(isPlaying) {
    if (!elements.nerdPokerPlay) return;
    elements.nerdPokerPlay.classList.toggle('is-playing', isPlaying);
    elements.nerdPokerPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    elements.nerdPokerPlayLabel.textContent = isPlaying ? 'Pause' : 'Play';
  }

  function showNerdPokerMessage(title, message) {
    if (!elements.nerdPokerPlaceholder) return;
    elements.nerdPokerPlaceholder.hidden = false;
    elements.nerdPokerPlaceholder.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  }

  function hideNerdPokerMessage() {
    if (elements.nerdPokerPlaceholder) elements.nerdPokerPlaceholder.hidden = true;
  }

  function nerdPokerRuntimeSeconds(index) {
    if (nerdPoker.durations.has(index)) return nerdPoker.durations.get(index);
    const runtime = nerdPoker.episodes[index]?.runtimeSeconds;
    return Number.isFinite(runtime) && runtime > 0 ? runtime : null;
  }

  function nerdPokerRuntimeLabel(index) {
    const runtime = nerdPokerRuntimeSeconds(index);
    if (!Number.isFinite(runtime) || runtime <= 0) return '—';
    const seconds = Math.max(0, Math.round(runtime));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return hours > 0
      ? [hours, minutes, remainder].map((value, partIndex) => partIndex === 0 ? String(value) : String(value).padStart(2, '0')).join(':')
      : `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  function updateNerdPokerDuration(index, seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    nerdPoker.durations.set(index, seconds);
    const cell = elements.nerdPokerEpisodeList?.querySelector(`[data-episode-index="${index}"] .nerd-poker-duration-cell`);
    if (cell) cell.textContent = nerdPokerRuntimeLabel(index);
    if (index === nerdPoker.currentIndex) {
      const episode = nerdPokerCurrentEpisode();
      elements.nerdPokerDockContext.textContent = episode
        ? `Episode ${String(episode.episodeNumber).padStart(2, '0')}  •  ${nerdPokerRuntimeLabel(index)}`
        : 'Nerd Poker';
    }
  }

  function nerdPokerPlayableIndexFrom(startIndex, direction) {
    let index = startIndex + direction;
    while (index >= 0 && index < nerdPoker.episodes.length) {
      if (nerdPoker.episodes[index]?.videoId) return index;
      index += direction;
    }
    return -1;
  }

  function updateNerdPokerActiveRow() {
    if (!elements.nerdPokerEpisodeList) return;
    elements.nerdPokerEpisodeList.querySelectorAll('.nerd-poker-episode-row').forEach((row) => {
      const isActive = Number(row.dataset.episodeIndex) === nerdPoker.currentIndex;
      row.classList.toggle('is-active', isActive);
      if (isActive) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
  }

  function paintNerdPokerEpisode() {
    const episode = nerdPokerCurrentEpisode();
    if (!episode) return;

    elements.nerdPokerTitle.textContent = episode.title;
    elements.nerdPokerDate.textContent = episode.date;
    elements.nerdPokerDate.hidden = !episode.date;
    elements.nerdPokerDescription.textContent = episode.description;
    elements.nerdPokerDescription.hidden = !episode.description;

    elements.nerdPokerDockTitle.textContent = episode.title;
    elements.nerdPokerDockMeta.textContent = `Episode ${String(episode.episodeNumber).padStart(2, '0')}${episode.date ? `  •  ${episode.date}` : ''}`;
    elements.nerdPokerDockContext.textContent = `Episode ${String(episode.episodeNumber).padStart(2, '0')}${nerdPokerRuntimeSeconds(nerdPoker.currentIndex) ? `  •  ${nerdPokerRuntimeLabel(nerdPoker.currentIndex)}` : ''}`;

    if (episode.thumbnail) {
      elements.nerdPokerDockArtwork.src = episode.thumbnail;
      elements.nerdPokerDockArtwork.alt = 'Nerd Poker artwork';
      elements.nerdPokerDockArtwork.hidden = false;
    } else {
      elements.nerdPokerDockArtwork.hidden = true;
    }

    elements.nerdPokerPrevious.disabled = nerdPokerPlayableIndexFrom(nerdPoker.currentIndex, -1) < 0;
    elements.nerdPokerNext.disabled = nerdPokerPlayableIndexFrom(nerdPoker.currentIndex, 1) < 0;
    updateNerdPokerActiveRow();
  }

  function playNerdPokerEpisodeAtIndex(index, shouldPlay = true) {
    if (!Number.isInteger(index) || index < 0 || index >= nerdPoker.episodes.length) return;
    const episode = nerdPoker.episodes[index];
    if (!episode?.videoId) return;

    nerdPoker.currentIndex = index;
    paintNerdPokerEpisode();
    hideNerdPokerMessage();

    const params = new URLSearchParams({ page: 'nerd-poker', episode: String(episode.episodeNumber) });
    history.replaceState(null, '', `#${params.toString()}`);

    if (!nerdPoker.playerReady || !nerdPoker.player) return;
    nerdPoker.started = nerdPoker.started || shouldPlay;
    if (shouldPlay) nerdPoker.player.loadVideoById(episode.videoId);
    else nerdPoker.player.cueVideoById(episode.videoId);
  }

  function stepNerdPokerEpisode(direction) {
    const nextIndex = nerdPokerPlayableIndexFrom(nerdPoker.currentIndex, direction);
    if (nextIndex < 0) return;
    nerdPoker.started = true;
    playNerdPokerEpisodeAtIndex(nextIndex, true);
  }

  function toggleNerdPokerPlayback() {
    if (!nerdPoker.playerReady || !nerdPoker.player) return;
    const episode = nerdPokerCurrentEpisode();
    if (!episode?.videoId) return;
    const playerState = nerdPoker.player.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) {
      nerdPoker.player.pauseVideo();
    } else {
      nerdPoker.started = true;
      nerdPoker.player.playVideo();
    }
  }

  function pauseNerdPoker() {
    if (nerdPoker.playerReady && nerdPoker.player) nerdPoker.player.pauseVideo();
    setNerdPokerPlayingUi(false);
  }

  function renderNerdPokerLibrary() {
    if (!elements.nerdPokerEpisodeList) return;
    const thumbnailFallback = String(rawPodcastLibrary?.thumbnail || '').trim();
    const fragment = document.createDocumentFragment();

    nerdPoker.episodes.forEach((episode, index) => {
      const row = document.createElement('tr');
      row.className = 'nerd-poker-episode-row';
      row.dataset.episodeIndex = String(index);
      row.dataset.episodeNumber = String(episode.episodeNumber);

      const isPlayable = Boolean(episode.videoId);
      if (isPlayable) {
        row.tabIndex = 0;
        row.setAttribute('aria-label', `Play Nerd Poker episode ${episode.episodeNumber}: ${episode.title}`);
      } else {
        row.classList.add('is-unavailable');
        row.setAttribute('aria-disabled', 'true');
        row.title = 'Episode source not yet mapped in this build.';
      }

      const numberCell = document.createElement('td');
      numberCell.className = 'nerd-poker-episode-number';
      numberCell.textContent = String(episode.episodeNumber).padStart(2, '0');

      const titleCell = document.createElement('td');
      const titleWrap = document.createElement('div');
      titleWrap.className = 'nerd-poker-list-title';
      const artwork = document.createElement('img');
      artwork.className = 'nerd-poker-list-artwork';
      artwork.alt = '';
      artwork.loading = 'lazy';
      artwork.decoding = 'async';
      artwork.src = episode.thumbnail || thumbnailFallback;
      artwork.addEventListener('error', () => artwork.classList.add('is-missing'), { once: true });
      const title = document.createElement('strong');
      title.textContent = episode.title;
      titleWrap.append(artwork, title);
      titleCell.append(titleWrap);

      const dateCell = document.createElement('td');
      dateCell.className = 'nerd-poker-date-cell';
      dateCell.textContent = episode.date || '—';

      const durationCell = document.createElement('td');
      durationCell.className = 'nerd-poker-duration-cell';
      durationCell.textContent = nerdPokerRuntimeLabel(index);

      row.append(numberCell, titleCell, dateCell, durationCell);

      if (isPlayable) {
        row.addEventListener('click', () => {
          nerdPoker.started = true;
          playNerdPokerEpisodeAtIndex(index, true);
          scrollPageToTop();
        });
        row.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          nerdPoker.started = true;
          playNerdPokerEpisodeAtIndex(index, true);
          scrollPageToTop();
        });
      }

      fragment.append(row);
    });

    elements.nerdPokerEpisodeList.replaceChildren(fragment);
    const playableCount = nerdPoker.episodes.filter((episode) => episode.videoId).length;
    elements.nerdPokerLibraryCount.textContent = `${nerdPoker.episodes.length} episodes${playableCount < nerdPoker.episodes.length ? `  •  ${playableCount} currently mapped` : ''}`;
    updateNerdPokerActiveRow();
  }

  function initNerdPokerPlayer() {
    if (
      nerdPoker.player ||
      !window.YT ||
      typeof window.YT.Player !== 'function' ||
      !elements.nerdPokerYoutube
    ) return;

    const episode = nerdPokerCurrentEpisode();
    if (!episode?.videoId) {
      showNerdPokerMessage('No mapped episode source.', 'Episode metadata is available, but no playable source is mapped yet.');
      return;
    }

    const playerVars = {
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      rel: 0
    };
    if (window.location.origin && window.location.origin !== 'null') playerVars.origin = window.location.origin;

    nerdPoker.player = new YT.Player('nerd-poker-youtube', {
      width: '480',
      height: '480',
      videoId: episode.videoId,
      playerVars,
      events: {
        onReady: () => {
          nerdPoker.playerReady = true;
          const iframe = nerdPoker.player.getIframe();
          if (iframe) iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          hideNerdPokerMessage();
          elements.nerdPokerPlay.disabled = false;
          paintNerdPokerEpisode();
          const duration = Number(nerdPoker.player.getDuration());
          updateNerdPokerDuration(nerdPoker.currentIndex, duration);
        },
        onStateChange: (event) => {
          setNerdPokerPlayingUi(event.data === YT.PlayerState.PLAYING);
          if ([YT.PlayerState.PLAYING, YT.PlayerState.PAUSED, YT.PlayerState.CUED].includes(event.data)) {
            const duration = Number(nerdPoker.player.getDuration());
            updateNerdPokerDuration(nerdPoker.currentIndex, duration);
          }
          if (event.data === YT.PlayerState.ENDED) {
            const nextIndex = nerdPokerPlayableIndexFrom(nerdPoker.currentIndex, 1);
            if (nextIndex >= 0) playNerdPokerEpisodeAtIndex(nextIndex, true);
          }
        },
        onError: (event) => {
          const messages = {
            2: 'The source video ID is invalid.',
            5: 'The browser could not play this episode.',
            100: 'The source video is unavailable or private.',
            101: 'The uploader has disabled playback on other websites.',
            150: 'The uploader has disabled playback on other websites.',
            153: 'YouTube did not receive the referring site identity. Open The Sarkive through https://thesarkive.com/ instead of a local file copy.'
          };
          showNerdPokerMessage('YouTube could not load this episode.', messages[event.data] || `YouTube returned player error ${event.data}.`);
          setNerdPokerPlayingUi(false);
        }
      }
    });
  }

  function setSarkRadioPlayingUi(isPlaying) {
    if (!elements.sarkRadioPlay) return;
    elements.sarkRadioPlay.classList.toggle('is-playing', isPlaying);
    elements.sarkRadioPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    elements.sarkRadioPlayLabel.textContent = isPlaying ? 'Pause' : 'Play';
  }

  function showSarkRadioMessage(title, message) {
    if (!elements.sarkRadioPlaceholder) return;
    elements.sarkRadioPlaceholder.hidden = false;
    elements.sarkRadioPlaceholder.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  }

  function hideSarkRadioMessage() {
    if (elements.sarkRadioPlaceholder) elements.sarkRadioPlaceholder.hidden = true;
  }

  function refillSarkRadioBag() {
    sarkRadio.bag = sarkRadio.tracks.map((_, index) => index);
    for (let i = sarkRadio.bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [sarkRadio.bag[i], sarkRadio.bag[j]] = [sarkRadio.bag[j], sarkRadio.bag[i]];
    }
  }

  function sarkRadioStreamLabel(track) {
    const streamCount = Number(track?.streamCount) || 0;
    return `${streamCount.toLocaleString()} stream${streamCount === 1 ? '' : 's'}`;
  }

  function updateSarkRadioActiveRow() {
    if (!elements.sarkRadioTrackList) return;
    elements.sarkRadioTrackList.querySelectorAll('.sark-radio-track-row').forEach((row) => {
      const isActive = Number(row.dataset.trackIndex) === sarkRadio.currentIndex;
      row.classList.toggle('is-active', isActive);
      row.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function paintSarkRadioTrack() {
    const track = sarkRadio.current;
    if (!track) return;

    const title = track.song || track.title || 'Unknown track';
    const meta = [track.artist, track.album].filter(Boolean).join('  •  ');

    elements.sarkRadioTrackTitle.textContent = title;
    elements.sarkRadioTrackMeta.textContent = meta;
    elements.sarkRadioDockTitle.textContent = title;
    elements.sarkRadioDockMeta.textContent = track.artist || 'Karl Casey';
    elements.sarkRadioDockContext.textContent = `Played on ${sarkRadioStreamLabel(track)}`;

    if (track.artwork) {
      elements.sarkRadioDockArtwork.src = track.artwork;
      elements.sarkRadioDockArtwork.alt = `${track.album || title} artwork`;
      elements.sarkRadioDockArtwork.hidden = false;
    } else {
      elements.sarkRadioDockArtwork.removeAttribute('src');
      elements.sarkRadioDockArtwork.alt = '';
      elements.sarkRadioDockArtwork.hidden = true;
    }

    const featuredList = Array.isArray(track.featuredOn) ? track.featuredOn : [];
    sarkRadio.featured = featuredList.length
      ? featuredList[Math.floor(Math.random() * featuredList.length)]
      : null;

    if (sarkRadio.featured) {
      elements.sarkRadioFeaturedLink.textContent = sarkRadio.featured.title || sarkRadio.featured.videoId || 'Archived stream';
      elements.sarkRadioFeaturedLink.href = sarkRadio.featured.url || `https://www.youtube.com/watch?v=${encodeURIComponent(sarkRadio.featured.videoId || '')}`;
      elements.sarkRadioFeaturedLink.hidden = false;
    } else {
      elements.sarkRadioFeaturedLink.textContent = 'Archive occurrence unavailable';
      elements.sarkRadioFeaturedLink.removeAttribute('href');
      elements.sarkRadioFeaturedLink.hidden = false;
    }

    const streamCount = Number(track.streamCount) || 0;
    const occurrenceCount = Number(track.occurrenceCount) || streamCount;
    const streamText = `${streamCount.toLocaleString()} archived stream${streamCount === 1 ? '' : 's'}`;
    const detectionText = occurrenceCount === streamCount
      ? streamText
      : `${streamText}  •  ${occurrenceCount.toLocaleString()} YouTube detection${occurrenceCount === 1 ? '' : 's'}`;
    elements.sarkRadioDetectionCount.textContent = `Detected on ${detectionText}.`;

    elements.sarkRadioPrevious.disabled = sarkRadio.history.length === 0;
    updateSarkRadioActiveRow();
  }

  function playSarkRadioTrackAtIndex(index, shouldPlay = true, recordHistory = true) {
    if (!Number.isInteger(index) || index < 0 || index >= sarkRadio.tracks.length) return;

    if (index === sarkRadio.currentIndex) {
      if (shouldPlay && sarkRadio.playerReady && sarkRadio.player) {
        sarkRadio.started = true;
        sarkRadio.player.playVideo();
      }
      return;
    }

    if (recordHistory && sarkRadio.currentIndex >= 0) {
      sarkRadio.history.push(sarkRadio.currentIndex);
      if (sarkRadio.history.length > 500) sarkRadio.history.shift();
    }

    const bagIndex = sarkRadio.bag.indexOf(index);
    if (bagIndex >= 0) sarkRadio.bag.splice(bagIndex, 1);

    sarkRadio.currentIndex = index;
    sarkRadio.current = sarkRadio.tracks[index];
    paintSarkRadioTrack();

    if (sarkRadio.playerReady && sarkRadio.player && sarkRadio.current?.videoId) {
      if (shouldPlay || sarkRadio.started) {
        sarkRadio.started = true;
        sarkRadio.player.loadVideoById(sarkRadio.current.videoId);
      } else {
        sarkRadio.player.cueVideoById(sarkRadio.current.videoId);
      }
    }
  }

  function selectNextSarkRadioTrack(shouldPlay = false) {
    if (!sarkRadio.tracks.length) return;
    if (!sarkRadio.bag.length) refillSarkRadioBag();

    let index = sarkRadio.bag.pop();
    if (
      sarkRadio.currentIndex >= 0 &&
      sarkRadio.tracks.length > 1 &&
      index === sarkRadio.currentIndex
    ) {
      if (!sarkRadio.bag.length) refillSarkRadioBag();
      index = sarkRadio.bag.pop();
    }

    playSarkRadioTrackAtIndex(index, shouldPlay, true);
  }

  function selectPreviousSarkRadioTrack() {
    if (!sarkRadio.history.length) return;
    const previousIndex = sarkRadio.history.pop();
    playSarkRadioTrackAtIndex(previousIndex, true, false);
    elements.sarkRadioPrevious.disabled = sarkRadio.history.length === 0;
  }

  function renderSarkRadioLibrary() {
    if (!elements.sarkRadioTrackList) return;
    elements.sarkRadioTrackList.replaceChildren();

    const fragment = document.createDocumentFragment();
    sarkRadio.tracks.forEach((track, index) => {
      const title = track.song || track.title || 'Unknown track';
      const artist = track.artist || 'Karl Casey';
      const album = track.album || '—';

      const row = document.createElement('tr');
      row.className = 'sark-radio-track-row';
      row.dataset.trackIndex = String(index);
      row.dataset.videoId = track.videoId;
      row.tabIndex = 0;
      row.setAttribute('aria-label', `Play ${title} by ${artist}`);

      const numberCell = document.createElement('td');
      numberCell.className = 'sark-radio-track-number';
      numberCell.textContent = String(index + 1);

      const titleCell = document.createElement('td');
      const titleWrap = document.createElement('div');
      titleWrap.className = 'sark-radio-list-title';

      const artwork = document.createElement('img');
      artwork.className = 'sark-radio-list-artwork';
      artwork.alt = '';
      artwork.loading = 'lazy';
      artwork.decoding = 'async';
      if (track.artwork) artwork.src = track.artwork;
      artwork.addEventListener('error', () => artwork.classList.add('is-missing'), { once: true });

      const copy = document.createElement('div');
      copy.className = 'sark-radio-list-copy';
      const name = document.createElement('strong');
      name.textContent = title;
      const byline = document.createElement('span');
      byline.textContent = artist;
      copy.append(name, byline);
      titleWrap.append(artwork, copy);
      titleCell.append(titleWrap);

      const albumCell = document.createElement('td');
      albumCell.className = 'sark-radio-album-cell';
      albumCell.textContent = album;

      const streamsCell = document.createElement('td');
      streamsCell.className = 'sark-radio-stream-cell';
      streamsCell.textContent = sarkRadioStreamLabel(track);

      row.append(numberCell, titleCell, albumCell, streamsCell);
      row.addEventListener('click', () => {
        sarkRadio.started = true;
        playSarkRadioTrackAtIndex(index, true, true);
      });
      row.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        sarkRadio.started = true;
        playSarkRadioTrackAtIndex(index, true, true);
      });
      fragment.append(row);
    });

    elements.sarkRadioTrackList.append(fragment);
    updateSarkRadioActiveRow();
  }

  function initSarkRadioPlayer() {
    if (
      sarkRadio.player ||
      !sarkRadio.current?.videoId ||
      !window.YT ||
      typeof window.YT.Player !== 'function' ||
      !elements.sarkRadioYoutube
    ) return;

    const playerVars = {
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      rel: 0
    };

    if (window.location.origin && window.location.origin !== 'null') {
      playerVars.origin = window.location.origin;
    }

    sarkRadio.player = new YT.Player('sark-radio-youtube', {
      width: '480',
      height: '480',
      videoId: sarkRadio.current.videoId,
      playerVars,
      events: {
        onReady: () => {
          sarkRadio.playerReady = true;
          const iframe = sarkRadio.player.getIframe();
          if (iframe) iframe.referrerPolicy = 'strict-origin-when-cross-origin';
          hideSarkRadioMessage();
          elements.sarkRadioPlay.disabled = false;
          elements.sarkRadioNext.disabled = false;
        },
        onStateChange: (event) => {
          setSarkRadioPlayingUi(event.data === YT.PlayerState.PLAYING);
          if (event.data === YT.PlayerState.ENDED) selectNextSarkRadioTrack(true);
        },
        onError: () => {
          showSarkRadioMessage('Skipping unavailable track…', 'YouTube would not embed this release. Moving to another Sark-used White Bat track.');
          window.setTimeout(() => {
            hideSarkRadioMessage();
            selectNextSarkRadioTrack(sarkRadio.started);
          }, 650);
        }
      }
    });
  }

  function ensureSarkRadioData() {
    if (sarkRadio.tracks.length) {
      initSarkRadioPlayer();
      return Promise.resolve(sarkRadio.tracks);
    }
    if (sarkRadio.loadingPromise) return sarkRadio.loadingPromise;

    if (!isHttpPage) {
      showSarkRadioMessage(
        'Sark Radio needs the site to be served over HTTP.',
        'Open Sark Radio through https://thesarkive.com/ instead of a local file copy.'
      );
      return Promise.resolve([]);
    }

    sarkRadio.loadingPromise = fetch('sark-radio-data.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        sarkRadio.tracks = (Array.isArray(data?.tracks) ? data.tracks : [])
          .filter((track) => track && String(track.videoId || '').trim());

        if (!sarkRadio.tracks.length) throw new Error('No playable tracks were found in sark-radio-data.json.');

        elements.sarkRadioLibraryCount.textContent = `${sarkRadio.tracks.length.toLocaleString()} SARK-USED TRACKS`;
        renderSarkRadioLibrary();
        refillSarkRadioBag();
        selectNextSarkRadioTrack(false);
        initSarkRadioPlayer();
        return sarkRadio.tracks;
      })
      .catch((error) => {
        console.error('Sark Radio data load failed:', error);
        elements.sarkRadioLibraryCount.textContent = 'LIBRARY UNAVAILABLE';
        showSarkRadioMessage('Could not load Sark Radio.', 'Check sark-radio-data.json and reload the page.');
        return [];
      });

    return sarkRadio.loadingPromise;
  }

  function pauseSarkRadio() {
    if (sarkRadio.playerReady && sarkRadio.player) sarkRadio.player.pauseVideo();
    setSarkRadioPlayingUi(false);
  }

  function toggleSarkRadioPlayback() {
    if (!sarkRadio.playerReady || !sarkRadio.player || !sarkRadio.current) return;
    const playerState = sarkRadio.player.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) {
      sarkRadio.player.pauseVideo();
      return;
    }

    sarkRadio.started = true;
    if (playerState === YT.PlayerState.CUED || playerState === YT.PlayerState.PAUSED) {
      sarkRadio.player.playVideo();
    } else {
      sarkRadio.player.loadVideoById(sarkRadio.current.videoId);
    }
  }

  const drawerNavQuery = window.matchMedia('(max-width: 860px)');
  const railNavQuery = window.matchMedia('(min-width: 861px) and (max-width: 1180px)');

  function usesDrawerNavigation() {
    return state.view === 'watch' || state.view === 'vod-watch' || drawerNavQuery.matches || railNavQuery.matches;
  }

  function syncNavigationShell() {
    const watchMode = state.view === 'watch' || state.view === 'vod-watch';
    const railMode = !watchMode && railNavQuery.matches;
    const drawerMode = usesDrawerNavigation();
    const drawerOpen = drawerMode && state.navOverlayOpen;

    elements.body.classList.toggle('watch-mode', watchMode);
    elements.body.classList.toggle('nav-rail-mode', railMode);
    elements.body.classList.toggle('sidebar-collapsed', !drawerMode && state.sidebarCollapsed);
    elements.body.classList.toggle('nav-overlay-open', drawerOpen);
    elements.navScrim.hidden = !drawerOpen;

    const navigationExpanded = drawerMode ? drawerOpen : !state.sidebarCollapsed;
    elements.menuToggle.setAttribute('aria-expanded', String(navigationExpanded));
    elements.menuToggle.setAttribute(
      'aria-label',
      drawerMode
        ? (drawerOpen ? 'Close navigation' : 'Open navigation')
        : (state.sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation')
    );
  }

  function closeNavigationOverlay() {
    if (!state.navOverlayOpen) return;
    state.navOverlayOpen = false;
    syncNavigationShell();
  }

  function currentSegment() {
    return state.chapter?.segments[state.segmentIndex] || null;
  }

  function segmentWatchUrl(segment) {
    if (!segment) return '';
    if (segment.sourceType === 'archive' && segment.archiveId) {
      return `https://archive.org/details/${encodeURIComponent(segment.archiveId)}`;
    }
    if (segment.sourceType === 'external') return segment.sourceUrl || segment.g4Url || '';
    return `https://www.youtube.com/watch?v=${encodeURIComponent(segment.videoId)}&t=${Math.floor(segment.startSeconds)}s`;
  }

  function chapterRuntimeSeconds(chapter) {
    if (Number.isFinite(chapter.runtimeSeconds)) return chapter.runtimeSeconds;
    if (chapter.segments.some((segment) => !Number.isFinite(segment.endSeconds))) return null;
    return chapter.segments.reduce((total, segment) => total + (segment.endSeconds - segment.startSeconds), 0);
  }

  function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return [hours, minutes, remainder].map((value) => String(value).padStart(2, '0')).join(':');
  }

  function showPlayerMessage(title, message, linkUrl = '') {
    const link = linkUrl
      ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">Open source</a>`
      : '';

    elements.playerPlaceholder.classList.remove('hidden');
    elements.playerPlaceholder.innerHTML = `<strong>${title}</strong><span>${message}</span>${link}`;
  }

  function hidePlayerMessage() {
    elements.playerPlaceholder.classList.add('hidden');
  }

  function routeFromUrl() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const searchQuery = String(params.get('search') || '').trim();
    if (searchQuery) return { view: 'search', query: searchQuery };

    const tag = gameTagsByKey.get(normalizedSearchText(params.get('tag')));
    if (tag) return { view: 'tag', tag };

    const category = discoveryCategoriesById.get(params.get('category'));
    if (category) return { view: 'category', category };

    const podcast = podcastsById.get(params.get('podcast'));
    if (podcast) {
      const wantsPlayer = params.get('watch') === '1' || params.has('chapter') || params.has('segment');

      if (!wantsPlayer) {
        return { view: 'podcast-detail', entry: podcast, contentType: 'podcast' };
      }

      const chapter = podcast.chapters.find((entry) => entry.id === params.get('chapter')) || podcast.chapters[0];
      const requestedSegment = Number.parseInt(params.get('segment'), 10);

      return {
        view: 'watch',
        entry: podcast,
        contentType: 'podcast',
        chapter,
        segmentIndex: Number.isInteger(requestedSegment) ? requestedSegment : 0
      };
    }

    const game = gamesById.get(params.get('game'));
    if (game) {
      const wantsPlayer = params.get('watch') === '1' || params.has('chapter') || params.has('segment');

      if (!wantsPlayer) {
        return { view: 'game-detail', entry: game, contentType: 'game' };
      }

      const chapter = game.chapters.find((entry) => entry.id === params.get('chapter')) || game.chapters[0];
      const requestedSegment = Number.parseInt(params.get('segment'), 10);

      return {
        view: 'watch',
        entry: game,
        contentType: 'game',
        chapter,
        segmentIndex: Number.isInteger(requestedSegment) ? requestedSegment : 0
      };
    }

    const requestedVod = vodIndexById.get(String(params.get('vod') || '').trim());
    if (requestedVod) {
      return {
        view: 'vod-watch',
        vod: requestedVod,
        copyId: String(params.get('copy') || '').trim()
      };
    }

    const pageId = String(params.get('page') || '').trim();
    if (pageId === 'backrooms-watch') {
      const payload = window.SARKIVE_BACKROOMS_UI?.watchPayload?.(
        String(params.get('game') || '').trim(),
        String(params.get('appearance') || '').trim()
      );
      if (payload) return { view: 'backrooms-watch', payload };
    }
    if (pageId === 'nerd-poker') return { view: 'nerd-poker' };
    if (['radio-respawn', 'respawn-inbox', 'x-play'].includes(pageId)) {
      const specialEntry = podcastForNavId(pageId);
      if (specialEntry) return { view: 'podcast-detail', entry: specialEntry, contentType: 'podcast' };
    }
    if (pageId === 'games' || params.has('games')) {
      return { view: 'category', category: discoveryCategoriesById.get('all-games') };
    }
    if (pageId === 'home' || params.has('home')) return { view: 'home' };
    if (pageId === 'links') return { view: 'about', page: navItemsById.get('about') };

    const page = navItemsById.get(pageId);
    if (page?.id === 'marbles-scores') return { view: 'marbles-scores', page };
    if (page?.id === 'sark-tv') return { view: 'sark-tv', page };
    if (page?.id === 'sark-radio') return { view: 'sark-radio', page };
    if (page?.id === 'vod-index') return { view: 'vod-index', page, date: String(params.get('date') || '').trim() };
    if (page?.id === 'backrooms') return { view: 'backrooms', page, date: String(params.get('date') || '').trim(), query: String(params.get('q') || '').trim(), index: params.get('index') === '1' };
    if (page?.id === 'categories') return { view: 'categories', page };
    if (page?.id === 'shop') return { view: 'shop', page };
    if (page?.id === 'sark-links') return { view: 'sark-links', page };
    if (page?.id === 'pals') return { view: 'pals', page };
    if (page?.id === 'about') return { view: 'about', page };
    if (page && page.id !== 'home') return { view: 'coming-soon', page };

    return { view: 'home' };
  }

  function updateUrl() {
    if (!state.game || !state.chapter) return;

    if (state.contentType === 'backrooms' && state.backroomsWatchContext) {
      const params = new URLSearchParams({
        page: 'backrooms-watch',
        game: state.backroomsWatchContext.gameId
      });
      if (state.backroomsWatchContext.appearanceId) {
        params.set('appearance', state.backroomsWatchContext.appearanceId);
      }
      history.replaceState(null, '', `#${params.toString()}`);
      return;
    }

    const entryKey = state.contentType === 'podcast' ? 'podcast' : 'game';
    const params = new URLSearchParams({
      [entryKey]: state.game.id,
      watch: '1',
      chapter: state.chapter.id,
      segment: String(state.segmentIndex)
    });

    history.replaceState(null, '', `#${params.toString()}`);
  }

  function setPlayingUi(isPlaying) {
    state.isPlaying = isPlaying;
    elements.playPause.classList.toggle('is-playing', isPlaying);
    elements.playPauseLabel.textContent = isPlaying ? 'Pause' : 'Play';
  }

  function navIcon(name) {
    const icons = {
      home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/>',
      search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
      games: '<path d="M7.5 8.5h9a5 5 0 0 1 4.7 6.7l-.5 1.4a2.4 2.4 0 0 1-4.1.7L15 15.5H9l-1.6 1.8a2.4 2.4 0 0 1-4.1-.7l-.5-1.4a5 5 0 0 1 4.7-6.7Z"/><path d="M7.5 11.5v3M6 13h3M15.5 12.5h.01M18 14.5h.01"/>',
      inbox: '<path d="M3.5 6.5h17v11h-17z"/><path d="m4 7 8 6 8-6"/>',
      'respawn-inbox': '<path d="M5 8.5h14v9H5z"/><path d="m5.5 9 6.5 4.5L18.5 9"/><path d="M8 5H4v4"/><path d="M4.5 8A8 8 0 0 1 18 5.5"/>',
      'radio-respawn': '<path d="M5 10.5h14v9H5z"/><path d="M8 14h5M8 17h3"/><circle cx="16" cy="15" r="1.8"/><path d="m7 10.5 9-5"/><path d="M18.5 4.5a4 4 0 0 1 0 5M21 2a7.5 7.5 0 0 1 0 10"/>',
      'nerd-poker': '<rect x="5" y="4" width="10" height="14" rx="1.5"/><path d="m10 8 2 2-2 2-2-2z"/><path d="M14 7.5h4.5v12H9v-1.5"/>',
      'x-play': '<path d="M5 6h7l-5 7h7M14 9v9M18 6v12"/>',
      'stream-tracker': '<path d="M3 12h4l2.2-5 4.2 10 2.2-5H21"/><path d="M4 4v16h16"/>',
      'marbles-scores': '<path d="M5 19V9h4v10M10 19V5h4v14M15 19v-7h4v7"/><path d="M3 19h18"/><circle cx="7" cy="6" r="2"/><circle cx="17" cy="8" r="2"/>',
      'sark-tv': '<rect x="3.5" y="5.5" width="17" height="12" rx="1.5"/><path d="m9 21 3-3 3 3M8.5 10l6 3-6 3z"/>',
      'sark-radio': '<rect x="3.5" y="7" width="17" height="12" rx="1.5"/><path d="m6 7 11-4M7 11h5M7 14h3"/><circle cx="16" cy="13" r="2.3"/>',
      'vod-index': '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M7 2.5v4M17 2.5v4M3.5 9h17M7 13h3M7 16h5"/><path d="m15 12 4 2.5-4 2.5z"/>',
      backrooms: '<path d="M4 5.5h16v13H4z"/><path d="M8 5.5v13M16 5.5v13M4 10h4M16 14h4"/><path d="M10.5 8.5h3v7h-3z"/>',
      categories: '<path d="M4 6h5M4 12h5M4 18h5M12 6h8M12 12h8M12 18h8"/>',
      shop: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      about: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>',
      links: '<path d="m9.5 14.5-1.8 1.8a3.2 3.2 0 0 1-4.5-4.5l3-3a3.2 3.2 0 0 1 4.5 0"/><path d="m14.5 9.5 1.8-1.8a3.2 3.2 0 0 1 4.5 4.5l-3 3a3.2 3.2 0 0 1-4.5 0"/><path d="m8.5 15.5 7-7"/>',
      pals: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M13 20a4.2 4.2 0 0 1 8 0"/>'
    };

    return `<svg aria-hidden="true" viewBox="0 0 24 24">${icons[name] || icons.links}</svg>`;
  }

  let sarkTvDeck = [];
  let sarkTvDeckIndex = 0;
  let sarkTvNextPrepared = null;
  let sarkTvPrepareSerial = 0;
  let sarkTvSwitching = false;

  function shuffleSarkTvDeck() {
    sarkTvDeck = [...sarkTvClips];
    for (let index = sarkTvDeck.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [sarkTvDeck[index], sarkTvDeck[swapIndex]] = [sarkTvDeck[swapIndex], sarkTvDeck[index]];
    }

    if (state.sarkTvSlug && sarkTvDeck.length > 1 && sarkTvDeck[0] === state.sarkTvSlug) {
      [sarkTvDeck[0], sarkTvDeck[1]] = [sarkTvDeck[1], sarkTvDeck[0]];
    }
    sarkTvDeckIndex = 0;
  }

  function nextSarkTvSlug() {
    if (!sarkTvClips.length) return '';
    if (!sarkTvDeck.length || sarkTvDeckIndex >= sarkTvDeck.length) shuffleSarkTvDeck();
    return sarkTvDeck[sarkTvDeckIndex++] || '';
  }

  function setSarkTvPlayingUi(isPlaying) {
    state.sarkTvPlaying = isPlaying;
    elements.sarkTvPlayPause?.classList.toggle('is-playing', isPlaying);
    if (elements.sarkTvPlayPauseLabel) {
      elements.sarkTvPlayPauseLabel.textContent = isPlaying ? 'Pause' : 'Play';
    }
  }

  function setSarkTvPlaceholder(title, message) {
    if (!elements.sarkTvPlaceholder) return;
    elements.sarkTvPlaceholder.hidden = false;
    elements.sarkTvPlaceholder.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  }

  async function resolveSarkTvClip(slug) {
    const response = await fetch(`/api/twitch-clip?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      let message = `Twitch clip lookup failed (${response.status}).`;
      try {
        const error = await response.json();
        if (error?.error) message = error.error;
      } catch (_) {
        // Keep the HTTP status message.
      }
      throw new Error(message);
    }
    const clip = await response.json();
    if (!clip?.mediaUrl) throw new Error('Twitch returned no playable media URL.');
    return clip;
  }

  async function resolveNextPlayableSarkTvClip(preferredSlug = '') {
    const maxAttempts = Math.min(Math.max(sarkTvClips.length, 1), 20);
    let slug = preferredSlug;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (!slug) slug = nextSarkTvSlug();
      if (!slug) return null;
      try {
        return await resolveSarkTvClip(slug);
      } catch (error) {
        console.warn(`Skipping unavailable SarkTV clip ${slug}:`, error);
        slug = '';
      }
    }
    return null;
  }

  function installSarkTvClip(clip) {
    if (!clip || !elements.sarkTvPlayer) return false;

    const player = elements.sarkTvPlayer;
    sarkTvSwitching = true;
    player.pause();
    state.sarkTvSlug = clip.slug;
    state.sarkTvClip = clip;
    player.src = clip.mediaUrl;
    player.poster = clip.thumbnailUrl || '';
    player.muted = false;
    player.volume = 1;
    player.hidden = false;
    player.load();
    elements.sarkTvPlaceholder.hidden = true;
    elements.sarkTvStatus.textContent = 'READY';
    elements.sarkTvCount.textContent = `${sarkTvClips.length.toLocaleString()} clips in rotation`;
    elements.sarkTvPlayPause.disabled = false;
    sarkTvSwitching = false;
    setSarkTvPlayingUi(false);
    return true;
  }

  async function prepareSarkTvNext() {
    if (!sarkTvClips.length) return null;
    elements.sarkTvNext.disabled = true;
    const clip = await resolveNextPlayableSarkTvClip();
    sarkTvNextPrepared = clip;
    elements.sarkTvNext.disabled = !clip;
    return clip;
  }

  async function prepareInitialSarkTvClip() {
    if (!sarkTvClips.length) {
      setSarkTvPlaceholder('No clips loaded.', 'Add clip slugs to sark-tv-data.js.');
      elements.sarkTvPlayPause.disabled = true;
      elements.sarkTvNext.disabled = true;
      return;
    }

    if (!isHttpPage) {
      setSarkTvPlaceholder('SarkTV needs the live site.', 'Open The Sarkive through its web address instead of opening index.html directly.');
      elements.sarkTvPlayPause.disabled = true;
      elements.sarkTvNext.disabled = true;
      return;
    }

    if (state.sarkTvClip?.mediaUrl) {
      elements.sarkTvPlayPause.disabled = false;
      if (!sarkTvNextPrepared) prepareSarkTvNext();
      return;
    }

    const serial = ++sarkTvPrepareSerial;
    elements.sarkTvPlayPause.disabled = true;
    elements.sarkTvNext.disabled = true;
    elements.sarkTvStatus.textContent = 'TUNING IN';
    setSarkTvPlaceholder('SARK TV', 'Tuning in…');

    const clip = await resolveNextPlayableSarkTvClip();
    if (serial !== sarkTvPrepareSerial) return;

    if (!clip) {
      elements.sarkTvStatus.textContent = 'OFF AIR';
      setSarkTvPlaceholder('No playable clips found.', 'Twitch did not return media for the clips checked.');
      return;
    }

    installSarkTvClip(clip);
    prepareSarkTvNext();
  }

  function playCurrentSarkTvClip() {
    const player = elements.sarkTvPlayer;
    if (!player || !state.sarkTvClip?.mediaUrl) return;

    // This runs directly from the site PLAY click. Keeping the media element
    // unmuted here avoids Twitch's muted-autoplay fallback.
    player.muted = false;
    if (player.volume === 0) player.volume = 1;
    const playPromise = player.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.warn('SarkTV playback was blocked:', error);
        setSarkTvPlayingUi(false);
        elements.sarkTvStatus.textContent = 'PRESS PLAY';
      });
    }
  }

  function toggleSarkTvPlayback() {
    const player = elements.sarkTvPlayer;
    if (!player) return;

    if (state.sarkTvPlaying && !player.paused) {
      player.pause();
      return;
    }

    if (!state.sarkTvClip?.mediaUrl) {
      prepareInitialSarkTvClip();
      return;
    }

    playCurrentSarkTvClip();
  }

  function switchToPreparedSarkTvClip(shouldPlay) {
    const clip = sarkTvNextPrepared;
    if (!clip) return false;

    sarkTvNextPrepared = null;
    installSarkTvClip(clip);
    prepareSarkTvNext();
    if (shouldPlay) playCurrentSarkTvClip();
    return true;
  }

  async function stepSarkTv() {
    const shouldPlay = state.sarkTvPlaying || !elements.sarkTvPlayer?.paused;
    if (switchToPreparedSarkTvClip(shouldPlay)) return;

    elements.sarkTvStatus.textContent = 'TUNING IN';
    elements.sarkTvNext.disabled = true;
    const clip = await resolveNextPlayableSarkTvClip();
    if (!clip) {
      elements.sarkTvStatus.textContent = 'OFF AIR';
      return;
    }

    installSarkTvClip(clip);
    prepareSarkTvNext();
    if (shouldPlay) playCurrentSarkTvClip();
  }

  function advanceSarkTvAfterEnd() {
    if (switchToPreparedSarkTvClip(true)) return;

    elements.sarkTvStatus.textContent = 'TUNING IN';
    resolveNextPlayableSarkTvClip().then((clip) => {
      if (!clip) {
        setSarkTvPlayingUi(false);
        elements.sarkTvStatus.textContent = 'OFF AIR';
        return;
      }
      installSarkTvClip(clip);
      prepareSarkTvNext();
      playCurrentSarkTvClip();
    });
  }

  function pauseSarkTvForPageChange() {
    if (!elements.sarkTvPlayer) return;
    elements.sarkTvPlayer.pause();
    setSarkTvPlayingUi(false);
  }

  function pausePlayerForPageChange() {
    state.pendingLoadMode = null;

    if (state.sarkTvPlaying) pauseSarkTvForPageChange();
    state.segmentTransitioning = false;

    if (state.playerReady && state.player) {
      state.player.pauseVideo();
    }
    if (elements.archivePlayer) {
      elements.archivePlayer.src = 'about:blank';
      elements.archivePlayer.hidden = true;
    }
    if (elements.youtubePlayerShell) elements.youtubePlayerShell.hidden = false;
    if (state.vodPlayerReady && state.vodPlayer) {
      state.vodPlayer.pauseVideo();
    }
    setVodPlayingUi(false);
    if (elements.backroomsPage) elements.backroomsPage.hidden = true;
    window.SARKIVE_BACKROOMS_UI?.hide();

    pauseSarkRadio();
    pauseNerdPoker();
    setPlayingUi(false);
  }


  function marblesRaceLabel(race) {
    return `${race.date} · Race ${String(race.raceNumber).padStart(2, '0')}`;
  }

  function clearMarblesPlayerSearchResults() {
    if (!elements.marblesPlayerSearchResults) return;
    elements.marblesPlayerSearchResults.replaceChildren();
    elements.marblesPlayerSearchResults.hidden = true;
  }

  function marblesPlayerMatches(rawQuery) {
    const query = String(rawQuery || '').trim().toLocaleLowerCase();
    if (!query) return [];

    return marblesPlayers
      .map((player) => {
        const normalized = player.toLocaleLowerCase();
        const index = normalized.indexOf(query);
        if (index < 0) return null;
        return { player, score: normalized === query ? 0 : index === 0 ? 1 : 2 };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score || a.player.localeCompare(b.player, undefined, { sensitivity: 'base' }))
      .map((match) => match.player);
  }

  function showMarblesPlayerSearchResults(rawQuery) {
    if (!elements.marblesPlayerSearchResults) return [];
    const query = String(rawQuery || '').trim();
    if (!query) {
      clearMarblesPlayerSearchResults();
      return [];
    }

    const matches = marblesPlayerMatches(query);
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'marbles-player-search-empty';
      empty.textContent = 'NO PLAYER FOUND';
      elements.marblesPlayerSearchResults.replaceChildren(empty);
      elements.marblesPlayerSearchResults.hidden = false;
      return matches;
    }

    const buttons = matches.slice(0, 8).map((player) => {
      const profile = marblesPlayerProfiles.get(player);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'marbles-player-search-result';
      button.setAttribute('role', 'option');

      const name = document.createElement('span');
      name.className = 'marbles-player-search-name';
      name.textContent = player;

      const meta = document.createElement('span');
      meta.className = 'marbles-player-search-meta';
      meta.textContent = `${profile?.appearances || 0} results · ${profile?.points || 0} pts`;

      button.append(name, meta);
      button.addEventListener('click', () => {
        elements.marblesPlayerSearchInput.value = player;
        clearMarblesPlayerSearchResults();
        renderMarblesPlayer(player);
      });
      return button;
    });

    elements.marblesPlayerSearchResults.replaceChildren(...buttons);
    elements.marblesPlayerSearchResults.hidden = false;
    return matches;
  }

  function submitMarblesPlayerSearch() {
    const query = elements.marblesPlayerSearchInput?.value || '';
    const matches = marblesPlayerMatches(query);
    if (!matches.length) {
      showMarblesPlayerSearchResults(query);
      return;
    }

    const exact = matches.find((player) => player.localeCompare(query.trim(), undefined, { sensitivity: 'base' }) === 0);
    if (exact || matches.length === 1) {
      const player = exact || matches[0];
      elements.marblesPlayerSearchInput.value = player;
      clearMarblesPlayerSearchResults();
      renderMarblesPlayer(player);
      return;
    }

    showMarblesPlayerSearchResults(query);
  }

  function populateMarblesRaceSelect() {
    if (!elements.marblesRaceSelect) return;

    const currentValue = elements.marblesRaceSelect.value || 'top-ten';
    const topOption = document.createElement('option');
    topOption.value = 'top-ten';
    topOption.textContent = 'TOP TEN — ALL RACES';

    const byYear = new Map();
    marblesRaces.forEach((race) => {
      const year = race.date.slice(0, 4) || 'Other';
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(race);
    });

    const groups = [...byYear.entries()].map(([year, races]) => {
      const group = document.createElement('optgroup');
      group.label = year;
      races.forEach((race) => {
        const option = document.createElement('option');
        option.value = race.id;
        option.textContent = marblesRaceLabel(race);
        group.append(option);
      });
      return group;
    });

    elements.marblesRaceSelect.replaceChildren(topOption, ...groups);
    elements.marblesRaceSelect.value = marblesRacesById.has(currentValue) ? currentValue : 'top-ten';
  }

  function marblesTableHeader(labels) {
    elements.marblesScoreHeaderRow.replaceChildren(...labels.map((label) => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      return cell;
    }));
  }

  function marblesScoreRow(cells, isLeader = false, onActivate = null) {
    const row = document.createElement('tr');
    row.className = 'marbles-score-row';
    if (isLeader) row.classList.add('is-leader');

    cells.forEach((cellValue) => {
      const cell = document.createElement('td');
      if (cellValue instanceof Node) {
        cell.append(cellValue);
        if (cellValue.classList?.contains('marbles-player-label')) cell.classList.add('marbles-player-cell');
      } else {
        cell.textContent = cellValue;
      }
      row.append(cell);
    });

    if (typeof onActivate === 'function') {
      row.classList.add('is-clickable');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.addEventListener('click', onActivate);
      row.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onActivate();
      });
    }

    return row;
  }

  function marblesCellLabel(label, className = '') {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = label;
    return span;
  }

  function marblesPlayerLabel(player) {
    return marblesCellLabel(player, 'marbles-player-label');
  }

  function marblesRaceIdLabel(race) {
    return marblesCellLabel(race.id, 'marbles-race-label');
  }

  let marblesScorecardReturnSelection = 'top-ten';

  function setMarblesBackScorecard(show = false) {
    elements.marblesBackScorecard.hidden = !show;
  }

  function setMarblesWatchRace(race = null) {
    const hasPlayback = Boolean(race && marblesRaceChaptersById.has(race.id));
    elements.marblesWatchRace.hidden = !hasPlayback;
    elements.marblesWatchRace.dataset.raceId = hasPlayback ? race.id : '';
  }

  function setMarblesTableMode(mode) {
    elements.marblesScoreTable.classList.toggle('is-player-card', mode === 'player');
  }

  function renderMarblesTopTen() {
    setMarblesBackScorecard(false);
    setMarblesWatchRace();
    setMarblesTableMode('top-ten');
    elements.marblesScoreHeading.textContent = 'TOP TEN';
    elements.marblesScoreContext.textContent = `${marblesRaces.length} races · 1st = 10 pts · 10th = 1 pt · DNF = 0`;
    marblesTableHeader(['#', 'Player', 'Wins', 'Points']);

    const rows = marblesLeaderboard.map((entry, index) => marblesScoreRow([
      String(index + 1).padStart(2, '0'),
      marblesPlayerLabel(entry.player),
      String(entry.wins),
      String(entry.points)
    ], index === 0, () => renderMarblesPlayer(entry.player, 'top-ten')));

    elements.marblesScoreBody.replaceChildren(...rows);
  }

  function renderMarblesPlayer(player, returnSelection = elements.marblesRaceSelect?.value || 'top-ten') {
    const profile = marblesPlayerProfiles.get(player);
    if (!profile) return;

    marblesScorecardReturnSelection = marblesRacesById.has(returnSelection) ? returnSelection : 'top-ten';
    setMarblesBackScorecard(true);
    setMarblesWatchRace();
    setMarblesTableMode('player');
    elements.marblesRaceSelect.value = marblesScorecardReturnSelection;
    elements.marblesScoreHeading.textContent = profile.player;
    const best = profile.bestFinish === null ? '—' : `${profile.bestFinish}${profile.bestFinish === 1 ? 'st' : profile.bestFinish === 2 ? 'nd' : profile.bestFinish === 3 ? 'rd' : 'th'}`;
    elements.marblesScoreContext.textContent = `${profile.appearances} results · ${profile.finishes} finishes · ${profile.wins} wins · ${profile.podiums} podiums · ${profile.points} points · best ${best}`;
    marblesTableHeader(['Race', 'Pos', 'Status', 'Points']);

    const rows = profile.races.map(({ race, entry, points }) => marblesScoreRow([
      marblesRaceIdLabel(race),
      entry.position || (Number.isFinite(entry.order) ? String(entry.order) : '—'),
      entry.status || '—',
      String(points)
    ], entry.status === 'Finished' && entry.order === 1, () => {
      elements.marblesRaceSelect.value = race.id;
      renderMarblesRace(race);
    }));

    elements.marblesScoreBody.replaceChildren(...rows);
  }

  function renderMarblesRace(race) {
    setMarblesBackScorecard(false);
    setMarblesWatchRace(race);
    setMarblesTableMode('race');
    elements.marblesScoreHeading.textContent = race.id;
    const contextParts = [marblesRaceLabel(race)];
    const playbackChapter = marblesRaceChaptersById.get(race.id);
    const raceStart = playbackChapter?.segments?.[0]?.startSeconds;
    if (Number.isFinite(raceStart)) contextParts.push(`Start ${formatDuration(raceStart)}`);
    if (race.resultType) contextParts.push(race.resultType);
    elements.marblesScoreContext.textContent = contextParts.join(' · ');
    marblesTableHeader(['Pos', 'Player', 'Status', 'Points']);

    const rows = race.entries.map((entry) => marblesScoreRow([
      entry.position || (Number.isFinite(entry.order) ? String(entry.order) : '—'),
      marblesPlayerLabel(entry.player),
      entry.status || '—',
      String(marblesPointsForEntry(entry))
    ], entry.status === 'Finished' && entry.order === 1, () => renderMarblesPlayer(entry.player, race.id)));

    while (rows.length < 10) {
      rows.push(marblesScoreRow([
        String(rows.length + 1).padStart(2, '0'),
        rows.length === 0 ? 'Top 10 unavailable from supplied frame' : '—',
        '—',
        '0'
      ]));
    }

    elements.marblesScoreBody.replaceChildren(...rows.slice(0, 10));
  }

  function renderMarblesScores(selection = elements.marblesRaceSelect?.value || 'top-ten') {
    if (selection === 'top-ten') {
      renderMarblesTopTen();
      return;
    }

    const race = marblesRacesById.get(selection);
    if (race) {
      renderMarblesRace(race);
    } else {
      elements.marblesRaceSelect.value = 'top-ten';
      renderMarblesTopTen();
    }
  }

  function palLinkIcon(name) {
    const brandIcons = {
      youtube: 'assets/social-youtube.svg',
      x: 'assets/social-x.svg',
      instagram: 'assets/social-instagram.svg',
      bluesky: 'assets/social-bluesky.svg'
    };

    if (brandIcons[name]) {
      return `<img class="pal-brand-icon pal-brand-icon--${name}" src="${brandIcons[name]}" alt="" aria-hidden="true">`;
    }

    const icons = {
      twitch: '<path d="M5 3h15v11l-4 4h-4l-2.5 2.5V18H5z"/><path d="M8 6v7h3v2l2-2h3l2-2V6z" class="pal-icon-cut"/><path d="M12 7.5v3M15.5 7.5v3" class="pal-icon-cut"/>'
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24">${icons[name] || '<circle cx="12" cy="12" r="8"/><path d="M8 12h8" class="pal-icon-cut"/>'}</svg>`;
  }

  function renderPals() {
    if (!elements.palsGrid) return;

    const cards = pals.map((pal) => {
      const card = document.createElement('article');
      card.className = 'pal-card';

      const identity = document.createElement('div');
      identity.className = 'pal-identity';

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'pal-avatar-wrap';
      const initials = document.createElement('span');
      initials.className = 'pal-avatar-fallback';
      initials.textContent = pal.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
      avatarWrap.append(initials);

      if (pal.avatar) {
        const image = document.createElement('img');
        image.className = 'pal-avatar';
        image.src = pal.avatar;
        image.alt = `${pal.name} profile picture`;
        image.loading = 'lazy';
        image.referrerPolicy = 'no-referrer';
        image.addEventListener('load', () => avatarWrap.classList.add('has-image'));
        image.addEventListener('error', () => image.remove());
        avatarWrap.append(image);
      }

      const copy = document.createElement('div');
      copy.className = 'pal-copy';
      const name = document.createElement('h2');
      name.className = 'pal-name';
      name.textContent = pal.name;
      const handle = document.createElement('p');
      handle.className = 'pal-handle';
      handle.textContent = pal.handle;
      copy.append(name, handle);
      identity.append(avatarWrap, copy);

      const twitch = document.createElement('a');
      twitch.className = 'pal-twitch-button';
      twitch.href = pal.twitch;
      twitch.target = '_blank';
      twitch.rel = 'noopener noreferrer';
      twitch.innerHTML = `${palLinkIcon('twitch')}<span>TWITCH</span>`;

      const links = document.createElement('div');
      links.className = 'pal-links';
      links.setAttribute('aria-label', `${pal.name} links`);
      pal.links.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'pal-link';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.setAttribute('aria-label', link.label);
        anchor.title = link.label;
        anchor.innerHTML = palLinkIcon(link.icon);
        links.append(anchor);
      });

      card.append(identity, twitch, links);
      return card;
    });

    elements.palsGrid.replaceChildren(...cards);
  }

  function hideDiscoveryPages() {
    elements.homePage.hidden = true;
    elements.categoryPage.hidden = true;
    elements.categoriesPage.hidden = true;
    elements.searchPage.hidden = true;
    elements.aboutPage.hidden = true;
  }

  function hideArchiveAndToolPages() {
    elements.watchPage.hidden = true;
    elements.vodWatchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.backroomsPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = true;
  }

  function showNerdPokerEpisode(episodeNumber) {
    const requestedIndex = nerdPoker.episodes.findIndex((episode) => episode.episodeNumber === Number(episodeNumber));
    if (requestedIndex >= 0) nerdPoker.currentIndex = requestedIndex;
    showNerdPokerPage(podcastForNavId('nerd-poker'));
  }

  function activateDiscoveryRecord(record) {
    if (!record) return;
    state.segmentTransitioning = false;

    if (record.kind === 'game') {
      showGamePage(record.entryId);
      return;
    }
    if (record.kind === 'chapter') {
      selectEntry(record.entryId, record.itemId, 0, false, 'game');
      return;
    }
    if (record.kind === 'tool') {
      if (record.collectionId === 'vod-index') showVodIndexPage();
      return;
    }
    if (record.kind === 'collection') {
      if (record.collectionId === 'nerd-poker') {
        showNerdPokerPage(podcastForNavId('nerd-poker'));
      } else {
        showPodcastPage(record.entryId);
      }
      return;
    }
    if (record.kind === 'episode') {
      if (record.collectionId === 'nerd-poker') {
        showNerdPokerEpisode(record.episodeNumber);
      } else {
        selectEntry(record.entryId, record.itemId, 0, false, 'podcast');
      }
    }
  }

  function createDiscoveryCard(record, cardStyle = 'landscape') {
    const link = document.createElement('a');
    link.className = `archive-card archive-card--${cardStyle}`;
    link.href = record.route;
    link.dataset.discoveryId = record.id;

    const media = document.createElement('span');
    media.className = 'archive-card-media';
    const image = document.createElement('img');
    image.src = record.image || fallbackGameImage;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      if (image.src !== fallbackGameImage) image.src = fallbackGameImage;
    }, { once: true });
    media.append(image);

    const copy = document.createElement('span');
    copy.className = 'archive-card-copy';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'archive-card-eyebrow';
    eyebrow.textContent = record.eyebrow || record.kind.toUpperCase();
    const title = document.createElement('strong');
    title.className = 'archive-card-title';
    title.textContent = record.title;
    const meta = document.createElement('span');
    meta.className = 'archive-card-meta';
    meta.textContent = record.metaLine || record.parentTitle || '';
    meta.hidden = !meta.textContent;
    copy.append(eyebrow, title, meta);
    link.append(media, copy);

    link.addEventListener('click', (event) => {
      event.preventDefault();
      activateDiscoveryRecord(record);
    });
    return link;
  }

  function showCategoryPage(categoryId) {
    const category = discoveryCategoriesById.get(categoryId);
    if (!category) {
      showHomePage();
      return;
    }

    state.view = 'category';
    state.pageId = 'home';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();

    const records = recordsForCategory(category);
    elements.categoryPageTitle.textContent = category.title;
    elements.categoryPageDescription.textContent = category.description;
    elements.categoryPageDescription.hidden = !category.description;
    elements.categoryGrid.classList.add('is-poster-grid');
    elements.categoryGrid.replaceChildren(...records.map((record) => createDiscoveryCard(homeShelfRecord(record), 'poster')));
    elements.categoryPage.hidden = false;

    document.title = `The Sarkive | ${category.title}`;
    history.replaceState(null, '', `#category=${encodeURIComponent(category.id)}`);
    updateSiteMenu();
  }

  function showTagPage(tagValue) {
    const tag = gameTagsByKey.get(normalizedSearchText(tagValue));
    if (!tag) {
      showCategoriesPage();
      return;
    }

    state.view = 'tag';
    state.pageId = 'categories';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();

    const records = tag.gameIds
      .map((gameId) => discoveryRecordsById.get(`game:${gameId}`))
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));

    elements.categoryPageTitle.textContent = tag.label;
    elements.categoryPageDescription.textContent = '';
    elements.categoryPageDescription.hidden = true;
    elements.categoryGrid.classList.add('is-poster-grid');
    elements.categoryGrid.replaceChildren(...records.map((record) => createDiscoveryCard(record, 'poster')));
    elements.categoryPage.hidden = false;

    document.title = `The Sarkive | ${tag.label}`;
    history.replaceState(null, '', `#tag=${encodeURIComponent(tag.label)}`);
    updateSiteMenu();
  }

  function homeShelfRecord(record) {
    if (!record || record.kind === 'game') return record;
    const collection = discoveryCollectionsById.get(record.collectionId);
    return { ...record, image: collection?.homeImage || fallbackGameImage };
  }

  function updateShelfArrowState(track, previousButton, nextButton) {
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const hasOverflow = maxScrollLeft > 2;
    const hasPrevious = hasOverflow && track.scrollLeft > 2;
    const hasNext = hasOverflow && track.scrollLeft < maxScrollLeft - 2;
    previousButton.hidden = !hasPrevious;
    nextButton.hidden = !hasNext;
    const carousel = track.closest('.archive-shelf-carousel');
    if (carousel) {
      carousel.classList.toggle('has-previous', hasPrevious);
      carousel.classList.toggle('has-next', hasNext);
    }
  }

  function createShelfArrow(direction, track) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `archive-shelf-arrow archive-shelf-arrow--${direction}`;
    button.setAttribute('aria-label', direction === 'previous' ? 'Previous items' : 'Next items');
    button.innerHTML = direction === 'previous'
      ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>'
      : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>';
    button.addEventListener('click', () => {
      const amount = Math.max(280, track.clientWidth * 0.82);
      track.scrollBy({
        left: direction === 'previous' ? -amount : amount,
        behavior: 'smooth'
      });
    });
    return button;
  }

  function rotateHomeShelfLead(records, usedLeadIds) {
    if (!records.length || !usedLeadIds) return records;
    const leadIndex = records.findIndex((record) => !usedLeadIds.has(record.id));
    if (leadIndex <= 0) return records;
    return [...records.slice(leadIndex), ...records.slice(0, leadIndex)];
  }

  function createHomeShelf(category, usedLeadIds) {
    const section = document.createElement('section');
    section.className = 'archive-shelf';
    section.dataset.categoryId = category.id;

    const header = document.createElement('div');
    header.className = 'archive-shelf-header';
    const titleLink = document.createElement('a');
    titleLink.className = 'archive-shelf-title-link';
    titleLink.href = `#category=${encodeURIComponent(category.id)}`;
    const title = document.createElement('h2');
    title.className = 'archive-shelf-title';
    title.textContent = category.title;
    titleLink.append(title);
    titleLink.addEventListener('click', (event) => {
      event.preventDefault();
      showCategoryPage(category.id);
    });

    const viewAll = document.createElement('a');
    viewAll.className = 'archive-shelf-view-all';
    viewAll.href = `#category=${encodeURIComponent(category.id)}`;
    viewAll.textContent = 'VIEW ALL';
    viewAll.addEventListener('click', (event) => {
      event.preventDefault();
      showCategoryPage(category.id);
    });
    header.append(titleLink, viewAll);

    const carousel = document.createElement('div');
    carousel.className = 'archive-shelf-carousel';

    const track = document.createElement('div');
    track.className = 'archive-shelf-track archive-shelf-track--home';
    const orderedRecords = recordsForCategory(category, 'home');
    const records = rotateHomeShelfLead(orderedRecords, usedLeadIds).slice(0, category.homeLimit);
    if (records[0]) usedLeadIds?.add(records[0].id);
    track.replaceChildren(...records.map((record) => createDiscoveryCard(homeShelfRecord(record), 'poster')));

    const previousButton = createShelfArrow('previous', track);
    const nextButton = createShelfArrow('next', track);
    const syncArrows = () => updateShelfArrowState(track, previousButton, nextButton);
    track.addEventListener('scroll', syncArrows, { passive: true });

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(syncArrows);
      observer.observe(track);
    } else {
      window.addEventListener('resize', syncArrows, { passive: true });
    }

    carousel.append(previousButton, track, nextButton);
    section.append(header, carousel);
    requestAnimationFrame(syncArrows);
    return section;
  }

  function renderHomeShelves() {
    const categories = discoveryCategories.filter((category) => category.home);
    const usedLeadIds = new Set();
    elements.homeShelves.replaceChildren(...categories.map((category) => createHomeShelf(category, usedLeadIds)));
  }

  function renderCategoriesDirectory() {
    const links = gameTagDirectory.map((tag) => {
      const link = document.createElement('a');
      link.className = 'categories-directory-link';
      link.href = `#tag=${encodeURIComponent(tag.label)}`;
      link.textContent = tag.label;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showTagPage(tag.key);
      });
      return link;
    });

    elements.categoriesList.replaceChildren(...links);
  }

  function showCategoriesPage() {
    state.view = 'categories';
    state.pageId = 'categories';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    renderCategoriesDirectory();
    elements.categoriesPage.hidden = false;
    document.title = 'The Sarkive | Catagories';
    history.replaceState(null, '', '#page=categories');
    updateSiteMenu();
  }


  function showAboutPage() {
    state.view = 'about';
    state.pageId = 'about';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.aboutPage.hidden = false;
    document.title = 'The Sarkive | About';
    history.replaceState(null, '', '#page=about');
    updateSiteMenu();
  }

  function showHomePage() {
    state.view = 'home';
    state.pageId = 'home';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.homePage.hidden = false;
    document.title = 'The Sarkive';
    history.replaceState(null, '', '#home');
    updateSiteMenu();
  }

  function createSearchResult(record) {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = record.route;

    const media = document.createElement('span');
    media.className = `search-result-media search-result-media--${record.kind === 'game' || record.kind === 'chapter' ? 'poster-source' : 'landscape-source'}`;
    const image = document.createElement('img');
    image.src = record.image || fallbackGameImage;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      if (image.src !== fallbackGameImage) image.src = fallbackGameImage;
    }, { once: true });
    media.append(image);

    const copy = document.createElement('span');
    copy.className = 'search-result-copy';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'search-result-eyebrow';
    eyebrow.textContent = record.eyebrow || record.kind.toUpperCase();
    const title = document.createElement('strong');
    title.className = 'search-result-title';
    title.textContent = record.title;
    const meta = document.createElement('span');
    meta.className = 'search-result-meta';
    meta.textContent = [record.parentTitle, record.date].filter(Boolean).join(' · ') || record.metaLine || '';
    meta.hidden = !meta.textContent;
    const description = document.createElement('span');
    description.className = 'search-result-description';
    description.textContent = record.description || '';
    description.hidden = !description.textContent;
    copy.append(eyebrow, title, meta, description);
    link.append(media, copy);

    link.addEventListener('click', (event) => {
      event.preventDefault();
      activateDiscoveryRecord(record);
    });
    return link;
  }

  function filteredSearchResults() {
    return state.searchBaseResults.filter((record) => (
      state.searchKinds.has(record.kind) && state.searchSources.has(record.collectionId)
    ));
  }

  function searchFiltersAreDefault() {
    return (
      state.searchKinds.size === searchKindOptions.length &&
      state.searchSources.size === searchSourceOptions.length
    );
  }

  function setSearchFiltersOpen(open) {
    state.searchFiltersOpen = Boolean(open);
    elements.searchFilterPanel.hidden = !state.searchFiltersOpen;
    elements.searchFilterButton.setAttribute('aria-expanded', state.searchFiltersOpen ? 'true' : 'false');
    elements.searchFilterShell.classList.toggle('is-open', state.searchFiltersOpen);
  }

  function createSearchFilterGroup(titleText, options, activeSet, countForOption) {
    const fragment = document.createDocumentFragment();
    const title = document.createElement('div');
    title.className = 'search-filter-group-title';
    title.textContent = titleText;
    fragment.append(title);

    options.forEach((option) => {
      const count = countForOption(option);
      const label = document.createElement('label');
      label.className = 'search-filter-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = activeSet.has(option.id);
      checkbox.disabled = count === 0;
      checkbox.dataset.filterId = option.id;

      const mark = document.createElement('span');
      mark.className = 'search-filter-checkbox';
      mark.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'search-filter-option-label';
      text.textContent = option.label;

      const countNode = document.createElement('span');
      countNode.className = 'search-filter-option-count';
      countNode.textContent = count.toLocaleString();

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) activeSet.add(option.id);
        else activeSet.delete(option.id);
        renderSearchResults();
      });

      label.append(checkbox, mark, text, countNode);
      fragment.append(label);
    });

    return fragment;
  }

  function syncSearchFilterControls() {
    const results = state.searchBaseResults;
    elements.searchFilterTypes.replaceChildren(createSearchFilterGroup(
      'RESULT TYPE',
      searchKindOptions,
      state.searchKinds,
      (option) => results.filter((record) => record.kind === option.id).length
    ));
    elements.searchFilterSources.replaceChildren(createSearchFilterGroup(
      'SOURCE',
      searchSourceOptions,
      state.searchSources,
      (option) => results.filter((record) => record.collectionId === option.id).length
    ));

    const hiddenCount = (
      searchKindOptions.length - state.searchKinds.size +
      searchSourceOptions.length - state.searchSources.size
    );
    elements.searchFilterBadge.hidden = hiddenCount === 0;
    elements.searchFilterBadge.textContent = hiddenCount ? String(hiddenCount) : '';
    elements.searchFilterButton.classList.toggle('is-active', !searchFiltersAreDefault());
  }

  function renderSearchResults() {
    const query = state.searchQuery;
    const allResults = state.searchBaseResults;
    const results = filteredSearchResults();
    const filtersActive = !searchFiltersAreDefault();

    if (allResults.length) {
      elements.searchSummary.textContent = filtersActive
        ? `${results.length.toLocaleString()} of ${allResults.length.toLocaleString()} results for “${query}”`
        : `${allResults.length.toLocaleString()} ${allResults.length === 1 ? 'result' : 'results'} for “${query}”`;
    } else {
      elements.searchSummary.textContent = `No results for “${query}”`;
    }

    if (results.length) {
      elements.searchResults.replaceChildren(...results.map(createSearchResult));
    } else {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      const title = document.createElement('strong');
      const text = document.createElement('span');

      if (allResults.length && filtersActive) {
        title.textContent = 'Nothing matches the current filters.';
        text.textContent = 'Turn a result type or source back on, or reset the filters.';
      } else {
        title.textContent = 'Nothing in the archive matched that search.';
        text.textContent = 'Try a game, episode title, chapter, person, subject, or phrase from a description.';
      }

      empty.append(title, text);
      elements.searchResults.replaceChildren(empty);
    }

    syncSearchFilterControls();
  }

  function resetSearchFilters() {
    state.searchKinds = new Set(searchKindOptions.map((option) => option.id));
    state.searchSources = new Set(searchSourceOptions.map((option) => option.id));
    renderSearchResults();
  }

  function showSearchPage(rawQuery) {
    const query = String(rawQuery || '').trim();
    if (!query) return;

    state.view = 'search';
    state.pageId = '';
    state.navOverlayOpen = false;
    state.searchQuery = query;
    state.searchBaseResults = searchDiscovery(query);
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    setSearchFiltersOpen(false);

    elements.siteSearchInput.value = query;
    renderSearchResults();

    elements.searchPage.hidden = false;
    document.title = `The Sarkive | Search: ${query}`;
    history.replaceState(null, '', `#search=${encodeURIComponent(query)}`);
    updateSiteMenu();
  }

  function showSarkLinksPage() {
    state.view = 'sark-links';
    state.pageId = 'sark-links';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.sarkLinksPage.hidden = false;
    document.title = 'The Sarkive | Sark Links';
    history.replaceState(null, '', '#page=sark-links');
    updateSiteMenu();
  }

  function showPalsPage() {
    state.view = 'pals';
    state.pageId = 'pals';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = false;
    document.title = 'The Sarkive | Pals';
    history.replaceState(null, '', '#page=pals');
    updateSiteMenu();
  }

  function showMarblesScoresPage() {
    state.view = 'marbles-scores';
    state.pageId = 'marbles-scores';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.marblesScoresPage.hidden = false;
    populateMarblesRaceSelect();
    renderMarblesScores();
    document.title = 'The Sarkive | Marbles Scores';
    history.replaceState(null, '', '#page=marbles-scores');
    updateSiteMenu();
  }

  function showGamesPage() {
    showCategoryPage('all-games');
  }

  function showNerdPokerPage(entry = podcastForNavId('nerd-poker')) {
    if (!entry) {
      showGamesPage();
      return;
    }

    state.game = entry;
    state.gameIndex = playableEntries.indexOf(entry);
    state.contentType = 'podcast';
    state.view = 'nerd-poker';
    state.pageId = 'nerd-poker';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const requestedEpisode = Number.parseInt(params.get('episode'), 10);
    if (Number.isInteger(requestedEpisode)) {
      const requestedIndex = nerdPoker.episodes.findIndex((episode) => episode.episodeNumber === requestedEpisode && episode.videoId);
      if (requestedIndex >= 0) nerdPoker.currentIndex = requestedIndex;
    }

    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.nerdPokerPage.hidden = false;

    renderNerdPokerLibrary();
    paintNerdPokerEpisode();
    initNerdPokerPlayer();

    const episode = nerdPokerCurrentEpisode();
    document.title = episode ? `The Sarkive | Nerd Poker #${String(episode.episodeNumber).padStart(2, '0')}` : 'The Sarkive | Nerd Poker';
    const historyParams = new URLSearchParams({ page: 'nerd-poker' });
    if (episode) historyParams.set('episode', String(episode.episodeNumber));
    history.replaceState(null, '', `#${historyParams.toString()}`);
    updateSiteMenu();
  }

  function showSarkRadioPage() {
    state.view = 'sark-radio';
    state.pageId = 'sark-radio';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.sarkRadioPage.hidden = false;
    document.title = 'The Sarkive | Sark Radio';
    history.replaceState(null, '', '#page=sark-radio');
    updateSiteMenu();
    ensureSarkRadioData();
  }



  const vodMonthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  function vodDateParts(dateString) {
    const match = String(dateString || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
  }

  function vodHumanDate(dateString) {
    const parts = vodDateParts(dateString);
    if (!parts) return dateString || '';
    return `${String(parts.day).padStart(2, '0')} ${vodMonthNames[parts.month]} ${parts.year}`;
  }

  function vodCompactDate(dateString) {
    const parts = vodDateParts(dateString);
    if (!parts) return dateString || '';
    return `${String(parts.day).padStart(2, '0')}.${String(parts.month + 1).padStart(2, '0')}.${String(parts.year).slice(-2)}`;
  }

  function setVodCalendarFromDate(dateString) {
    const parts = vodDateParts(dateString || vodIndexNewestDate);
    if (!parts) return;
    state.vodCalendarYear = parts.year;
    state.vodCalendarMonth = parts.month;
  }

  function currentVodResults() {
    const query = String(state.vodQuery || '').trim().toLowerCase();
    return vodIndexVods.filter((vod) => {
      if (state.vodSelectedDate && vod.date !== state.vodSelectedDate) return false;
      if (!query) return true;
      return String(vod.searchText || `${vod.title} ${vod.primaryChannel}`).toLowerCase().includes(query);
    });
  }

  function vodSourceLabel(vod) {
    const sources = [...new Set((Array.isArray(vod.copies) ? vod.copies : []).map((copy) => String(copy.channel || '').trim()).filter(Boolean))];
    if (!sources.length) return vod.primaryChannel || 'Archive copy';
    if (sources.length === 1) return sources[0];
    return `${sources[0]} + ${sources.length - 1} more source${sources.length === 2 ? '' : 's'}`;
  }

  function vodInternalUrl(vod, copyId = '') {
    const params = new URLSearchParams({ vod: String(vod.id) });
    if (copyId && copyId !== String(vod.id)) params.set('copy', copyId);
    return `#${params.toString()}`;
  }

  function openVodFromIndex(vod, copyId = '', shouldPlay = false) {
    state.vodReturnState = {
      date: state.vodSelectedDate,
      query: state.vodQuery,
      calendarYear: state.vodCalendarYear,
      calendarMonth: state.vodCalendarMonth,
      visibleLimit: state.vodVisibleLimit
    };
    showVodWatchPage(vod.id, copyId, shouldPlay, false);
  }

  function createVodCard(vod) {
    const article = document.createElement('article');
    article.className = 'vod-card';

    const media = document.createElement('a');
    media.className = 'vod-card-media';
    media.href = vodInternalUrl(vod);
    media.setAttribute('aria-label', `Watch ${vod.title} in The Sarkive`);
    media.addEventListener('click', (event) => {
      event.preventDefault();
      openVodFromIndex(vod, '', false);
    });

    const image = document.createElement('img');
    image.src = vod.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(vod.id)}/hqdefault.jpg`;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      const fallback = `https://i.ytimg.com/vi/${encodeURIComponent(vod.id)}/hqdefault.jpg`;
      if (image.src !== fallback) image.src = fallback;
    }, { once: true });

    const stamp = document.createElement('span');
    stamp.className = 'vod-card-date-stamp';
    stamp.textContent = vodCompactDate(vod.date);
    media.append(image, stamp);

    const body = document.createElement('div');
    body.className = 'vod-card-body';

    const meta = document.createElement('div');
    meta.className = 'vod-card-meta';
    const duration = document.createElement('span');
    duration.textContent = vod.duration || '';
    const copies = document.createElement('span');
    copies.textContent = Number(vod.copyCount) > 1 ? `${vod.copyCount} COPIES` : '1 COPY';
    meta.append(duration, copies);

    const title = document.createElement('h3');
    title.className = 'vod-card-title';
    title.textContent = vod.title;

    const source = document.createElement('p');
    source.className = 'vod-card-source';
    source.textContent = vodSourceLabel(vod);

    const actions = document.createElement('div');
    actions.className = 'vod-card-actions';
    const watch = document.createElement('a');
    watch.className = 'vod-watch-link';
    watch.href = vodInternalUrl(vod);
    watch.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z"/></svg><span>WATCH VOD</span>';
    watch.addEventListener('click', (event) => {
      event.preventDefault();
      openVodFromIndex(vod, '', true);
    });
    actions.append(watch);

    body.append(meta, title, source, actions);

    if (Number(vod.copyCount) > 1 && Array.isArray(vod.copies)) {
      const details = document.createElement('details');
      details.className = 'vod-copy-stack';
      const summary = document.createElement('summary');
      summary.textContent = `${vod.copyCount} ARCHIVE COPIES`;
      const list = document.createElement('div');
      list.className = 'vod-copy-list';
      vod.copies.forEach((copy, index) => {
        const copyId = String(copy.videoId || '').trim();
        const link = document.createElement('a');
        link.href = vodInternalUrl(vod, copyId);
        link.addEventListener('click', (event) => {
          event.preventDefault();
          openVodFromIndex(vod, copyId, true);
        });
        const label = document.createElement('strong');
        label.textContent = copy.channel || `Copy ${index + 1}`;
        const copyMeta = document.createElement('span');
        copyMeta.textContent = [copy.duration, copy.archiveDate ? `archive date ${copy.archiveDate}` : ''].filter(Boolean).join(' · ');
        link.append(label, copyMeta);
        list.append(link);
      });
      details.append(summary, list);
      body.append(details);
    }

    article.append(media, body);
    return article;
  }

  function vodCopies(vod = state.vodCurrent) {
    if (!vod) return [];
    const copies = Array.isArray(vod.copies) ? vod.copies.filter((copy) => copy && copy.videoId) : [];
    if (copies.length) return copies;
    return [{
      videoId: String(vod.id || '').trim(),
      channel: vod.primaryChannel || 'Archive copy',
      title: vod.title || '',
      duration: vod.duration || '',
      durationSeconds: vod.durationSeconds
    }].filter((copy) => copy.videoId);
  }

  function currentVodCopy() {
    const copies = vodCopies();
    return copies[state.vodCopyIndex] || copies[0] || null;
  }

  function setVodPlayingUi(isPlaying) {
    state.vodIsPlaying = Boolean(isPlaying);
    if (!elements.vodPlayPause) return;
    elements.vodPlayPause.classList.toggle('is-playing', state.vodIsPlaying);
    elements.vodPlayPauseLabel.textContent = state.vodIsPlaying ? 'Pause' : 'Play';
  }

  function showVodPlayerMessage(title, message) {
    if (!elements.vodPlayerPlaceholder) return;
    elements.vodPlayerPlaceholder.classList.remove('hidden');
    elements.vodPlayerPlaceholder.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  }

  function hideVodPlayerMessage() {
    elements.vodPlayerPlaceholder?.classList.add('hidden');
  }

  function renderVodPlayerDetails() {
    const vod = state.vodCurrent;
    const copy = currentVodCopy();
    if (!vod || !copy) return;

    elements.vodPlayerTitle.textContent = vod.title || copy.title || 'Archived VOD';
    elements.vodRuntime.textContent = copy.duration || vod.duration || '—';
    const dateLabel = vodHumanDate(vod.date);
    const sourceLabel = copy.channel || vod.primaryChannel || 'Archive copy';
    elements.vodPlayerMeta.textContent = [dateLabel, sourceLabel].filter(Boolean).join(' · ');

    const copies = vodCopies(vod);
    elements.vodCopySelector.hidden = copies.length <= 1;
    elements.vodCopySelect.replaceChildren(...copies.map((entry, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${entry.channel || `Archive copy ${index + 1}`} · ${entry.duration || vod.duration || 'runtime unknown'}`;
      return option;
    }));
    elements.vodCopySelect.value = String(state.vodCopyIndex);
  }

  function loadCurrentVod(shouldPlay = false) {
    const copy = currentVodCopy();
    if (!copy?.videoId) {
      showVodPlayerMessage('No playable archive copy is mapped.', 'Return to the VOD Index and choose another preserved VOD.');
      return;
    }

    state.vodPendingPlay = Boolean(shouldPlay);
    setVodPlayingUi(false);

    if (!isHttpPage) {
      showVodPlayerMessage(
        'YouTube needs the site to be served over HTTP.',
        'Open The Sarkive through https://thesarkive.com/ instead of opening index.html directly.'
      );
      return;
    }

    if (!state.vodPlayerReady || !state.vodPlayer) {
      showVodPlayerMessage('Loading YouTube player…', 'The archived VOD will load here inside The Sarkive.');
      return;
    }

    hideVodPlayerMessage();
    if (shouldPlay) state.vodPlayer.loadVideoById(copy.videoId);
    else state.vodPlayer.cueVideoById(copy.videoId);
  }

  function showVodWatchPage(vodId, copyId = '', shouldPlay = false, rememberReturn = true) {
    const vod = vodIndexById.get(String(vodId || '').trim());
    if (!vod) return;

    if (rememberReturn && state.view === 'vod-index') {
      state.vodReturnState = {
        date: state.vodSelectedDate,
        query: state.vodQuery,
        calendarYear: state.vodCalendarYear,
        calendarMonth: state.vodCalendarMonth,
        visibleLimit: state.vodVisibleLimit
      };
    }

    pausePlayerForPageChange();
    state.vodCurrent = vod;
    const copies = vodCopies(vod);
    const requestedCopyIndex = copyId
      ? copies.findIndex((copy) => String(copy.videoId) === String(copyId))
      : -1;
    state.vodCopyIndex = requestedCopyIndex >= 0 ? requestedCopyIndex : 0;
    state.view = 'vod-watch';
    state.pageId = 'vod-index';
    state.navOverlayOpen = false;

    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.vodWatchPage.hidden = false;
    renderVodPlayerDetails();
    loadCurrentVod(shouldPlay);

    const copy = currentVodCopy();
    document.title = `The Sarkive | ${vod.title}`;
    history.replaceState(null, '', vodInternalUrl(vod, copy?.videoId || ''));
    updateSiteMenu();
    syncNavigationShell();
    scrollPageToTop();
  }

  function returnToVodIndex() {
    const snapshot = state.vodReturnState;
    showVodIndexPage(snapshot?.date || '');
    if (!snapshot) return;

    state.vodQuery = snapshot.query || '';
    state.vodSelectedDate = snapshot.date || '';
    state.vodCalendarYear = snapshot.calendarYear || state.vodCalendarYear;
    state.vodCalendarMonth = Number.isInteger(snapshot.calendarMonth) ? snapshot.calendarMonth : state.vodCalendarMonth;
    state.vodVisibleLimit = snapshot.visibleLimit || 60;
    elements.vodSearch.value = state.vodQuery;
    elements.vodDateJump.value = state.vodSelectedDate;
    renderVodCalendar();
    renderVodResults(false);
    history.replaceState(null, '', state.vodSelectedDate ? `#page=vod-index&date=${encodeURIComponent(state.vodSelectedDate)}` : '#page=vod-index');
  }

  function toggleVodPlayback() {
    if (!state.vodPlayerReady || !state.vodPlayer) return;
    const playerState = state.vodPlayer.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) state.vodPlayer.pauseVideo();
    else state.vodPlayer.playVideo();
  }

  function renderVodResults(resetLimit = false) {
    if (resetLimit) state.vodVisibleLimit = 60;
    const results = currentVodResults();
    const visible = results.slice(0, state.vodVisibleLimit);

    if (state.vodSelectedDate) {
      elements.vodResultsTitle.textContent = vodHumanDate(state.vodSelectedDate);
    } else if (state.vodQuery) {
      elements.vodResultsTitle.textContent = `SEARCH: ${state.vodQuery}`;
    } else {
      elements.vodResultsTitle.textContent = 'LATEST VODS';
    }

    elements.vodResultsCount.textContent = `${results.length.toLocaleString()} ${results.length === 1 ? 'VOD' : 'VODS'}`;
    elements.vodResults.replaceChildren(...visible.map(createVodCard));

    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'vod-empty-state';
      empty.innerHTML = '<strong>NO PRESERVED VOD INDEXED HERE</strong><span>Try another date or clear the filter.</span>';
      elements.vodResults.append(empty);
    }

    elements.vodLoadMore.hidden = visible.length >= results.length;
    elements.vodLoadMore.textContent = `LOAD MORE · ${Math.min(results.length - visible.length, 60).toLocaleString()} NEXT`;
  }

  function renderVodYearStrip() {
    if (!elements.vodYearStrip) return;
    const buttons = vodIndexYears.map((year) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = year;
      button.className = 'vod-year-button';
      button.classList.toggle('active', year === state.vodCalendarYear);
      button.addEventListener('click', () => {
        state.vodCalendarYear = year;
        renderVodCalendar();
      });
      return button;
    });
    elements.vodYearStrip.replaceChildren(...buttons);
  }

  function renderVodCalendar() {
    if (!state.vodCalendarYear) setVodCalendarFromDate(vodIndexNewestDate);
    const year = state.vodCalendarYear;
    const month = state.vodCalendarMonth;
    elements.vodCalendarLabel.textContent = `${vodMonthNames[month]} ${year}`;

    const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      const blank = document.createElement('span');
      blank.className = 'vod-calendar-day is-blank';
      cells.push(blank);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = vodsByDate.get(date)?.length || 0;
      const cell = document.createElement(count ? 'button' : 'span');
      if (count) cell.type = 'button';
      cell.className = 'vod-calendar-day';
      cell.classList.toggle('has-vod', count > 0);
      cell.classList.toggle('active', date === state.vodSelectedDate);
      const number = document.createElement('strong');
      number.textContent = day;
      cell.append(number);
      if (count) {
        const badge = document.createElement('small');
        badge.textContent = count;
        badge.setAttribute('aria-label', `${count} preserved ${count === 1 ? 'VOD' : 'VODs'}`);
        cell.append(badge);
        cell.title = `${vodHumanDate(date)} · ${count} preserved ${count === 1 ? 'VOD' : 'VODs'}`;
        cell.addEventListener('click', () => {
          state.vodSelectedDate = date;
          state.vodQuery = '';
          elements.vodSearch.value = '';
          elements.vodDateJump.value = date;
          state.vodVisibleLimit = 60;
          renderVodCalendar();
          renderVodResults(true);
          history.replaceState(null, '', `#page=vod-index&date=${encodeURIComponent(date)}`);
          elements.vodResultsTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      cells.push(cell);
    }

    while (cells.length % 7) {
      const blank = document.createElement('span');
      blank.className = 'vod-calendar-day is-blank';
      cells.push(blank);
    }

    elements.vodCalendarGrid.replaceChildren(...cells);
    renderVodYearStrip();
  }

  function stepVodCalendarMonth(delta) {
    let year = state.vodCalendarYear;
    let month = state.vodCalendarMonth + delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    const minYear = vodIndexYears[0] || year;
    const maxYear = vodIndexYears[vodIndexYears.length - 1] || year;
    if (year < minYear || year > maxYear) return;
    state.vodCalendarYear = year;
    state.vodCalendarMonth = month;
    renderVodCalendar();
  }

  function showVodIndexPage(initialDate = '') {
    state.view = 'vod-index';
    state.pageId = 'vod-index';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.vodIndexPage.hidden = false;

    elements.vodIndexLogicalCount.textContent = Number(rawVodIndex?.logicalVodCount || vodIndexVods.length).toLocaleString();
    elements.vodIndexUploadCount.textContent = Number(rawVodIndex?.totalUploads || 0).toLocaleString();
    elements.vodIndexDateCount.textContent = Number(rawVodIndex?.dateCount || vodsByDate.size).toLocaleString();

    const requestedDate = vodDateParts(initialDate) ? initialDate : '';
    state.vodSelectedDate = requestedDate;
    state.vodQuery = '';
    state.vodVisibleLimit = 60;
    elements.vodSearch.value = '';
    elements.vodDateJump.value = requestedDate;
    if (vodIndexVods.length) {
      elements.vodDateJump.min = vodIndexVods[vodIndexVods.length - 1].date;
      elements.vodDateJump.max = vodIndexVods[0].date;
    }
    setVodCalendarFromDate(requestedDate || vodIndexNewestDate);
    renderVodCalendar();
    renderVodResults(true);

    document.title = 'The Sarkive | VOD Index';
    history.replaceState(null, '', requestedDate ? `#page=vod-index&date=${encodeURIComponent(requestedDate)}` : '#page=vod-index');
    updateSiteMenu();
  }



  function showBackroomsPage(options = {}) {
    state.view = 'backrooms';
    state.pageId = 'backrooms';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.backroomsPage.hidden = false;
    window.SARKIVE_BACKROOMS_UI?.show({
      date: String(options.date || '').trim(),
      query: String(options.query || '').trim(),
      index: Boolean(options.index)
    });
    document.title = 'The Sarkive | Backrooms';
    updateSiteMenu();
  }

  function showShopPage() {
    state.view = 'shop';
    state.pageId = 'shop';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.shopPage.hidden = false;
    document.title = 'The Sarkive | Shop';
    history.replaceState(null, '', '#page=shop');
    updateSiteMenu();
  }

  function showSarkTvPage() {
    state.view = 'sark-tv';
    state.pageId = 'sark-tv';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.sarkTvPage.hidden = false;

    elements.sarkTvCount.textContent = sarkTvClips.length
      ? `${sarkTvClips.length.toLocaleString()} clips in rotation`
      : 'No clips loaded';
    elements.sarkTvStatus.textContent = state.sarkTvClip ? 'READY' : 'CLIP ARCHIVE READY';
    prepareInitialSarkTvClip();

    document.title = 'The Sarkive | SarkTV';
    history.replaceState(null, '', '#page=sark-tv');
    updateSiteMenu();
  }

  function showComingSoonPage(page) {
    if (!page || page.id === 'games') {
      showGamesPage();
      return;
    }

    state.view = 'coming-soon';
    state.pageId = page.id;
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.watchPage.hidden = true;
    elements.gamePage.hidden = true;
    elements.podcastPage.hidden = true;
    elements.nerdPokerPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.comingSoonPage.hidden = false;
    elements.comingSoonTitle.textContent = page.label;
    document.title = `The Sarkive | ${page.label}`;
    history.replaceState(null, '', `#page=${encodeURIComponent(page.id)}`);
    updateSiteMenu();
  }

  function createNavButton(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-item';
    button.dataset.navId = item.id;
    button.innerHTML = navIcon(item.icon);

    const label = document.createElement('span');
    label.textContent = item.label;
    button.append(label);
    button.addEventListener('click', () => {
      state.navOverlayOpen = false;
      if (item.id === 'home') {
        showHomePage();
      } else if (item.id === 'marbles-scores') {
        showMarblesScoresPage();
      } else if (item.id === 'sark-tv') {
        showSarkTvPage();
      } else if (item.id === 'sark-radio') {
        showSarkRadioPage();
      } else if (item.id === 'vod-index') {
        showVodIndexPage();
      } else if (item.id === 'backrooms') {
        showBackroomsPage();
      } else if (item.id === 'categories') {
        showCategoriesPage();
      } else if (item.id === 'shop') {
        showShopPage();
      } else if (item.id === 'sark-links') {
        showSarkLinksPage();
      } else if (item.id === 'pals') {
        showPalsPage();
      } else if (item.id === 'about') {
        showAboutPage();
      } else {
        showComingSoonPage(item);
      }
    });
    return button;
  }

  function renderSiteMenu() {
    const fragment = document.createDocumentFragment();

    navSections.forEach((section, sectionIndex) => {
      const sectionElement = document.createElement('div');
      sectionElement.className = 'nav-section';
      sectionElement.append(...section.map(createNavButton));
      fragment.append(sectionElement);

      if (sectionIndex < navSections.length - 1) {
        const divider = document.createElement('hr');
        divider.className = 'nav-divider';
        fragment.append(divider);
      }
    });

    elements.siteMenu.replaceChildren(fragment);
  }

  function updateSiteMenu() {
    const activeId = state.view === 'home' ? 'home' : state.pageId;

    elements.siteMenu.querySelectorAll('.nav-item').forEach((button) => {
      const isActive = button.dataset.navId === activeId;
      button.classList.toggle('active', isActive);

      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    syncNavigationShell();
  }

  function createGameTile(game) {
    const link = document.createElement('a');
    link.className = 'game-tile';
    link.href = `#game=${encodeURIComponent(game.id)}`;
    link.setAttribute('aria-label', `Watch ${game.title}`);

    const image = document.createElement('img');
    image.className = 'game-tile-image';
    image.src = game.image;
    image.alt = '';
    image.loading = 'lazy';
    image.width = 210;
    image.height = 280;
    image.addEventListener('error', () => {
      if (image.src !== fallbackGameImage) image.src = fallbackGameImage;
    }, { once: true });

    const title = document.createElement('strong');
    title.className = 'game-tile-title';
    title.textContent = game.title;

    link.append(image, title);
    link.addEventListener('click', (event) => {
      event.preventDefault();
      state.segmentTransitioning = false;
      showGamePage(game.id);
    });
    return link;
  }

  function renderGameLibrary() {
    elements.gameGrid.replaceChildren(...games.map(createGameTile));
  }

  function chapterNumber(chapter, index) {
    if (chapter.orderLabel) return chapter.orderLabel;
    return chapter.kind === 'bonus' ? 'BONUS' : String(index + 1).padStart(2, '0');
  }

  function chapterDescription(chapter) {
    if (chapter.description) return chapter.description;
    return [...new Set(chapter.segments.map((segment) => segment.label).filter(Boolean))].join(' · ');
  }

  function updateSegmentLabel() {
    const label = state.contentType === 'backrooms' && state.backroomsWatchContext
      ? String(state.backroomsWatchContext.metaLabel || '').trim()
      : (currentSegment()?.label || '');
    elements.segmentLabel.textContent = label;
    elements.segmentLabel.hidden = !label;
  }

  function createChapterButton(chapter, index, onSelect) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-button';
    button.dataset.chapterId = chapter.id;
    const order = document.createElement('span');
    order.className = 'chapter-order';
    order.textContent = chapterNumber(chapter, index);

    const copy = document.createElement('span');
    copy.className = 'chapter-copy';

    const name = document.createElement('strong');
    name.className = 'chapter-name';
    name.textContent = chapter.title;
    copy.append(name);

    const descriptionText = chapter.date || chapterDescription(chapter);
    if (descriptionText) {
      const description = document.createElement('small');
      description.className = 'chapter-description';
      description.textContent = descriptionText;
      description.title = descriptionText;
      copy.append(description);
    }

    const length = document.createElement('span');
    length.className = 'chapter-length';
    const runtime = chapterRuntimeSeconds(chapter);
    length.textContent = runtime === null ? '' : formatDuration(runtime);
    length.hidden = runtime === null;

    button.append(order, copy, length);
    button.addEventListener('click', () => {
      state.segmentTransitioning = false;
      onSelect(chapter);
    });
    return button;
  }

  function renderWatchChapterList(groupId) {
    const group = state.game.groups.find((entry) => entry.id === groupId) || state.game.groups[0];
    if (!group) {
      elements.chapterList.replaceChildren();
      return;
    }

    elements.watchGroupSelect.value = group.id;
    elements.chapterList.replaceChildren(...group.chapters.map((chapter) => {
      const chapterIndex = state.game.chapters.indexOf(chapter);
      return createChapterButton(chapter, chapterIndex, (selectedChapter) => {
        selectChapter(selectedChapter.id, 0, true);
      });
    }));
  }

  function configureWatchModeUi() {
    const backroomsMode = state.contentType === 'backrooms';
    if (elements.backroomsWatchBack) elements.backroomsWatchBack.hidden = !backroomsMode;
    if (elements.chapterPanel) elements.chapterPanel.hidden = backroomsMode;
    if (elements.runtimeBlock) elements.runtimeBlock.hidden = backroomsMode;
    if (elements.videoTitleSeparator) elements.videoTitleSeparator.hidden = backroomsMode;
    if (elements.chapterTitle) elements.chapterTitle.hidden = backroomsMode;
  }

  function renderChapters() {
    elements.watchChaptersTitle.textContent = state.game.chaptersLabel || 'Chapters';
    elements.watchGroupSelect.setAttribute('aria-label', state.game.groupSelectLabel || 'Select chapter group');
    const hiddenLabel = elements.watchGroupSelect.parentElement?.querySelector('.visually-hidden');
    if (hiddenLabel) hiddenLabel.textContent = state.game.groupSelectLabel || 'Select chapter group';
    elements.watchGroupSelect.replaceChildren(...state.game.groups.map((group) => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.title;
      return option;
    }));
    elements.watchGroupSelect.parentElement.hidden = state.game.groups.length <= 1;

    renderWatchChapterList(state.chapter?.groupId || state.game.groups[0]?.id);
  }

  function detailElements(contentType) {
    if (contentType === 'podcast') {
      return {
        page: elements.podcastPage,
        heroImage: elements.podcastHeroImage,
        title: elements.podcastDetailTitle,
        tags: elements.podcastDetailTags,
        description: elements.podcastDetailDescription,
        play: elements.podcastPlay,
        groupSelect: elements.podcastGroupSelect,
        chapterList: elements.podcastDetailChapterList
      };
    }

    return {
      page: elements.gamePage,
      heroImage: elements.gameHeroImage,
      title: elements.gameDetailTitle,
      tags: elements.gameDetailTags,
      description: elements.gameDetailDescription,
      play: elements.gamePlay,
      groupSelect: elements.gameGroupSelect,
      chapterList: elements.gameDetailChapterList
    };
  }

  function renderDetailEpisodes(entry, groupId, contentType) {
    const group = entry.groups.find((item) => item.id === groupId) || entry.groups[0];
    const detail = detailElements(contentType);

    if (!group) {
      detail.chapterList.replaceChildren();
      return;
    }

    detail.groupSelect.value = group.id;
    detail.chapterList.replaceChildren(...group.chapters.map((chapter) => {
      const chapterIndex = entry.chapters.indexOf(chapter);
      return createChapterButton(chapter, chapterIndex, (selectedChapter) => {
        selectEntry(entry.id, selectedChapter.id, 0, true, contentType);
      });
    }));
  }

  function renderEntryDetail(entry, contentType) {
    const detail = detailElements(contentType);
    if (contentType === 'podcast' && (entry.titleLine1 || entry.titleLine2)) {
      const titleLine1 = document.createElement('span');
      titleLine1.className = 'podcast-hero-title-line podcast-hero-title-line-primary';
      titleLine1.textContent = entry.titleLine1 || entry.title;

      const titleLine2 = document.createElement('span');
      titleLine2.className = 'podcast-hero-title-line podcast-hero-title-line-secondary';
      titleLine2.textContent = entry.titleLine2 || '';

      detail.title.replaceChildren(titleLine1, titleLine2);
      detail.title.setAttribute('aria-label', entry.title);
    } else {
      detail.title.textContent = entry.title;
      detail.title.removeAttribute('aria-label');
    }
    if (contentType === 'game') {
      elements.gameEpisodesTitle.textContent = entry.episodesLabel || 'Episodes';
      elements.gameGroupSelect.setAttribute('aria-label', entry.groupSelectLabel || 'Select group');
      const hiddenLabel = elements.gameGroupSelect.parentElement?.querySelector('.visually-hidden');
      if (hiddenLabel) hiddenLabel.textContent = entry.groupSelectLabel || 'Select group';
    }
    if (contentType === 'podcast') {
      if (elements.podcastHeroKicker) elements.podcastHeroKicker.textContent = entry.kicker || entry.title;
      if (elements.podcastEpisodesTitle) elements.podcastEpisodesTitle.textContent = entry.episodesLabel || 'Episodes';
      elements.podcastGroupSelect.setAttribute('aria-label', entry.groupSelectLabel || 'Select season');
      const hiddenLabel = elements.podcastGroupSelect.parentElement?.querySelector('.visually-hidden');
      if (hiddenLabel) hiddenLabel.textContent = entry.groupSelectLabel || 'Select season';
    }
    detail.tags.textContent = entry.tags.join('  •  ');
    detail.tags.hidden = entry.tags.length === 0;
    detail.description.textContent = entry.description;
    detail.description.hidden = !entry.description;
    const heroSources = [...new Set([entry.heroImage, entry.image, fallbackGameImage].filter(Boolean))];
    let heroSourceIndex = 0;
    detail.heroImage.alt = '';
    detail.heroImage.onerror = () => {
      heroSourceIndex += 1;
      if (heroSourceIndex < heroSources.length) {
        detail.heroImage.src = heroSources[heroSourceIndex];
      } else {
        detail.heroImage.onerror = null;
      }
    };
    detail.heroImage.src = heroSources[0];

    detail.groupSelect.replaceChildren(...entry.groups.map((group) => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.title;
      return option;
    }));
    detail.groupSelect.parentElement.hidden = entry.groups.length <= 1;
    renderDetailEpisodes(entry, entry.groups[0]?.id, contentType);
  }

  function showEntryPage(entryId, contentType) {
    const entryMap = contentType === 'podcast' ? podcastsById : gamesById;
    const entry = entryMap.get(entryId);
    if (!entry) {
      showGamesPage();
      return;
    }

    if (contentType === 'podcast' && specialPageId(entry) === 'nerd-poker') {
      showNerdPokerPage(entry);
      return;
    }

    state.game = entry;
    state.gameIndex = playableEntries.indexOf(entry);
    state.contentType = contentType;
    state.view = contentType === 'podcast' ? 'podcast-detail' : 'game-detail';
    state.pageId = contentType === 'podcast' ? specialPageId(entry) : 'games';
    state.navOverlayOpen = false;
    pausePlayerForPageChange();
    hideDiscoveryPages();
    elements.podcastPage.classList.toggle(
      'guest-podcast-page',
      contentType === 'podcast' && guestPodcastEntryIds.has(entry.id)
    );
    renderEntryDetail(entry, contentType);

    elements.watchPage.hidden = true;
    elements.gamesPage.hidden = true;
    elements.comingSoonPage.hidden = true;
    elements.marblesScoresPage.hidden = true;
    elements.sarkRadioPage.hidden = true;
    elements.vodIndexPage.hidden = true;
    elements.shopPage.hidden = true;
    elements.sarkLinksPage.hidden = true;
    elements.sarkTvPage.hidden = true;
    elements.palsPage.hidden = true;
    elements.gamePage.hidden = contentType !== 'game';
    elements.podcastPage.hidden = contentType !== 'podcast';
    elements.nerdPokerPage.hidden = true;

    document.title = `The Sarkive | ${entry.title}`;
    const entryKey = contentType === 'podcast' ? 'podcast' : 'game';
    history.replaceState(null, '', `#${entryKey}=${encodeURIComponent(entry.id)}`);
    updateSiteMenu();
  }

  function showGamePage(gameId) {
    showEntryPage(gameId, 'game');
  }

  function showPodcastPage(podcastId) {
    showEntryPage(podcastId, 'podcast');
  }

  function updateChapterUi() {
    elements.gameTitle.textContent = state.game.title;
    elements.chapterTitle.textContent = state.chapter.title;
    updateSegmentLabel();
    const runtime = chapterRuntimeSeconds(state.chapter);
    elements.chapterRuntime.textContent = runtime === null ? '' : formatDuration(runtime);
    elements.chapterRuntime.hidden = runtime === null;
    elements.watchPage.setAttribute('aria-label', `${state.game.title} watch page`);
    document.title = `The Sarkive | ${state.game.title}`;

    if (elements.watchGroupSelect.value !== state.chapter.groupId) {
      renderWatchChapterList(state.chapter.groupId);
    }

    elements.chapterList.querySelectorAll('.chapter-button').forEach((button) => {
      const isActive = button.dataset.chapterId === state.chapter.id;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (state.contentType === 'backrooms' && state.backroomsWatchContext) {
      elements.previousChapter.disabled = !state.backroomsWatchContext.previousGameId;
      elements.nextChapter.disabled = !state.backroomsWatchContext.nextGameId;
    } else {
      elements.previousChapter.disabled = state.chapterIndex === 0;
      elements.nextChapter.disabled = state.chapterIndex === state.game.chapters.length - 1;
    }
  }

  function setPlayerSourceMode(mode) {
    const youtubeMode = mode === 'youtube';
    const archiveMode = mode === 'archive';
    elements.youtubePlayerShell.hidden = !youtubeMode;
    elements.archivePlayer.hidden = !archiveMode;
    elements.playPause.disabled = !youtubeMode || !state.playerReady;
    if (!youtubeMode) setPlayingUi(false);
  }

  function stopArchivePlayer() {
    if (!elements.archivePlayer) return;
    elements.archivePlayer.src = 'about:blank';
    elements.archivePlayer.hidden = true;
  }

  function loadCurrentSegment(shouldPlay) {
    updateSegmentLabel();
    updateUrl();

    const segment = currentSegment();
    if (!segment) return;

    if (segment.sourceType === 'archive') {
      state.pendingLoadMode = null;
      if (state.playerReady && state.player) state.player.pauseVideo();
      hidePlayerMessage();
      setPlayerSourceMode('archive');
      const autoplay = shouldPlay ? '?autoplay=1' : '';
      elements.archivePlayer.src = `https://archive.org/embed/${encodeURIComponent(segment.archiveId)}${autoplay}`;
      return;
    }

    stopArchivePlayer();

    if (segment.sourceType === 'external') {
      state.pendingLoadMode = null;
      if (state.playerReady && state.player) state.player.pauseVideo();
      elements.youtubePlayerShell.hidden = true;
      elements.playPause.disabled = true;
      showPlayerMessage(
        'Playable archive source not linked yet.',
        'This clip is logged in the X-Play data, but the current archive ledger does not have a confirmed playable source for it.',
        segment.sourceUrl || segment.g4Url || ''
      );
      return;
    }

    setPlayerSourceMode('youtube');

    if (!isHttpPage) {
      state.pendingLoadMode = null;
      showPlayerMessage(
        'YouTube needs the site to be served over HTTP.',
        'Open The Sarkive through https://thesarkive.com/. Opening index.html directly gives YouTube no referring site, so it blocks the embed.'
      );
      return;
    }

    if (!state.playerReady || !state.player) {
      state.pendingLoadMode = shouldPlay ? 'play' : 'cue';
      return;
    }

    state.pendingLoadMode = null;
    state.suppressEndedUntil = performance.now() + 900;
    hidePlayerMessage();

    const request = playerRequestForSegment(segment);

    if (shouldPlay) {
      state.player.loadVideoById(request);
    } else {
      state.player.cueVideoById(request);
    }
  }

  function selectBackroomsWatch(payload, shouldPlay = true) {
    if (!payload?.videoId || !payload?.gameId || !payload?.title) return;

    const entryId = `backrooms-watch-${payload.gameId}-${payload.appearanceId || 'index'}`;
    const groupId = `${entryId}-group`;
    const chapterId = `${entryId}-footage`;
    const chapter = {
      id: chapterId,
      title: payload.chapterTitle || 'BACKROOMS ARCHIVE',
      kind: 'main',
      date: '',
      description: '',
      orderLabel: '',
      tags: [],
      people: [],
      searchTerms: [],
      subject: '',
      type: '',
      groupId,
      segments: [{
        id: `${chapterId}-segment`,
        sourceType: 'youtube',
        videoId: payload.videoId,
        startSeconds: Number(payload.startSeconds) || 0,
        label: ''
      }]
    };
    const group = { id: groupId, title: 'Backrooms Archive', chapters: [chapter] };
    const entry = {
      id: entryId,
      title: payload.title,
      titleLine1: '',
      titleLine2: '',
      image: '',
      heroImage: '',
      description: '',
      navId: '',
      kicker: '',
      episodesLabel: 'Footage',
      chaptersLabel: 'Footage',
      groupSelectLabel: 'Select footage',
      tags: [],
      people: [],
      searchTerms: [],
      groups: [group],
      chapters: [chapter]
    };

    gamesById.set(entryId, entry);
    state.backroomsWatchContext = {
      gameId: payload.gameId,
      appearanceId: payload.appearanceId || '',
      previousGameId: payload.previousGameId || '',
      nextGameId: payload.nextGameId || '',
      metaLabel: String(payload.metaLabel || '').trim(),
      returnHash: payload.returnHash || '#page=backrooms'
    };
    selectEntry(entryId, chapterId, 0, shouldPlay, 'backrooms');
  }

  function returnToBackroomsArchive() {
    const returnHash = state.backroomsWatchContext?.returnHash || '#page=backrooms';
    const params = new URLSearchParams(String(returnHash).replace(/^#/, ''));
    history.replaceState(null, '', returnHash);
    showBackroomsPage({
      date: String(params.get('date') || '').trim(),
      query: String(params.get('q') || '').trim(),
      index: params.get('index') === '1'
    });
  }

  window.SARKIVE_OPEN_BACKROOMS_WATCH = payload => selectBackroomsWatch(payload, true);

  function selectEntry(entryId, chapterId = null, segmentIndex = 0, shouldPlay = false, contentType = null) {
    const resolvedType = contentType || (podcastsById.has(entryId) ? 'podcast' : 'game');
    const entryMap = resolvedType === 'podcast' ? podcastsById : gamesById;
    const entry = entryMap.get(entryId);
    if (!entry) return;

    const chapterIndex = chapterId
      ? entry.chapters.findIndex((chapter) => chapter.id === chapterId)
      : 0;
    const safeChapterIndex = chapterIndex >= 0 ? chapterIndex : 0;

    state.game = entry;
    state.gameIndex = playableEntries.indexOf(entry);
    state.contentType = resolvedType;
    if (resolvedType !== 'backrooms') state.backroomsWatchContext = null;
    state.chapter = entry.chapters[safeChapterIndex];
    state.chapterIndex = safeChapterIndex;
    state.segmentIndex = Math.min(Math.max(segmentIndex, 0), state.chapter.segments.length - 1);
    state.segmentTransitioning = false;
    state.view = 'watch';
    state.pageId = '';
    state.navOverlayOpen = false;
    hideDiscoveryPages();
    hideArchiveAndToolPages();
    elements.watchPage.hidden = false;

    configureWatchModeUi();
    renderChapters();
    updateSiteMenu();
    updateChapterUi();
    setPlayingUi(false);
    loadCurrentSegment(shouldPlay);
    scrollPageToTop();
  }

  function selectGame(gameId, chapterId = null, segmentIndex = 0, shouldPlay = false) {
    selectEntry(gameId, chapterId, segmentIndex, shouldPlay, 'game');
  }

  function selectChapter(chapterId, segmentIndex = 0, shouldPlay = true) {
    const chapterIndex = state.game.chapters.findIndex((chapter) => chapter.id === chapterId);
    if (chapterIndex < 0) return;

    state.chapter = state.game.chapters[chapterIndex];
    state.chapterIndex = chapterIndex;
    state.segmentIndex = Math.min(Math.max(segmentIndex, 0), state.chapter.segments.length - 1);

    updateChapterUi();
    setPlayingUi(false);
    loadCurrentSegment(shouldPlay);
    scrollPageToTop();
  }

  function stepBackroomsGame(direction) {
    const context = state.backroomsWatchContext;
    if (!context) return;

    const targetGameId = direction < 0 ? context.previousGameId : context.nextGameId;
    if (!targetGameId) return;

    const payload = window.SARKIVE_BACKROOMS_UI?.watchPayload?.(
      targetGameId,
      '',
      context.returnHash || '#page=backrooms'
    );
    if (!payload) return;

    state.segmentTransitioning = false;
    selectBackroomsWatch(payload, true);
  }

  function stepChapter(direction) {
    if (state.contentType === 'backrooms') {
      stepBackroomsGame(direction);
      return;
    }

    const nextIndex = state.chapterIndex + direction;
    if (nextIndex < 0 || nextIndex >= state.game.chapters.length) return;

    state.segmentTransitioning = false;
    selectChapter(state.game.chapters[nextIndex].id, 0, true);
  }

  function togglePlayback() {
    if (currentSegment()?.sourceType !== 'youtube') return;
    if (!state.playerReady || !state.player) return;

    const playerState = state.player.getPlayerState();
    if (playerState === YT.PlayerState.PLAYING) {
      state.player.pauseVideo();
    } else {
      state.player.playVideo();
    }
  }

  function handleSegmentEnd() {
    if (state.segmentTransitioning) return;
    state.segmentTransitioning = true;

    if (state.segmentIndex < state.chapter.segments.length - 1) {
      state.segmentIndex += 1;
      loadCurrentSegment(true);
    } else if (state.chapterIndex < state.game.chapters.length - 1) {
      state.chapterIndex += 1;
      state.chapter = state.game.chapters[state.chapterIndex];
      state.segmentIndex = 0;
      updateChapterUi();
      setPlayingUi(false);
      loadCurrentSegment(true);
    } else {
      setPlayingUi(false);
    }

    window.setTimeout(() => {
      state.segmentTransitioning = false;
    }, 900);
  }

  function startEndMonitor() {
    if (state.endMonitorId !== null) return;

    state.endMonitorId = window.setInterval(() => {
      if (!state.playerReady || !state.player || state.segmentTransitioning) return;
      if (state.player.getPlayerState() !== YT.PlayerState.PLAYING) return;

      const segment = currentSegment();
      if (!segment || !Number.isFinite(segment.endSeconds)) return;

      const currentTime = state.player.getCurrentTime();
      if (Number.isFinite(currentTime) && currentTime >= segment.endSeconds - 0.25) {
        handleSegmentEnd();
      }
    }, 250);
  }

  window.onYouTubeIframeAPIReady = () => {
    const segment = playableEntries
      .flatMap((entry) => entry.chapters)
      .flatMap((chapter) => chapter.segments)
      .find((candidate) => candidate.sourceType === 'youtube' && candidate.videoId);
    if (!segment) return;
    const playerVars = {
      controls: 1,
      playsinline: 1,
      rel: 0
    };

    if (window.location.origin && window.location.origin !== 'null') {
      playerVars.origin = window.location.origin;
    }

    state.player = new YT.Player('youtube-player', {
      width: '1280',
      height: '720',
      videoId: segment.videoId,
      playerVars,
      events: {
        onReady: () => {
          state.playerReady = true;
          state.player.getIframe().referrerPolicy = 'strict-origin-when-cross-origin';
          elements.playPause.disabled = currentSegment()?.sourceType !== 'youtube';
          startEndMonitor();

          if (state.view === 'watch') {
            const shouldPlay = state.pendingLoadMode === 'play';
            loadCurrentSegment(shouldPlay);
          }
        },
        onStateChange: (event) => {
          if (currentSegment()?.sourceType !== 'youtube') return;
          setPlayingUi(event.data === YT.PlayerState.PLAYING);

          if (
            event.data === YT.PlayerState.ENDED &&
            performance.now() >= state.suppressEndedUntil
          ) {
            handleSegmentEnd();
          }
        },
        onError: (event) => {
          const messages = {
            2: 'The source video ID is invalid.',
            5: 'The browser could not play this video in the HTML5 player.',
            100: 'The source video is unavailable or private.',
            101: 'The uploader has disabled playback on other websites.',
            150: 'The uploader has disabled playback on other websites.',
            153: 'YouTube did not receive the referring site identity. Open The Sarkive through https://thesarkive.com/ instead of a local file copy.'
          };
          const segment = currentSegment();
          const reason = messages[event.data] || `YouTube returned player error ${event.data}.`;
          showPlayerMessage('YouTube could not load this video.', reason, segment ? segmentWatchUrl(segment) : '');
          setPlayingUi(false);
        }
      }
    });

    const initialVod = state.vodCurrent || vodIndexVods[0] || null;
    const initialVodCopy = initialVod
      ? ((Array.isArray(initialVod.copies) && initialVod.copies.find((copy) => copy?.videoId)) || { videoId: initialVod.id })
      : null;

    if (initialVodCopy?.videoId) {
      state.vodPlayer = new YT.Player('vod-youtube-player', {
        width: '1280',
        height: '720',
        videoId: initialVodCopy.videoId,
        playerVars,
        events: {
          onReady: () => {
            state.vodPlayerReady = true;
            state.vodPlayer.getIframe().referrerPolicy = 'strict-origin-when-cross-origin';
            elements.vodPlayPause.disabled = false;
            if (state.view === 'vod-watch') loadCurrentVod(state.vodPendingPlay);
          },
          onStateChange: (event) => {
            setVodPlayingUi(event.data === YT.PlayerState.PLAYING);
          },
          onError: (event) => {
            const messages = {
              2: 'The archived video ID is invalid.',
              5: 'The browser could not play this archived video.',
              100: 'This archive copy is unavailable or private.',
              101: 'The uploader has disabled playback on other websites.',
              150: 'The uploader has disabled playback on other websites.',
              153: 'YouTube did not receive the referring site identity. Open The Sarkive through https://thesarkive.com/ instead of a local file copy.'
            };
            showVodPlayerMessage('This archive copy could not load.', messages[event.data] || `YouTube returned player error ${event.data}.`);
            setVodPlayingUi(false);
          }
        }
      });
    }

    initSarkRadioPlayer();
    initNerdPokerPlayer();
  };

  function loadYouTubeApi() {
    if (!isHttpPage) {
      showPlayerMessage(
        'YouTube needs the site to be served over HTTP.',
        'Open The Sarkive through https://thesarkive.com/. Opening index.html directly gives YouTube no referring site, so it blocks the embed.'
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.onerror = () => {
      showPlayerMessage('The YouTube player script did not load.', 'Check the connection and reload the page.');
    };
    document.head.append(script);
  }

  elements.siteSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = elements.siteSearchInput.value.trim();
    if (!query) {
      elements.siteSearchInput.focus();
      return;
    }
    showSearchPage(query);
  });

  elements.searchFilterButton.addEventListener('click', () => {
    setSearchFiltersOpen(!state.searchFiltersOpen);
  });

  elements.searchFilterReset.addEventListener('click', () => {
    resetSearchFilters();
  });

  document.addEventListener('click', (event) => {
    if (!state.searchFiltersOpen) return;
    if (elements.searchFilterShell.contains(event.target)) return;
    setSearchFiltersOpen(false);
  });

  elements.menuToggle.addEventListener('click', () => {
    if (usesDrawerNavigation()) {
      state.navOverlayOpen = !state.navOverlayOpen;
    } else {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }
    syncNavigationShell();
  });

  elements.brandHome.addEventListener('click', () => {
    state.navOverlayOpen = false;
    showHomePage();
  });

  elements.categoryBack.addEventListener('click', () => {
    state.navOverlayOpen = false;
    if (state.view === 'tag') {
      showCategoriesPage();
    } else {
      showHomePage();
    }
  });

  elements.navScrim.addEventListener('click', closeNavigationOverlay);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.searchFiltersOpen) {
      setSearchFiltersOpen(false);
      elements.searchFilterButton.focus();
      return;
    }
    if (state.navOverlayOpen) {
      closeNavigationOverlay();
      elements.menuToggle.focus();
    }
  });

  [drawerNavQuery, railNavQuery].forEach((query) => query.addEventListener('change', () => {
    state.navOverlayOpen = false;
    syncNavigationShell();
  }));

  elements.gamePlay.addEventListener('click', () => {
    if (!state.game || state.contentType !== 'game') return;
    selectEntry(state.game.id, state.game.chapters[0].id, 0, true, 'game');
  });

  elements.podcastPlay.addEventListener('click', () => {
    if (!state.game || state.contentType !== 'podcast') return;
    selectEntry(state.game.id, state.game.chapters[0].id, 0, true, 'podcast');
  });

  elements.gameGroupSelect.addEventListener('change', () => {
    if (!state.game || state.view !== 'game-detail') return;
    renderDetailEpisodes(state.game, elements.gameGroupSelect.value, 'game');
  });

  elements.podcastGroupSelect.addEventListener('change', () => {
    if (!state.game || state.view !== 'podcast-detail') return;
    renderDetailEpisodes(state.game, elements.podcastGroupSelect.value, 'podcast');
  });

  elements.watchGroupSelect.addEventListener('change', () => {
    if (!state.game || state.view !== 'watch') return;
    renderWatchChapterList(elements.watchGroupSelect.value);
    elements.chapterList.querySelectorAll('.chapter-button').forEach((button) => {
      const isActive = button.dataset.chapterId === state.chapter.id;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  });

  elements.marblesPlayerSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.view !== 'marbles-scores') return;
    submitMarblesPlayerSearch();
  });

  elements.marblesPlayerSearchInput.addEventListener('input', () => {
    if (state.view !== 'marbles-scores') return;
    showMarblesPlayerSearchResults(elements.marblesPlayerSearchInput.value);
  });

  elements.marblesPlayerSearchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    clearMarblesPlayerSearchResults();
    elements.marblesPlayerSearchInput.blur();
  });

  elements.marblesPlayerSearchInput.addEventListener('blur', () => {
    window.setTimeout(clearMarblesPlayerSearchResults, 120);
  });

  elements.marblesRaceSelect.addEventListener('change', () => {
    if (state.view !== 'marbles-scores') return;
    clearMarblesPlayerSearchResults();
    renderMarblesScores(elements.marblesRaceSelect.value);
  });

  elements.marblesBackScorecard.addEventListener('click', () => {
    if (state.view !== 'marbles-scores') return;
    const selection = marblesRacesById.has(marblesScorecardReturnSelection)
      ? marblesScorecardReturnSelection
      : 'top-ten';
    elements.marblesRaceSelect.value = selection;
    renderMarblesScores(selection);
  });

  elements.marblesWatchRace.addEventListener('click', () => {
    if (state.view !== 'marbles-scores') return;
    const raceId = elements.marblesWatchRace.dataset.raceId;
    if (!raceId || !marblesRacesById.has(raceId) || !marblesRaceChaptersById.has(raceId)) return;
    selectEntry('marbles-on-stream', raceId, 0, true, 'game');
  });

  elements.nerdPokerPlay.addEventListener('click', toggleNerdPokerPlayback);
  elements.nerdPokerPrevious.addEventListener('click', () => stepNerdPokerEpisode(-1));
  elements.nerdPokerNext.addEventListener('click', () => stepNerdPokerEpisode(1));
  elements.nerdPokerDockArtwork.addEventListener('error', () => {
    elements.nerdPokerDockArtwork.hidden = true;
  });

  elements.sarkRadioPlay.addEventListener('click', toggleSarkRadioPlayback);
  elements.sarkRadioPrevious.addEventListener('click', selectPreviousSarkRadioTrack);
  elements.sarkRadioDockArtwork.addEventListener('error', () => {
    elements.sarkRadioDockArtwork.hidden = true;
  });
  elements.sarkRadioNext.addEventListener('click', () => {
    if (!sarkRadio.tracks.length) return;
    sarkRadio.started = true;
    selectNextSarkRadioTrack(true);
  });
  elements.sarkTvPlayPause.addEventListener('click', toggleSarkTvPlayback);
  elements.sarkTvNext.addEventListener('click', stepSarkTv);
  elements.sarkTvPlayer.addEventListener('play', () => {
    setSarkTvPlayingUi(true);
    elements.sarkTvStatus.textContent = 'NOW PLAYING';
  });
  elements.sarkTvPlayer.addEventListener('playing', () => {
    setSarkTvPlayingUi(true);
    elements.sarkTvStatus.textContent = 'NOW PLAYING';
  });
  elements.sarkTvPlayer.addEventListener('pause', () => {
    if (sarkTvSwitching || elements.sarkTvPlayer.ended) return;
    setSarkTvPlayingUi(false);
    elements.sarkTvStatus.textContent = 'PAUSED';
  });
  elements.sarkTvPlayer.addEventListener('ended', () => {
    setSarkTvPlayingUi(true);
    advanceSarkTvAfterEnd();
  });
  elements.sarkTvPlayer.addEventListener('error', () => {
    if (sarkTvSwitching) return;
    console.warn('SarkTV media error; skipping clip', state.sarkTvSlug);
    advanceSarkTvAfterEnd();
  });
  elements.playPause.addEventListener('click', togglePlayback);
  elements.backroomsWatchBack?.addEventListener('click', returnToBackroomsArchive);
  elements.previousChapter.addEventListener('click', () => stepChapter(-1));
  elements.nextChapter.addEventListener('click', () => stepChapter(1));

  elements.vodCalendarPrevious?.addEventListener('click', () => stepVodCalendarMonth(-1));
  elements.vodCalendarNext?.addEventListener('click', () => stepVodCalendarMonth(1));
  elements.vodClearDate?.addEventListener('click', () => {
    state.vodSelectedDate = '';
    state.vodQuery = '';
    elements.vodSearch.value = '';
    elements.vodDateJump.value = '';
    renderVodCalendar();
    renderVodResults(true);
    history.replaceState(null, '', '#page=vod-index');
  });
  elements.vodDateJump?.addEventListener('change', () => {
    const date = String(elements.vodDateJump.value || '').trim();
    if (!vodDateParts(date)) return;
    state.vodSelectedDate = date;
    state.vodQuery = '';
    elements.vodSearch.value = '';
    setVodCalendarFromDate(date);
    renderVodCalendar();
    renderVodResults(true);
    history.replaceState(null, '', `#page=vod-index&date=${encodeURIComponent(date)}`);
  });
  elements.vodSearch?.addEventListener('input', () => {
    state.vodQuery = String(elements.vodSearch.value || '').trim();
    if (state.vodQuery) {
      state.vodSelectedDate = '';
      elements.vodDateJump.value = '';
      history.replaceState(null, '', '#page=vod-index');
    }
    renderVodCalendar();
    renderVodResults(true);
  });
  elements.vodLoadMore?.addEventListener('click', () => {
    state.vodVisibleLimit += 60;
    renderVodResults(false);
  });
  elements.vodRandom?.addEventListener('click', () => {
    const pool = currentVodResults();
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openVodFromIndex(pick, '', true);
  });
  elements.vodBack?.addEventListener('click', returnToVodIndex);
  elements.vodPlayPause?.addEventListener('click', toggleVodPlayback);
  elements.vodCopySelect?.addEventListener('change', () => {
    if (!state.vodCurrent) return;
    const index = Number.parseInt(elements.vodCopySelect.value, 10);
    const copies = vodCopies();
    if (!Number.isInteger(index) || !copies[index]) return;
    state.vodCopyIndex = index;
    renderVodPlayerDetails();
    loadCurrentVod(true);
    const copy = currentVodCopy();
    history.replaceState(null, '', vodInternalUrl(state.vodCurrent, copy?.videoId || ''));
  });

  renderSiteMenu();
  renderPals();
  renderHomeShelves();

  elements.shopPage?.querySelectorAll('.shop-product-image').forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
      image.closest('.shop-product-image-shell')?.classList.add('is-missing');
    }, { once: true });
  });

  const initial = routeFromUrl();
  if (initial.view === 'watch') {
    selectEntry(initial.entry.id, initial.chapter.id, initial.segmentIndex, false, initial.contentType);
  } else if (initial.view === 'backrooms-watch') {
    selectBackroomsWatch(initial.payload, false);
  } else if (initial.view === 'vod-watch') {
    showVodWatchPage(initial.vod.id, initial.copyId, false, false);
  } else if (initial.view === 'game-detail') {
    showGamePage(initial.entry.id);
  } else if (initial.view === 'podcast-detail') {
    showPodcastPage(initial.entry.id);
  } else if (initial.view === 'nerd-poker') {
    showNerdPokerPage();
  } else if (initial.view === 'category') {
    showCategoryPage(initial.category.id);
  } else if (initial.view === 'tag') {
    showTagPage(initial.tag.key);
  } else if (initial.view === 'search') {
    showSearchPage(initial.query);
  } else if (initial.view === 'marbles-scores') {
    showMarblesScoresPage();
  } else if (initial.view === 'sark-tv') {
    showSarkTvPage();
  } else if (initial.view === 'sark-radio') {
    showSarkRadioPage();
  } else if (initial.view === 'vod-index') {
    showVodIndexPage(initial.date);
  } else if (initial.view === 'backrooms') {
    showBackroomsPage(initial);
  } else if (initial.view === 'categories') {
    showCategoriesPage();
  } else if (initial.view === 'shop') {
    showShopPage();
  } else if (initial.view === 'sark-links') {
    showSarkLinksPage();
  } else if (initial.view === 'pals') {
    showPalsPage();
  } else if (initial.view === 'about') {
    showAboutPage();
  } else if (initial.view === 'coming-soon') {
    showComingSoonPage(initial.page);
  } else {
    showHomePage();
  }

  loadYouTubeApi();
})();
