/* Toddler Pet v3: same as v2 (coins, buy/equip) + visibility from settings */
(function(){
  const QS=(s,el=document)=>el.querySelector(s);
  const load=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } };
  const save=(k,v)=>localStorage.setItem(k, JSON.stringify(v));
  const coins=()=>Number(localStorage.getItem('sb.tCoins')||'0');
  const setCoins=n=>localStorage.setItem('sb.tCoins', String(Math.max(0,n)));
  const settings=()=>load('sb.settings',{});
  const toddlerOn=()=>!!settings().toddlerToggle;

  function syncVis(){ const show=toddlerOn(); const btn=QS('button[data-route="pet"]'); if(btn) btn.style.display=show?'':'none'; document.querySelectorAll('.tile[data-route="pet"]').forEach(t=>t.style.display=show?'':'none'); }
  setInterval(syncVis, 1000); window.addEventListener('hashchange', syncVis); document.addEventListener('DOMContentLoaded', syncVis);

  const SHOP=[{id:'cap',name:'Cap',cost:1},{id:'bow',name:'Bow',cost:1},{id:'glasses',name:'Glasses',cost:2},{id:'scarf',name:'Scarf',cost:2},{id:'boots',name:'Boots',cost:3}];
  const getPet=()=>load('sb.pet',{owned:[],equipped:[]}); const setPet=p=>save('sb.pet',p);

  function elIf(c,s){ return c?s:''; }
  function svg(list){
    const eq= new Set(list||[]);
    return `<svg viewBox="0 0 180 160" width="220" height="200" xmlns="http://www.w3.org/2000/svg">
      <g><ellipse cx="85" cy="90" rx="55" ry="45" fill="#ffd24a"/><circle cx="95" cy="70" r="20" fill="#ffe07a"/><circle cx="103" cy="65" r="4" fill="#111"/><polygon points="77,70 62,78 77,86" fill="#ff934a"/></g>
      ${elIf(eq.has('scarf'), `<path d="M50,95 q30,-15 70,0 l0,8 q-35,15 -70,0 z" fill="#a35bff"/>`)}
      ${elIf(eq.has('boots'), `<rect x="52" y="124" width="22" height="12" rx="4" fill="#8b5a2b"/><rect x="98" y="124" width="22" height="12" rx="4" fill="#8b5a2b"/>`)}
      ${elIf(eq.has('glasses'), `<g><circle cx="95" cy="66" r="10" fill="none" stroke="#333" stroke-width="4"/><circle cx="115" cy="66" r="10" fill="none" stroke="#333" stroke-width="4"/><rect x="105" y="64" width="10" height="4" fill="#333"/></g>`)}
      ${elIf(eq.has('cap'), `<path d="M80,55 q25,-18 45,2 q-20,5 -45,-2 z" fill="#2ec4b6"/>`)}
      ${elIf(eq.has('bow'), `<g><ellipse cx="84" cy="58" rx="10" ry="7" fill="#ff5ca8"/><ellipse cx="100" cy="58" rx="10" ry="7" fill="#ff5ca8"/><circle cx="92" cy="58" r="5" fill="#ff79c6"/></g>`)}
    </svg>`;
  }
  function render(){
    if (location.hash!=='#pet') return;
    const v=QS('#view'); if(!v) return;
    if (!toddlerOn()){ v.innerHTML=`<section class="cardish"><h2 class="dash">Toddler Pet</h2><p>Turn on Toddler Mode in Settings.</p></section>`; return; }
    const p=getPet(); const coinsEl=document.getElementById('petCoins') || (function(){ const h=document.createElement('div'); h.id='petCoins'; return h; })();
    const stage=QS('#petStage') || (function(){ const s=document.createElement('div'); s.id='petStage'; v.appendChild(s); return s; })();
    const owned=QS('#accOwned') || (function(){ const d=document.createElement('div'); d.id='accOwned'; v.appendChild(d); return d; })();
    const store=QS('#accStore') || (function(){ const d=document.createElement('div'); d.id='accStore'; v.appendChild(d); return d; })();

    stage.innerHTML = svg(p.equipped);
    if (QS('#petCoins')) QS('#petCoins').textContent = String(coins());

    owned.innerHTML=''; p.owned.forEach(id=>{
      const it=SHOP.find(x=>x.id===id); if(!it) return;
      const eq=p.equipped.includes(id);
      const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${it.name}</span><span style="flex:1"></span><button class="primary" data-eq="${id}">${eq?'Unequip':'Equip'}</button>`; owned.appendChild(row);
    });
    store.innerHTML=''; SHOP.forEach(it=>{
      const has=p.owned.includes(it.id);
      const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${it.name}</span><span style="flex:1"></span><button class="secondary" data-buy="${it.id}" ${has?'disabled':''}>${has?'Owned':'Buy ('+it.cost+')'}</button>`; store.appendChild(row);
    });
  }
  document.addEventListener('click',(e)=>{
    const buy=e.target.closest('[data-buy]'); const eq=e.target.closest('[data-eq]');
    if (buy){ const id=buy.getAttribute('data-buy'); const it={'cap':1,'bow':1,'glasses':2,'scarf':2,'boots':3}[id]||1; let c=coins(); if(c<it){ alert('Not enough coins'); return;} c-=it; setCoins(c); const p=load('sb.pet',{owned:[],equipped:[]}); if(!p.owned.includes(id)) p.owned.push(id); save('sb.pet',p); render(); try{window.SB_FX&&SB_FX.confetti();}catch{} }
    if (eq){ const id=eq.getAttribute('data-eq'); const p=load('sb.pet',{owned:[],equipped:[]}); const i=p.equipped.indexOf(id); if(i>=0) p.equipped.splice(i,1); else p.equipped.push(id); save('sb.pet',p); render(); }
  });
  window.addEventListener('hashchange', render); document.addEventListener('DOMContentLoaded', render);
})();