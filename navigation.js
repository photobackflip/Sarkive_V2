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
    if(page==='clip') return 'clip:'+p.get('from')+':'+p.get('id');
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
  function fallback() {
    const p=params(location.hash);
    if(p.get('page')==='clip') {
      const id=encodeURIComponent(p.get('id') || '');
      if(p.get('from')==='dates' && id) return '#page=stream&date='+id;
      if(p.get('from')==='entities' && id) return '#game='+id+'&tab=clips';
      return '#page=sark-tv';
    }
    if(p.get('page')==='backrooms-watch') {
      return window.SARKIVE_BACKROOMS_UI?.watchPayload(p.get('game') || '', p.get('appearance') || '')?.returnHash || '#page=backrooms';
    }
    if(p.has('podcast') && (p.has('watch') || p.has('chapter'))) return '#podcast='+encodeURIComponent(p.get('podcast'));
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
      const source={href:location.hash || '#home',scroll:window.scrollY};
      replace({...base,[field]:{...old,scroll:window.scrollY}},'',location.href);
      push({...base,[field]:{previous:source,scroll:0}},title,target.href);
    } else {
      replace({...base,[field]:old || {previous:null,scroll:0}},title,target.href);
    }
    const ticket=++renderTicket;
    requestAnimationFrame(()=>{if(ticket===renderTicket) mount();});
  }
  function bar(actions='') {
    const destination=state()?.previous?.href || fallback();
    return `<div class="site-page-navigation"><a href="${esc(destination)}" class="site-back-link discovery-back-button site-compact-back" data-site-back><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg><span>BACK</span></a>${actions}</div>`;
  }
  const returnNavigation=document.querySelector('#site-return-navigation');
  const marblesNavigation=document.querySelector('#marbles-return-navigation');
  const sectionsWithoutReturn=new Set(['home-page','sark-radio-page','archive-page','marbles-scores-page','sark-links-page','pals-page','shop-page','about-page','podcast-page','nerd-poker-page']);
  function mount() {
    const section=[...document.querySelectorAll('main.content > section')].find(s=>!s.hidden);
    const show=section && !sectionsWithoutReturn.has(section.id)
      && (section.id!=='sark-tv-page' || params(location.hash).get('page')==='clip');
    returnNavigation.hidden=!show;
    marblesNavigation.hidden=section?.id!=='marbles-scores-page';
    if(show) {
      const destination=state()?.previous?.href || fallback();
      if(returnNavigation.querySelector('[data-site-back]')?.getAttribute('href')!==destination) {
        returnNavigation.innerHTML=bar();
      }
    }
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
