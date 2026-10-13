/* Shared matching and contextual filters for Games, Streams and archive search. */
(() => {
  'use strict';
  const normalize=value=>String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}&]+/gu,' ').trim();
  const names=r=>(r.people || []).map(p=>typeof p==='string'?p:p.name);
  const years=r=>[...new Set((r.dates || (r.date?[r.date]:[])).flatMap(d=>String(d).match(/\b(?:19|20)\d{2}\b/g)||[]))];
  const text=r=>[r.title,r.parentTitle,r.description,r.date,r.dateLabel,...(r.dates || []),...(r.aliases || []),...(r.searchTerms || []),...(r.tags || []),...(r.blocks || []),...(r.streamTypes || []),...names(r),...(r.titles || []),...(r.games || []).flatMap(g=>[g.title,...(g.aliases || [])])].join(' ');
  const query=(r,q)=>{
    const n=normalize(q);if(!n)return true;
    const hay=normalize(text(r)),words=hay.split(/\s+/),tokens=n.split(/\s+/);
    return tokens.every((t,i)=>words.some(w=>w===t||(i===tokens.length-1&&w.startsWith(t))||(/[^a-z0-9&]/.test(t)&&w.includes(t)))) ||
      (n.replace(/\s/g,'').length>=3&&hay.replace(/\s/g,'').includes(n.replace(/\s/g,'')));
  };
  const blank=()=>({tags:new Set(),blocks:new Set(),guest:'',year:'',first:'',last:'',repeat:false});
  const count=s=>s.tags.size+s.blocks.size+['guest','year','first','last','repeat'].filter(k=>s[k]).length;
  function matches(r,s,exclude='') {
    return (exclude==='tags' || !s.tags.size || (r.tags || []).some(t=>s.tags.has(normalize(t)))) &&
      (exclude==='blocks' || !s.blocks.size || (r.blocks || []).some(t=>s.blocks.has(t))) &&
      (exclude==='guest' || !s.guest || names(r).some(p=>normalize(p)===s.guest)) &&
      (exclude==='year' || !s.year || years(r).includes(s.year)) &&
      (exclude==='first' || !s.first || r.firstPlayed?.startsWith(s.first)) &&
      (exclude==='last' || !s.last || r.lastPlayed?.startsWith(s.last)) &&
      (exclude==='repeat' || !s.repeat || r.streamCount>1);
  }
  const esc=v=>String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const panelKeys=new WeakMap();
  function shell(id,label) {
    return `<div class="search-filter-shell archive-filter-shell"><button id="${id}-button" class="search-filter-button" aria-expanded="false" aria-controls="${id}-panel">FILTERS <span class="search-filter-badge" hidden></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6"/></svg></button><div id="${id}-panel" class="search-filter-panel" hidden><div class="search-filter-panel-head"><strong>${esc(label)}</strong><button type="button" class="search-filter-reset">RESET</button></div><div data-facet-body></div></div></div>`;
  }
  function bindShell(root,id,reset) {
    const button=root.querySelector('#'+id+'-button'),panel=root.querySelector('#'+id+'-panel');
    const open=value=>{panel.hidden=!value;button.setAttribute('aria-expanded',String(value));button.closest('.search-filter-shell').classList.toggle('is-open',value);};
    button.onclick=()=>open(panel.hidden);panel.querySelector('.search-filter-reset').onclick=reset;
    if(panelKeys.has(root))root.removeEventListener('keydown',panelKeys.get(root));
    const onKey=e=>{if(e.key==='Escape'&&!panel.hidden){open(false);button.focus();}};
    panelKeys.set(root,onKey);root.addEventListener('keydown',onKey);
    return {body:panel.querySelector('[data-facet-body]'),badge(n){const badge=button.querySelector('.search-filter-badge');badge.hidden=!n;badge.textContent=n;button.classList.toggle('is-active',!!n);},open};
  }
  document.addEventListener('click',e=>document.querySelectorAll('.archive-filter-shell.is-open').forEach(s=>{if(!s.contains(e.target)){s.classList.remove('is-open');s.querySelector('.search-filter-panel').hidden=true;s.querySelector('.search-filter-button').setAttribute('aria-expanded','false');}}));
  function controls(root,records,state,change,{game=false,year=true,guest=true,blocks=true,tags:showTags=true}={}) {
    const focused=root.contains(document.activeElement)?document.activeElement:null;
    const focusKey=focused?.dataset.facet,focusValue=focused?.value;
    const oldQuery=root.querySelector('.archive-tag-search input')?.value || '';
    const oldScroll=root.querySelector('.archive-tag-options')?.scrollTop || 0;
    const checkbox=(key,value,label,n,checked)=>`<label class="search-filter-option"><input type="checkbox" data-facet="${key}" value="${esc(value)}" ${checked?'checked':''}><span class="search-filter-checkbox" aria-hidden="true"></span><span class="search-filter-option-label">${esc(label)}</span><span class="search-filter-option-count">${n.toLocaleString()}</span></label>`;
    const options=(field,values,current,any)=>!values.length&&!current?'':`<label class="archive-facet-select">${esc(field==='first'?'First played':field==='last'?'Last played':field==='guest'?'Guest':game?'Played in':'Year')}<select data-facet="${field}"><option value="">${any}</option>${values.map(([value,label,n])=>`<option value="${esc(value)}" ${current===value?'selected':''}>${esc(label)}${n==null?'':' ('+n.toLocaleString()+')'}</option>`).join('')}</select></label>`;
    const blockOptions=['Backrooms','VR coasters'].map(b=>[b,records.filter(r=>matches(r,state,'blocks')&&(r.blocks || []).includes(b)).length]);
    const tagMap=new Map();records.filter(r=>matches(r,state,'tags')).forEach(r=>new Map((r.tags || []).map(t=>[normalize(t),t])).forEach((t,key)=>{if(key){const item=tagMap.get(key)||{key,label:t,count:0};item.count++;tagMap.set(key,item);}}));
    const allTags=new Map();records.forEach(r=>(r.tags || []).forEach(t=>allTags.set(normalize(t),t)));
    state.tags.forEach(key=>{if(!tagMap.has(key))tagMap.set(key,{key,label:allTags.get(key)||key,count:0});});
    const tags=[...tagMap.values()].sort((a,b)=>a.label.localeCompare(b.label));
    const guests=new Map();records.filter(r=>matches(r,state,'guest')).forEach(r=>new Set(names(r)).forEach(p=>{const key=normalize(p),v=guests.get(key)||[key,p,0];v[2]++;guests.set(key,v);}));
    if(state.guest&&!guests.has(state.guest))guests.set(state.guest,[state.guest,state.guest,0]);
    const yearValues=(field)=>{const map=new Map();records.filter(r=>matches(r,state,field)).forEach(r=>(field==='year'?years(r):r[field==='first'?'firstPlayed':'lastPlayed']?[r[field==='first'?'firstPlayed':'lastPlayed'].slice(0,4)]:[]).forEach(y=>map.set(y,(map.get(y)||0)+1)));if(state[field]&&!map.has(state[field]))map.set(state[field],0);return [...map].sort((a,b)=>b[0].localeCompare(a[0])).map(([y,n])=>[y,y,n]);};
    const blockRows=blockOptions.filter(([b,n])=>n||state.blocks.has(b));
    const repeatCount=records.filter(r=>matches(r,state,'repeat')&&r.streamCount>1).length;
    const selects=(guest?options('guest',[...guests.values()].sort((a,b)=>a[1].localeCompare(b[1])),state.guest,'Any guest'):'')+(year?options('year',yearValues('year'),state.year,'Any year'):'')+(game?options('first',yearValues('first'),state.first,'Any year')+options('last',yearValues('last'),state.last,'Any year')+(repeatCount||state.repeat?checkbox('repeat','1','Played on multiple dates',repeatCount,state.repeat):''):'');
    root.innerHTML=`${blocks&&blockRows.length?`<div class="search-filter-group"><div class="search-filter-group-title">BLOCKS <small>Match any selected block</small></div>${blockRows.map(([b,n])=>checkbox('blocks',b,b,n,state.blocks.has(b))).join('')}</div>`:''}${selects?`<div class="search-filter-group archive-facet-selects">${selects}</div>`:''}${showTags?`<div class="search-filter-group"><div class="search-filter-group-title">TAGS <small>Match any selected tag</small></div><label class="archive-tag-search"><span class="visually-hidden">Find a tag</span><input type="search" placeholder="Find a tag…" aria-label="Find a tag" value="${esc(oldQuery)}"></label><div class="archive-tag-options">${tags.map(t=>checkbox('tags',t.key,t.label,t.count,state.tags.has(t.key))).join('')}</div></div>`:''}`;
    root.querySelectorAll('[data-facet]').forEach(el=>el.onchange=()=>{const key=el.dataset.facet;if(state[key] instanceof Set){if(el.checked)state[key].add(el.value);else state[key].delete(el.value);}else state[key]=el.type==='checkbox'?el.checked:el.value;change();});
    const tagInput=root.querySelector('.archive-tag-search input');
    const filterTags=()=>root.querySelectorAll('.archive-tag-options label').forEach(el=>el.hidden=!normalize(el.textContent).includes(normalize(tagInput.value)));
    if(tagInput){tagInput.oninput=filterTags;filterTags();root.querySelector('.archive-tag-options').scrollTop=oldScroll;}
    if(focusKey)[...root.querySelectorAll('[data-facet]')].find(el=>el.dataset.facet===focusKey&&(el.tagName==='SELECT'||el.value===focusValue))?.focus({preventScroll:true});
  }
  function sortGames(records,sort='az') {
    const alpha=(a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'});
    const dated=(field,reverse)=>(a,b)=>{if(!a[field])return b[field]?1:alpha(a,b);if(!b[field])return -1;return (reverse?-1:1)*a[field].localeCompare(b[field])||alpha(a,b);};
    return [...records].sort(sort==='za'?(a,b)=>alpha(b,a):sort==='first-new'?dated('firstPlayed',true):sort==='first-old'?dated('firstPlayed',false):sort==='last-new'?dated('lastPlayed',true):sort==='most'?(a,b)=>(b.streamCount||0)-(a.streamCount||0)||alpha(a,b):alpha);
  }
  window.SARKIVE_SEARCH={normalize,names,years,query,blank,count,matches,shell,bindShell,controls,sortGames};
})();
