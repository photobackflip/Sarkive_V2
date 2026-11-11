/* Viewer pages consume the assembled archive; playback stays with the existing app. */
(() => {
  'use strict';
  const page = document.querySelector('#archive-page');
  let bridge, ticket = 0, indexesPromise;
  const cache = new Map();
  const search=window.SARKIVE_SEARCH;
  const goldenKappaTrains=new Map(Object.entries(window.SARKIVE_GOLDEN_KAPPA_TRAINS));
  const filters = {query:'', guest:'', type:'', year:'', scope:'default', mode:'footage', goldenKappa:false, facets:search.blank()};
  const gameFilters={query:'',letter:'',sort:'az',facets:search.blank()};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => Number(n || 0).toLocaleString();
  const dateLabel = (day, short=false) => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:short?'short':'long',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));
  const dateBadge = day => {
    const month=new Intl.DateTimeFormat('en-GB',{month:'short',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));
    return `<time class="archive-date-badge" datetime="${esc(day)}" aria-label="${esc(dateLabel(day))}"><span class="archive-date-month" aria-hidden="true">${esc(month)}</span><span class="archive-date-day" aria-hidden="true">${Number(day.slice(8,10))}</span><span class="archive-date-year" aria-hidden="true">${esc(day.slice(0,4))}</span></time>`;
  };
  const duration = seconds => {
    if (seconds == null) return '';
    const s = Math.round(seconds), h = Math.floor(s/3600), m = Math.floor(s/60)%60;
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` : `${m}:${String(s%60).padStart(2,'0')}`;
  };
  const link = (href, text, cls='') => `<a data-archive href="${esc(href)}" class="${cls}">${text}</a>`;
  const chips = people => (people || []).map(p => `<span class="archive-chip">${esc(p.name)}</span>`).join('');
  const image = (src, cls='', alt='') => src ? `<img class="${cls}" loading="lazy" src="${esc(src)}" alt="${esc(alt)}">` : `<span class="archive-art-placeholder ${cls}" aria-hidden="true">SARKIVE</span>`;
  async function read(name) {
    if (!cache.has(name)) cache.set(name, fetch('archive/'+name+'.json').then(r => {if (!r.ok) throw new Error(`Could not load ${name}`); return r.json();}).catch(e => {cache.delete(name); throw e;}));
    return cache.get(name);
  }
  const clipCount = count => `${number(count)} clip${count===1?'':'s'}`;
  const clipList = (kind, id) => read(`clips/${kind}/${encodeURIComponent(id)}`);
  const clipHref = (slug, kind, id) => '#' + new URLSearchParams({page:'clip', clip:slug, from:kind, id});
  function gameClipRow(clip, position, entityId) {
    const title = `<span class="archive-chapter-copy"><strong>${esc(clip.title)}</strong></span>`;
    const index = `<span class="archive-chapter-number">${String(position).padStart(2,'0')}</span>`;
    const runtime = `<span class="archive-chapter-runtime">${duration(clip.durationSeconds)}</span>`;
    const date = clip.streamDate
      ? link('#page=stream&date='+encodeURIComponent(clip.streamDate),esc(dateLabel(clip.streamDate,true)))
      : '';
    const play = link(clipHref(clip.id,'entities',entityId),index+image(clip.thumbnail,'archive-chapter-thumb')+title+runtime,'archive-chapter-main');
    return `<article class="archive-chapter-row">${play}<div class="archive-chapter-dates">${date}</div></article>`;
  }
  async function drawClips(mount, kind, id, count) {
    if (!count) {
      mount.innerHTML = '<p class="archive-empty">No clips are linked.</p>';
      return;
    }
    mount.innerHTML = '<p class="archive-loading" role="status">Loading clips…</p>';
    try {
      const clips = await clipList(kind,id);
      if (!mount.isConnected) return;
      const game = kind === 'entities';
      const layout = game ? 'archive-game-clip-list' : 'archive-vod-grid archive-clip-tile-grid';
      mount.innerHTML = `<div class="${layout}"></div><button class="archive-button archive-clips-more" type="button">Show more clips</button>`;
      const list = mount.firstElementChild;
      const more = mount.querySelector('button');
      let offset = 0;
      const append = () => {
        const batch = clips.slice(offset, offset + 24);
        list.insertAdjacentHTML('beforeend', batch.map((c,i) => {
          if (game) return gameClipRow(c,offset+i+1,id);
          const title = esc(c.title);
          const label = `<strong title="${title}">${title}</strong>`;
          return `<article class="archive-vod-card">${link(clipHref(c.id,kind,id),image(c.thumbnail,'archive-vod-image') + label)}</article>`;
        }).join(''));
        offset += batch.length;
        more.hidden = offset >= clips.length;
      };
      more.onclick = () => {
        const previous = offset;
        append();
        list.children[previous]?.querySelector('a')?.focus();
      };
      append();
    } catch (_) {
      if (mount.isConnected) mount.innerHTML = '<p class="archive-empty">Could not load clips. Reopen this page to try again.</p>';
    }
  }
  function indexes() {
    return indexesPromise ||= window.SARKIVE_CATALOGUE ? Promise.resolve(window.SARKIVE_CATALOGUE) : Promise.all([read('dates-index'),read('games-index')]).then(([dates,games]) => ({dates,games}));
  }
  function begin(nav, href) {
    window.SARKIVE_RESPONSIVE.cleanup();
    bridge.prepare(nav);
    const current = ++ticket;
    page.hidden = false;
    page.innerHTML = '<p class="archive-loading" role="status">Loading…</p>';
    window.SARKIVE_NAV.commit(null,'',href);
    if(!window.SARKIVE_NAV.returning) window.scrollTo(0,0);
    return current;
  }
  function failed(error, current) {
    if (current !== ticket) return;
    page.innerHTML = `<h1>Could not open this page</h1><p>${esc(error.message)}</p><button class="archive-button" data-retry>Try again</button>`;
    page.querySelector('[data-retry]').onclick = () => route(new URLSearchParams(location.hash.slice(1)));
  }
  function gameCard(game) {
    return link(game.href,`${image(game.image,'archive-cover')}<span>${esc(game.title)}</span>`,'archive-game-card');
  }
  function footageKind(d) {
    if (d.footageKinds?.includes('vod')) return 'full';
    if (d.footageKinds?.some(k => ['partial','split'].includes(k))) return 'partial';
    if (d.vodCount) return 'other';
    return d.clipCount ? 'clips' : 'unavailable';
  }
  function matchesStreamFilters(d) {
    return search.query(d,filters.query) &&
      (!filters.guest || d.people.some(p => p.id===filters.guest)) &&
      (!filters.type || (d.streamTypes || []).includes(filters.type)) &&
      (!filters.goldenKappa || goldenKappaTrains.has(d.date));
  }
  function streamDateLink(d) {
    return link(d.href,`${dateBadge(d.date)}${image(d.thumbnail,'archive-date-thumb')}<span class="archive-date-copy"><strong>${esc(d.title || d.dateLabel)}</strong><small>${d.broadcastCount?`${d.broadcastCount} broadcast${d.broadcastCount===1?'':'s'} · `:''}${d.vodCount} VOD${d.vodCount===1?'':'s'}${d.clipCount?` · ${clipCount(d.clipCount)}`:''}</small><span class="archive-chips">${chips(d.people)}</span></span>`,'archive-date-main');
  }
  function dateGames(d) {
    if (!d.games.length) return '';
    const arrow=(direction,path)=>`<button type="button" class="archive-shelf-arrow archive-date-arrow archive-date-arrow--${direction}" aria-label="${direction==='previous'?'Previous':'Next'} games for ${esc(dateLabel(d.date))}" hidden><svg aria-hidden="true" viewBox="0 0 24 24"><path d="${path}"/></svg></button>`;
    return `<div class="archive-date-games" style="--game-count:${d.games.length}">${arrow('previous','m14 6-6 6 6 6')}<div class="archive-date-games-track">${d.games.map(g=>`<a data-archive href="${esc(g.href)}" class="archive-mini-cover" aria-label="${esc(g.title)}" title="${esc(g.title)}">${image(g.image,'',g.title)}</a>`).join('')}</div>${arrow('next','m10 6 6 6-6 6')}</div>`;
  }
  function syncDateGameArrows(shelf) {
    const track=shelf.querySelector('.archive-date-games-track');
    const end=track.scrollWidth-track.clientWidth;
    shelf.querySelector('.archive-date-arrow--previous').hidden=track.clientWidth===0 || track.scrollLeft<=2;
    shelf.querySelector('.archive-date-arrow--next').hidden=track.clientWidth===0 || track.scrollLeft>=end-2;
  }
  function bindDateGameShelves() {
    page.querySelectorAll('.archive-date-games').forEach(shelf=>{
      const track=shelf.querySelector('.archive-date-games-track');
      track.addEventListener('scroll',()=>syncDateGameArrows(shelf),{passive:true});
      shelf.querySelectorAll('.archive-date-arrow').forEach(button=>button.onclick=()=>track.scrollBy({left:(track.clientWidth+4)*(button.classList.contains('archive-date-arrow--previous')?-1:1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
      syncDateGameArrows(shelf);
    });
  }
  window.addEventListener('resize',()=>page.querySelectorAll('.archive-date-games').forEach(syncDateGameArrows),{passive:true});
  function goldenKappaStats() {
    const byYear=new Map();
    let total=0;
    for (const [day,count] of goldenKappaTrains) {
      const year=day.slice(0,4);
      byYear.set(year,(byYear.get(year) || 0)+count);
      total+=count;
    }
    const yearStats=[...byYear].sort(([a],[b])=>a.localeCompare(b)).map(([year,count])=>`<span><b>${number(count)}</b> in ${esc(year)}</span>`).join('');
    return `<div id="archive-golden-kappa-stats" class="archive-stats archive-golden-kappa-stats" role="group" aria-label="Golden Kappa Train statistics"${filters.goldenKappa?'':' hidden'}><span><b>${number(total)}</b> confirmed scam trains</span><span><b>${number(goldenKappaTrains.size)}</b> streams with a scam train</span>${yearStats}</div>`;
  }
  async function streams(initialDate='') {
    if (initialDate) return date(initialDate);
    const current=begin('streams','#page=streams');
    try {
      const {dates}=await indexes(); if (current!==ticket) return;
      const years=[...new Set(dates.map(d => d.date.slice(0,4)))].sort().reverse();
      if (!years.includes(filters.year)) filters.year=years[0];
      const people=[...new Map(dates.flatMap(d=>d.people || []).map(p=>[p.id,p])).values()].sort((a,b)=>a.name.localeCompare(b.name));
      document.title='The Sarkive | Streams';
      page.innerHTML=`<header class="archive-heading"><p class="archive-eyebrow">THE SARKIVE · BROADCAST ARCHIVE</p><h1>STREAMS</h1><p>Find a stream by date, game, guest or the kind of night it was.</p><div class="archive-stats"><span><b>${number(dates.reduce((n,d)=>n+d.broadcastCount,0))}</b> broadcasts</span><span><b>${years.at(-1)}–${years[0]}</b> on record</span><span><b>${number(dates.filter(d=>d.vodCount).length)}</b> dates with footage</span></div></header>
      <div class="archive-filters archive-stream-toolbar"><label class="archive-search"><span class="visually-hidden">Filter by game, title or guest</span><input id="archive-filter" type="search" placeholder="Filter by game, title or guest…" value="${esc(filters.query)}"></label><button type="button" id="archive-golden-kappa" class="archive-golden-kappa" aria-label="Golden Kappa" title="Golden Kappa" aria-pressed="${filters.goldenKappa}" aria-controls="archive-calendar archive-date-results"><img src="assets/img/golden-kappa.png" width="22" height="29" alt=""></button><details id="archive-guest" class="archive-guest-picker"><summary aria-label="Guest"><span id="archive-guest-label">${esc(people.find(p=>p.id===filters.guest)?.name || 'Any guest')}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></summary><div class="archive-guest-panel"><label><span class="visually-hidden">Find a guest</span><input id="archive-guest-search" type="search" placeholder="Find a guest…" autocomplete="off"></label><div class="archive-guest-options" aria-label="Choose a guest">${[{id:'',name:'Any guest'},...people].map(p=>`<button type="button" data-guest="${esc(p.id)}" aria-pressed="${p.id===filters.guest}">${esc(p.name)}</button>`).join('')}</div><p id="archive-guest-empty" role="status" hidden>No guests match.</p></div></details><label><span class="visually-hidden">Stream type</span><select id="archive-stream-type"><option value="">Any stream</option>${['Co-op','Solo play','With guests','Backrooms','VR','VR coasters','IRL'].filter(t=>dates.some(d=>(d.streamTypes || []).includes(t))).map(t=>`<option value="${esc(t)}" ${t===filters.type?'selected':''}>${esc(t)}</option>`).join('')}</select></label>${search.shell('stream-facets','FILTER STREAMS')}<button class="archive-button" id="archive-reset">Reset</button></div>
      ${goldenKappaStats()}
      <div class="archive-calendar-shell"><div class="archive-calendar-top"><h2 id="archive-calendar-year" class="visually-hidden"></h2><div id="archive-years" class="archive-tabs" aria-label="Year"><button data-year="" aria-pressed="false">All years</button>${years.map(y=>`<button data-year="${y}" aria-pressed="${y===filters.year}">${y} <small>${dates.filter(d=>d.date.startsWith(y)).length}</small></button>`).join('')}</div><div class="archive-tabs archive-mode"><button data-mode="footage" aria-pressed="${filters.mode==='footage'}">Footage</button><button data-mode="length" aria-pressed="${filters.mode==='length'}">Length</button></div></div><div id="archive-calendar" class="archive-calendar-years"></div><div class="archive-legend"><span class="full">Full VOD</span><span class="partial">Partial / split</span><span class="other">Other footage</span><span class="clips">Clips only</span><span class="unavailable">No VOD or clips</span></div></div><div class="archive-section-heading"><h2 id="archive-results-title">Dates</h2><p id="archive-result-count" role="status"></p></div><div id="archive-date-results"></div>`;
      const draw=()=>{drawStreams(dates);refreshFacets();window.SARKIVE_RESPONSIVE.sync();};
      page.querySelector('#archive-filter').oninput=e=>{filters.query=e.target.value;draw();};
      const goldenKappaButton=page.querySelector('#archive-golden-kappa');
      const goldenKappaSummary=page.querySelector('#archive-golden-kappa-stats');
      goldenKappaButton.onclick=()=>{
        filters.goldenKappa=!filters.goldenKappa;
        goldenKappaButton.setAttribute('aria-pressed',String(filters.goldenKappa));
        goldenKappaSummary.hidden=!filters.goldenKappa;
        draw();
      };
      const guestPicker=page.querySelector('#archive-guest'),guestInput=page.querySelector('#archive-guest-search');
      const filterGuests=()=>{const query=search.normalize(guestInput.value);let visible=0;guestPicker.querySelectorAll('[data-guest]').forEach(b=>{b.hidden=!!query&&!search.normalize(b.textContent).includes(query);if(!b.hidden)visible++;});page.querySelector('#archive-guest-empty').hidden=!!visible;};
      guestInput.oninput=filterGuests;
      guestPicker.addEventListener('toggle',()=>{if(guestPicker.open){guestInput.value='';filterGuests();guestInput.focus({preventScroll:true});}});
      guestPicker.querySelectorAll('[data-guest]').forEach(b=>b.onclick=()=>{filters.guest=b.dataset.guest;page.querySelector('#archive-guest-label').textContent=b.textContent;guestPicker.querySelectorAll('[data-guest]').forEach(option=>option.setAttribute('aria-pressed',option===b));guestPicker.open=false;guestPicker.querySelector('summary').focus({preventScroll:true});draw();});
      guestPicker.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();guestPicker.open=false;guestPicker.querySelector('summary').focus();}else if(e.key==='ArrowDown'&&e.target===guestInput){e.preventDefault();[...guestPicker.querySelectorAll('[data-guest]')].find(b=>!b.hidden)?.focus();}};
      page.querySelector('#archive-stream-type').onchange=e=>{filters.type=e.target.value;draw();};
      const panel=search.bindShell(page,'stream-facets',()=>{filters.facets=search.blank();draw();});
      const refreshFacets=()=>{search.controls(panel.body,dates.filter(matchesStreamFilters),filters.facets,draw,{year:false,guest:false,blocks:false});panel.badge(search.count(filters.facets));};
      page.querySelector('#archive-reset').onclick=()=>{filters.query='';filters.guest='';filters.type='';filters.goldenKappa=false;filters.facets=search.blank();filters.scope='default';streams();};
      page.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{filters.scope=b.dataset.year;if(b.dataset.year)filters.year=b.dataset.year;draw();});
      page.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{filters.mode=b.dataset.mode;draw();});
      draw();
      window.SARKIVE_RESPONSIVE.mount('streams');
    } catch(e) {failed(e,current);}
  }
  function drawStreams(dates) {
    const all=new Map(dates.map(d=>[d.date,d]));
    const filtered=dates.filter(d=>matchesStreamFilters(d) && search.matches(d,filters.facets)), found=new Set(filtered.map(d=>d.date));
    const active=!!(filters.query || filters.guest || filters.type || search.count(filters.facets));
    const scopedYear=filters.scope==='default'?(active?'':filters.year):filters.scope;
    const results=filtered.filter(d=>!scopedYear||d.date.startsWith(scopedYear));
    page.querySelector('#archive-calendar-year').textContent=filters.year;
    page.querySelectorAll('[data-year]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.year===scopedYear));
    page.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===filters.mode));
    const calendar=page.querySelector('#archive-calendar');
    const years=scopedYear?[scopedYear]:[...new Set(dates.map(d=>d.date.slice(0,4)))].sort().reverse();
    // Search only updates matching-date highlights; retain the larger calendar DOM.
    const renderKey=JSON.stringify([years,filters.mode]);
    if(calendar.dataset.renderKey!==renderKey) {
      const monthCounts=new Map();
      dates.forEach(d=>{const key=d.date.slice(0,7);monthCounts.set(key,(monthCounts.get(key)||0)+1);});
      calendar.classList.toggle('is-all-years',years.length>1);
      calendar.innerHTML=years.map(year=>{
        const months=[];
        for(let month=0;month<12;month++) {
          const first=new Date(Date.UTC(Number(year),month,1)), start=(first.getUTCDay()+6)%7, days=new Date(Date.UTC(Number(year),month+1,0)).getUTCDate();
          const cells=Array.from({length:start},()=>'<span class="archive-day empty"></span>');
          for(let n=1;n<=days;n++) {
            const day=`${year}-${String(month+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`, d=all.get(day);
            if (!d) cells.push(`<span class="archive-day" title="${esc(dateLabel(day))}"><span>${n}</span></span>`);
            else {
              const hint=`${dateLabel(day)} · ${d.broadcastCount?`${d.broadcastCount} broadcast${d.broadcastCount===1?'':'s'} · `:''}${d.vodCount} VOD${d.vodCount===1?'':'s'}${d.title?' · '+d.title:''}`;
              const alpha=filters.mode==='length'&&d.durationSeconds?Math.max(.25,Math.min(1,d.durationSeconds/36000)):1;
              cells.push(`<a data-date="${day}" data-archive class="archive-day recorded ${footageKind(d)} ${found.has(day)?'':'dim'}" href="${esc(d.href)}" aria-label="${esc(hint)}" title="${esc(hint)}" style="--day-strength:${alpha}"><span>${n}</span>${d.broadcastCount>1?'<i></i>':''}</a>`);
            }
          }
          months.push(`<section class="archive-month" data-month="${month}"><h3>${new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'}).format(first)} <small>${monthCounts.get(`${year}-${String(month+1).padStart(2,'0')}`)||0}</small></h3><div class="archive-weekdays" aria-hidden="true">${'MTWTFSS'.split('').map(x=>`<span>${x}</span>`).join('')}</div><div class="archive-days">${cells.join('')}</div></section>`);
        }
        return `<section class="archive-calendar-year-group" data-calendar-year="${year}" aria-labelledby="archive-year-heading-${year}"><h3 class="archive-calendar-year-heading" id="archive-year-heading-${year}">${year}</h3><div class="archive-calendar">${months.join('')}</div></section>`;
      }).join('');
      calendar.dataset.renderKey=renderKey;
    }
    calendar.querySelectorAll('.archive-day.recorded').forEach(cell=>{
      const matched=found.has(cell.dataset.date);
      cell.classList.toggle('dim',!matched);
      cell.classList.toggle('is-golden-kappa',filters.goldenKappa && matched);
    });
    page.querySelector('#archive-results-title').textContent=filters.goldenKappa
      ? `${scopedYear ? scopedYear+' ' : ''}Golden Kappa dates`
      : scopedYear?`${scopedYear} dates`:'Matching dates';
    page.querySelector('#archive-result-count').textContent=`${number(results.length)} date${results.length===1?'':'s'}`;
    page.querySelector('#archive-date-results').innerHTML=results.length?results.map(d=>`<article class="archive-date-row${filters.goldenKappa?' is-golden-kappa':''}">${streamDateLink(d)}${dateGames(d)}</article>`).join(''):'<p class="archive-empty">No dates match these filters.</p>';
    bindDateGameShelves();
    window.SARKIVE_RESPONSIVE.sync();
  }
  async function date(day) {
    const current=begin('streams','#page=stream&date='+encodeURIComponent(day));
    try {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Choose a date from Streams.');
      const d=await read('dates/'+day);if(current!==ticket)return;
      const {dates}=await indexes();if(current!==ticket)return;
      const ordered=dates.slice().sort((a,b)=>a.date.localeCompare(b.date));
      const previous=ordered.filter(x=>x.date<day).at(-1), next=ordered.find(x=>x.date>day);
      const personKey=name=>name.toLowerCase().replace(/[^a-z0-9]/g,'');
      const knownGuests=new Map(dates.flatMap(x=>x.people || []).map(p=>[personKey(p.name),p]));
      const guests=d.people.length?d.people:[...new Set(((d.title || '').match(/@([a-z0-9_]+)/gi) || []).map(handle=>handle.slice(1)))].map(handle=>knownGuests.get(personKey(handle)) || {name:handle});
      const adjacent=(record,direction)=>record?`<a data-archive href="${esc(record.href)}" class="archive-stream-neighbour discovery-back-button" aria-label="${direction==='previous'?'Previous':'Next'} stream: ${esc(dateLabel(record.date,true))}">${direction==='previous'?'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg>':''}<span>${esc(dateLabel(record.date,true))}</span>${direction==='next'?'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg>':''}</a>`:'';
      document.title='The Sarkive | '+d.dateLabel;
      const history=d.broadcasts.flatMap((b,i)=>b.titleHistory.map(t=>`<li>${d.broadcasts.length>1?`<small>Broadcast ${i+1}</small> `:''}${esc(t.title)}</li>`));
      page.innerHTML=`<div class="archive-date-page">${window.SARKIVE_NAV.bar(`<nav class="archive-stream-navigation" aria-label="Adjacent stream dates">${adjacent(previous,'previous')}${adjacent(next,'next')}</nav>`)}<header class="archive-heading archive-stream-heading"><h1>${esc(d.dateLabel)}</h1>${d.title?`<p class="archive-stream-title">${esc(d.title)}</p>`:''}<div class="archive-stream-info">${history.length?'<button type="button" class="archive-stream-history-toggle" aria-expanded="false" aria-controls="archive-stream-title-history">Title history</button>':''}<div class="archive-stats">${d.broadcasts.length?`<span><b>${d.broadcasts.length}</b> broadcast${d.broadcasts.length===1?'':'s'}</span>`:''}<span><b>${d.vods.length}</b> VOD${d.vods.length===1?'':'s'}</span><span><b>${d.games.length}</b> game${d.games.length===1?'':'s'}</span>${d.clipCount?`<span><b>${number(d.clipCount)}</b> clip${d.clipCount===1?'':'s'}</span>`:''}</div>${guests.length?`<div class="archive-stream-guests"><span class="archive-stream-with">With</span><div class="archive-chips">${chips(guests)}</div></div>`:''}</div>${history.length?`<div id="archive-stream-title-history" class="archive-stream-title-history" hidden><ol>${history.join('')}</ol></div>`:''}</header>
      <section><h2>VODS</h2><div class="archive-vod-grid">${d.vods.map(v=>`<article class="archive-vod-card">${link(v.playHref,`${image(v.thumbnail,'archive-vod-image')}<strong>${esc(v.title)}</strong><small>${esc(v.copies[0]?.channel || '')}${v.durationSeconds?` · ${duration(v.durationSeconds)}`:''}</small>`)}${v.copies.length>1?`<details><summary>${v.copies.length} copies</summary>${v.copies.map(c=>link(c.playHref,esc(c.channel || c.title || c.videoId))).join('')}</details>`:''}</article>`).join('')}</div>${!d.vods.length?'<p class="archive-empty">No surviving VOD is linked to this date.</p>':''}</section>
      ${d.games.length?`<section><h2>PLAYED THIS STREAM</h2><div class="archive-game-grid">${d.games.map(gameCard).join('')}</div></section>`:''}
      ${d.otherContent.length?`<section><h2>ALSO ON THIS DATE</h2><div class="archive-game-grid">${d.otherContent.map(gameCard).join('')}</div></section>`:''}
      ${d.clipCount?`<section class="archive-date-clips"><h2>CLIPS</h2><div id="archive-date-clips"></div></section>`: ''}</div>`;
      if(d.clipCount) drawClips(page.querySelector('#archive-date-clips'),'dates',day,d.clipCount);
      const historyToggle=page.querySelector('.archive-stream-history-toggle');
      if(historyToggle) historyToggle.onclick=()=>{
        const expanded=historyToggle.getAttribute('aria-expanded')!=='true';
        historyToggle.setAttribute('aria-expanded',String(expanded));
        page.querySelector('#archive-stream-title-history').hidden=!expanded;
      };
      window.SARKIVE_RESPONSIVE.mount('date');
    } catch(e) {failed(e,current);}
  }
  async function games(initialTags=null, browse=false) {
    if(initialTags!==null) gameFilters.facets.tags=new Set(initialTags.map(search.normalize));
    const gameHref=()=> '#page=games'+[...gameFilters.facets.tags].map(t=>'&tag='+encodeURIComponent(t)).join('');
    const current=begin('games',gameHref());
    try {
      const {games}=await indexes();if(current!==ticket)return;
      document.title='The Sarkive | Games';
      page.innerHTML=`<header class="archive-heading"><p class="archive-eyebrow">THE SARKIVE · GAME ARCHIVE</p><h1>GAMES</h1><p>Find a game by title, an old name, tag or guest. Narrow the list by block or when Sark played it.</p><div class="archive-stats"><span><b>${number(games.length)}</b> games</span><span><b>${number(games.filter(g=>g.blocks?.includes('Backrooms')).length)}</b> in the Backrooms block</span><span><b>${number(games.filter(g=>g.blocks?.includes('VR coasters')).length)}</b> in the VR coaster block</span></div></header>
      <div class="archive-filters archive-game-toolbar"><label class="archive-search"><span class="visually-hidden">Find a game</span><input type="search" id="archive-game-filter" placeholder="Search games, old titles, tags or guests…" value="${esc(gameFilters.query)}"></label><button type="button" class="archive-button game-category-toggle" id="game-category-toggle" aria-expanded="${browse}" aria-controls="game-category-browser"><span class="game-category-chevron" aria-hidden="true">›</span> Browse categories <small id="game-category-summary"></small></button>${search.shell('game-facets','FILTER GAMES')}<button class="archive-button" id="archive-game-reset">Reset</button></div>
      <div id="game-category-browser" class="game-category-browser" ${browse?'':'hidden'}><div class="game-category-tools"><label class="archive-search"><span class="visually-hidden">Find a category</span><input id="game-category-search" type="search" placeholder="Find a category…"></label><label><span class="visually-hidden">Sort categories</span><select id="game-category-sort"><option value="az">A–Z</option><option value="popular">Most games</option></select></label></div><div id="game-category-letters" class="archive-alphabet" role="group" aria-label="Filter categories by first letter"></div><div id="game-category-grid" class="game-category-grid"></div><div class="game-category-pagination"><button id="game-category-previous" class="archive-button" type="button">‹ Previous</button><span id="game-category-count" role="status"></span><button id="game-category-next" class="archive-button" type="button">Next ›</button></div></div><div class="archive-alphabet game-title-alphabet" role="group" aria-label="Filter games by first letter"></div><div class="game-results-summary"><div id="game-category-selected" class="game-category-selected" aria-label="Selected categories"></div><p id="archive-game-count" class="game-result-count" role="status"></p></div><div id="archive-game-results" class="archive-game-grid archive-catalogue"></div>`;
      const firstLetter=g=>{const l=search.normalize(g.title).charAt(0).toUpperCase();return /^[A-Z]$/.test(l)?l:'#';};
      const categoryMap=new Map();
      games.forEach(g=>new Map((g.tags||[]).map(t=>[search.normalize(t),t])).forEach((label,key)=>{if(!key)return;const t=categoryMap.get(key)||{key,label,count:0};t.count++;categoryMap.set(key,t);}));
      const categories=[...categoryMap.values()];
      let categoryQuery='',categoryLetter='',categorySort='az',categoryPage=0;
      const categoryFirst=t=>/^[A-Z]/.test(t.label.toUpperCase())?t.label[0].toUpperCase():'#';
      const drawCategories=()=>{
        const queried=categories.filter(t=>search.normalize(t.label).includes(search.normalize(categoryQuery)));
        const found=queried.filter(t=>!categoryLetter||categoryFirst(t)===categoryLetter).sort((a,b)=>(categorySort==='popular'?b.count-a.count:0)||a.label.localeCompare(b.label));
        const pages=Math.max(1,Math.ceil(found.length/36));categoryPage=Math.min(categoryPage,pages-1);
        page.querySelector('#game-category-summary').textContent=number(categories.length);
        page.querySelector('#game-category-letters').innerHTML=['All','#',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(l=>`<button type="button" data-category-letter="${l==='All'?'':l}" aria-pressed="${categoryLetter===(l==='All'?'':l)}" ${l!=='All'&&!queried.some(t=>categoryFirst(t)===l)?'disabled':''}>${l}</button>`).join('');
        page.querySelectorAll('[data-category-letter]').forEach(b=>b.onclick=()=>{categoryLetter=b.dataset.categoryLetter;categoryPage=0;drawCategories();});
        page.querySelector('#game-category-grid').innerHTML=found.length?found.slice(categoryPage*36,(categoryPage+1)*36).map(t=>`<button type="button" data-category="${esc(t.key)}" aria-pressed="${gameFilters.facets.tags.has(t.key)}"><span>${esc(t.label)}</span><small>${number(t.count)}</small></button>`).join(''):'<p class="archive-empty">No categories match. Try another name or letter.</p>';
        page.querySelector('#game-category-count').textContent=found.length?`${categoryPage*36+1}–${Math.min(found.length,(categoryPage+1)*36)} of ${number(found.length)} categories`:'0 categories';
        page.querySelector('#game-category-previous').disabled=categoryPage===0;page.querySelector('#game-category-next').disabled=categoryPage===pages-1;
        page.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{const key=b.dataset.category;const tags=gameFilters.facets.tags;if(tags.has(key))tags.delete(key);else tags.add(key);gameFilters.letter='';draw();page.querySelector(`[data-category="${CSS.escape(key)}"]`)?.focus({preventScroll:true});});
        page.querySelector('#game-category-selected').innerHTML=gameFilters.facets.tags.size?`<span>Match any:</span>`+[...gameFilters.facets.tags].map(key=>`<button class="archive-button" type="button" data-remove-category="${esc(key)}" aria-label="Remove ${esc(categoryMap.get(key)?.label||key)} category">${esc(categoryMap.get(key)?.label||key)} <span aria-hidden="true">×</span></button>`).join('')+'<button class="archive-button" type="button" id="game-category-clear">Clear categories</button>':'';
        page.querySelectorAll('[data-remove-category]').forEach(b=>b.onclick=()=>{gameFilters.facets.tags.delete(b.dataset.removeCategory);draw();});
        const clear=page.querySelector('#game-category-clear');if(clear)clear.onclick=()=>{gameFilters.facets.tags.clear();draw();};
      };
      const panel=search.bindShell(page,'game-facets',()=>{gameFilters.facets=search.blank();draw();});
      const draw=()=>{
        const queried=games.filter(g=>search.query(g,gameFilters.query));
        const filtered=queried.filter(g=>search.matches(g,gameFilters.facets));
        const found=search.sortGames(filtered.filter(g=>!gameFilters.letter||firstLetter(g)===gameFilters.letter),'az');
        page.querySelector('#archive-game-count').textContent=`${number(found.length)} of ${number(games.length)} games`;
        page.querySelector('#archive-game-results').innerHTML=found.length?found.map(gameCard).join(''):'<p class="archive-empty">No games match these filters. Try another tag or reset the filters.</p>';
        page.querySelector('.game-title-alphabet').innerHTML=['All','#',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(l=>`<button data-letter="${l==='All'?'':l}" aria-pressed="${gameFilters.letter===(l==='All'?'':l)}" ${l!=='All'&&!filtered.some(g=>firstLetter(g)===l)&&gameFilters.letter!==l?'disabled':''}>${l}</button>`).join('');
        page.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{gameFilters.letter=b.dataset.letter;draw();});
        search.controls(panel.body,queried,gameFilters.facets,draw,{game:true,tags:false});panel.badge(search.count(gameFilters.facets));
        drawCategories();window.SARKIVE_NAV.commit(null,'',gameHref());
        window.SARKIVE_RESPONSIVE.sync();
      };
      page.querySelector('#game-category-search').oninput=e=>{categoryQuery=e.target.value;categoryPage=0;drawCategories();};
      page.querySelector('#game-category-sort').onchange=e=>{categorySort=e.target.value;categoryPage=0;drawCategories();};
      page.querySelector('#game-category-previous').onclick=()=>{categoryPage--;drawCategories();};
      page.querySelector('#game-category-next').onclick=()=>{categoryPage++;drawCategories();};
      page.querySelector('#archive-game-filter').oninput=e=>{gameFilters.query=e.target.value;draw();};
      page.querySelector('#game-category-toggle').onclick=()=>{const toggle=page.querySelector('#game-category-toggle'),browser=page.querySelector('#game-category-browser');browser.hidden=!browser.hidden;toggle.setAttribute('aria-expanded',String(!browser.hidden));};
      page.querySelector('#archive-game-reset').onclick=()=>{Object.assign(gameFilters,{query:'',letter:'',sort:'az',facets:search.blank()});window.SARKIVE_ARCHIVE.games();};
      draw();
      window.SARKIVE_RESPONSIVE.mount('games');
    }catch(e){failed(e,current);}
  }
  async function game(id, tab='') {
    const current=begin('games','#game='+encodeURIComponent(id)+(tab?'&tab='+encodeURIComponent(tab):''));
    try {
      const g=await read('entities/'+encodeURIComponent(id));if(current!==ticket)return;
      const {dates}=await indexes();if(current!==ticket)return;
      const datesByDay=new Map(dates.map(d=>[d.date,d]));
      document.title='The Sarkive | '+g.title;
      const roots=g.groups.filter(x=>!x.parentId), parents=new Map(g.groups.map(x=>[x.id,x.parentId]));
      const belongs=(c,id)=>{let group=c.groupId;while(group){if(group===id)return true;group=parents.get(group);}return false;};
      const tabs=roots.length?roots.map(r=>({id:r.id,title:r.title,chapters:g.chapterPlayback.filter(c=>belongs(c,r.id))})):[{id:'chapters',title:'Chapters',chapters:g.chapterPlayback}];
      const isChapterTab = value => value !== 'streams' && value !== 'clips';
      if(isChapterTab(tab)&&!tabs.some(t=>t.id===tab)) tab=tabs[0].id;
      let chapterTab=isChapterTab(tab)?tab:tabs[0].id;
      page.innerHTML=`${window.SARKIVE_NAV.bar()}<header class="archive-game-hero"><div class="archive-hero-backdrop" aria-hidden="true"></div><div class="archive-hero-art">${image(g.image,'archive-cover')}</div><div class="archive-hero-copy"><h1>${esc(g.title)}</h1>${g.tags.length?`<p class="archive-tags">${g.tags.map(esc).join(' · ')}</p>`:''}${g.description?`<p class="archive-description">${esc(g.description)}</p>`:''}${g.playHref?link(g.playHref,'▶ &nbsp; Play','archive-play'):''}${!g.playHref?`<p class="archive-muted">${g.mediaStatus==='not_played'?'Not played':g.mediaStatus==='lost'?'No surviving footage linked':''}</p>`:''}</div></header><div class="archive-section-heading archive-game-section-heading"><div><p class="archive-eyebrow">${g.chapterCount} CHAPTER${g.chapterCount===1?'':'S'} · ${g.streams.length} STREAM DATE${g.streams.length===1?'':'S'}${g.clipCount?` · ${clipCount(g.clipCount)}`:''}</p><div class="archive-game-view-toggle" role="tablist" aria-label="Game view"><button type="button" role="tab" id="archive-view-chapters" data-view="chapters" aria-controls="archive-game-panel">Chapters</button><span aria-hidden="true">/</span><button type="button" role="tab" id="archive-view-streams" data-view="streams" aria-controls="archive-game-panel">Streams</button><span aria-hidden="true">/</span><button type="button" role="tab" id="archive-view-clips" data-view="clips" aria-controls="archive-game-panel">Clips</button></div></div><label class="season-selector archive-chapter-picker" hidden><span class="visually-hidden">Chapter group</span><select aria-controls="archive-game-panel">${tabs.map(t=>`<option value="${esc(t.id)}">${esc(t.title)}</option>`).join('')}</select></label></div><div id="archive-game-panel" role="tabpanel"></div>`;
      if(g.image) page.querySelector('.archive-hero-backdrop').style.backgroundImage=`url(${JSON.stringify(g.image)})`;
      const picker=page.querySelector('.archive-chapter-picker');
      const select=picker.querySelector('select');
      const draw=selected=>{
        tab=selected;
        const viewingChapters=isChapterTab(selected);
        if(viewingChapters) chapterTab=selected;
        page.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===(viewingChapters?'chapters':selected);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
        picker.hidden=!viewingChapters || tabs.length<2;
        select.value=chapterTab;
        const panel=page.querySelector('#archive-game-panel');panel.setAttribute('aria-labelledby','archive-view-'+(viewingChapters?'chapters':selected));
        if(selected==='clips') {
          const mount=document.createElement('div');
          panel.replaceChildren(mount);
          drawClips(mount,'entities',id,g.clipCount);
        } else if(selected==='streams') {
          panel.innerHTML=g.streams.length?g.streams.slice().reverse().map(s=>{
            const d=datesByDay.get(s.date) || {...s,vodCount:s.vodIds.length};
            return `<article class="archive-date-row">${streamDateLink(d)}</article>`;
          }).join(''):'<p class="archive-empty">No dated stream appearance is linked.</p>';
        } else {
          const chapters=tabs.find(t=>t.id===selected).chapters;
          panel.innerHTML=chapters.length?chapters.map((c,i)=>`<article class="archive-chapter-row">${link(c.playHref,`<span class="archive-chapter-number">${String(i+1).padStart(2,'0')}</span>${image(c.segments[0]?.videoId?'https://i.ytimg.com/vi/'+c.segments[0].videoId+'/mqdefault.jpg':g.image,'archive-chapter-thumb')}<span class="archive-chapter-copy"><strong>${esc(c.title)}</strong>${c.description?`<small>${esc(c.description)}</small>`:''}<span class="archive-chips">${chips(c.people)}</span></span><span class="archive-chapter-runtime">${duration(c.runtimeSeconds)}${c.segments.length>1?`<small>${c.segments.length} parts</small>`:''}</span>`,'archive-chapter-main')}<div class="archive-chapter-dates">${c.dates.map(d=>link('#page=stream&date='+d,esc(dateLabel(d,true)))).join('')}</div></article>`).join(''):g.specialistPlayHref?`<p>${link(g.specialistPlayHref,'▶ Play available footage','archive-play')}</p>`:'<p class="archive-empty">No playable chapters are linked.</p>';
        }
        window.SARKIVE_NAV.commit(null,'','#game='+encodeURIComponent(id)+'&tab='+encodeURIComponent(selected));
        window.SARKIVE_RESPONSIVE.sync();
      };
      select.onchange=()=>draw(select.value);
      const views=[...page.querySelectorAll('[data-view]')];
      views.forEach((b,i)=>{
        b.onclick=()=>draw(b.dataset.view==='chapters'?chapterTab:b.dataset.view);
        b.onkeydown=e=>{
          if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
          e.preventDefault();
          const next=e.key==='Home'?0:e.key==='End'?views.length-1:(i+(e.key==='ArrowRight'?1:-1)+views.length)%views.length;
          views[next].click();
          views[next].focus();
        };
      });draw(tab);
      window.SARKIVE_RESPONSIVE.mount('game');
    }catch(e){failed(e,current);}
  }
  function navigate(href) {
    if(location.hash!==href) window.SARKIVE_NAV.commit(null,'',href);
    bridge.navigate(true);
  }
  function route(params) {
    if(params.has('game')) return game(params.get('game'),params.get('tab') || '');
    if(params.get('page')==='stream' || params.get('date')) return date(params.get('date'));
    if(params.get('page')==='games' || params.get('page')==='categories' || params.has('tag') || params.get('category')==='all-games')return games(params.getAll('tag'),params.get('page')==='categories');
    return streams();
  }
  document.addEventListener('click',e=>{
    const guestPicker=page.querySelector('#archive-guest');if(guestPicker?.open&&!guestPicker.contains(e.target))guestPicker.open=false;
    const a=e.target.closest('a[data-archive]');if(!a || e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)return;
    e.preventDefault();navigate(a.getAttribute('href'));
  });
  page.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.hidden=true;e.target.parentElement.classList.add('archive-missing-art');}},true);
  window.SARKIVE_ARCHIVE={connect(b){bridge=b;},hide(){ticket++;page.hidden=true;},route,streams,date,games,game,clipList,clipHref};
})();
