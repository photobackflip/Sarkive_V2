/* Shared return navigation. Page changes push history; changes within a page replace it. */
(() => {
  'use strict';
  const replace=history.replaceState.bind(history), push=history.pushState.bind(history);
  const field='sarkiveNavigation';
  let returning=false, renderTicket=0;
  const params=hash=>new URLSearchParams(String(hash || '').replace(/^#/,''));
  const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function key(hash) {
    const p=params(hash), page=p.get('page');
    if(page==='backrooms-watch') return 'backrooms-watch:'+p.get('game');
    if(p.has('game') || p.has('podcast')) {
      const kind=p.has('game')?'game':'podcast';
      return kind+':'+p.get(kind)+(p.has('watch') || p.has('chapter')?':watch':'');
    }
    if(p.has('vod')) return 'vod:'+p.get('vod');
    if(['stream','streams','vod-index'].includes(page)) return p.has('date')?'stream:'+p.get('date'):'streams';
    if(p.get('category')==='all-games' || p.get('page')==='categories' || p.has('tag')) return 'games';
    if(p.has('search')) return 'search';
    if(p.has('category')) return 'category:'+p.get('category');
    if(p.has('tag')) return 'tag:'+p.get('tag');
    return page || 'home';
  }
  function label(hash) {
    const p=params(hash), k=key(hash);
    if(k.startsWith('stream:')) return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(p.get('date')+'T12:00:00Z'));
    if(k.startsWith('game:')) return window.SARKIVE_CATALOGUE?.games.find(g=>g.id===p.get('game'))?.title || 'Game';
    if(k==='games') return 'Games';
    if(k==='search') return 'Search results';
    if(p.has('tag')) return p.get('tag');
    if(p.has('category')) return p.get('category').replace(/-/g,' ');
    return ({home:'Home',games:'Games',streams:'Streams',categories:'Categories',backrooms:'Backrooms','marbles-scores':'Marbles scores','sark-links':'Sark links',pals:'Pals',about:'About',shop:'Shop'})[k] || 'Previous page';
  }
  function fallback() {
    const p=params(location.hash);
    if(p.has('vod')) {
      const vod=window.SARKIVE_VOD_INDEX_DATA?.vods.find(v=>v.id===p.get('vod'));
      return vod?.date?'#page=stream&date='+vod.date:'#page=streams';
    }
    if(p.has('game')) return p.has('watch') || p.has('chapter')?'#game='+encodeURIComponent(p.get('game')):'#page=games';
    if(p.get('page')==='stream' || p.has('date')) return '#page=streams';
    if(p.has('tag')) return '#page=categories';
    return '#home';
  }
  function state() {return history.state?.[field];}
  function commit(data,title,url) {
    const target=new URL(url || location.href,location.href);
    if(target.origin!==location.origin || target.pathname!==location.pathname) throw new Error('Navigation must stay within the Sarkive.');
    const old=state(), changed=key(location.hash)!==key(target.hash);
    const base={...(history.state || {}),...(data || {})};
    if(changed && !returning) {
      const source={href:location.hash || '#home',label:label(location.hash),scroll:window.scrollY};
      replace({...base,[field]:{...old,scroll:window.scrollY}},'',location.href);
      push({...base,[field]:{previous:source,scroll:0}},title,target.href);
    } else {
      replace({...base,[field]:old || {previous:null,scroll:0}},title,target.href);
    }
    const ticket=++renderTicket;
    requestAnimationFrame(()=>{if(ticket===renderTicket) mount();});
  }
  function bar(actions='') {
    const previous=state()?.previous, destination=previous?.href || fallback();
    const compact = /^(game:|stream:)/.test(key(location.hash));
    const content = compact
      ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg><span>BACK</span>'
      : `<span aria-hidden="true">‹</span><span>Back to ${esc(previous?.label || label(destination))}</span>`;
    return `<div class="site-page-navigation"><a href="${esc(destination)}" class="site-back-link${compact?' discovery-back-button site-compact-back':''}" data-site-back>${content}</a>${actions}</div>`;
  }
  function mount() {
    const section=[...document.querySelectorAll('main.content > section')].find(s=>!s.hidden);
    if(!section || ['home-page','sark-tv-page','sark-radio-page','archive-page','marbles-scores-page','sark-links-page','pals-page','shop-page','about-page','podcast-page','nerd-poker-page'].includes(section.id)) return;
    section.querySelector(':scope > .site-page-navigation')?.remove();
    if(['vod-watch-page','watch-page'].includes(section.id)) {
      const button=section.querySelector('#vod-back, #game-watch-back');
      const description='Back to '+(state()?.previous?.label || label(fallback()));
      button?.setAttribute('title',description);
      button?.setAttribute('aria-label',description);
      return;
    }
    section.insertAdjacentHTML('afterbegin',bar());
  }
  function back() {
    if(state()?.previous) history.back();
    else {
      replace({...history.state,[field]:{previous:null,scroll:0}},'',fallback());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
  function finish() {
    mount();
    if(!returning) return;
    requestAnimationFrame(()=>{
      window.scrollTo({top:state()?.scroll || 0,left:0,behavior:'instant'});
      returning=false;
    });
  }
  window.addEventListener('popstate',()=>{returning=true;});
  document.addEventListener('click',event=>{
    const a=event.target.closest('[data-site-back]');
    if(!a || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();back();
  });
  replace({...history.state,[field]:state() || {previous:null,scroll:0}},'',location.href);
  history.scrollRestoration='manual';
  window.SARKIVE_NAV={commit,bar,back,finish,mount,get returning(){return returning;}};
})();
