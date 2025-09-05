/* Toddler Pet hotfix v2 (strict nav/tile visibility + buy/equip + SVG) */
(function () {
  const LS_COINS = 'sb.tCoins';
  const LS_PET   = 'sb.pet';
  const LS_SETTINGS = 'sb.settings';

  const QS  = (s, el=document) => el.querySelector(s);
  const QSA = (s, el=document) => Array.from(el.querySelectorAll(s));
  const load = (k, def) => { try { const v = localStorage.getItem(k); return v?JSON.parse(v):def; } catch { return def; } };
  const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

  const getCoins = () => Number(localStorage.getItem(LS_COINS) || '0');
  const setCoins = (n) => localStorage.setItem(LS_COINS, String(Math.max(0,n)));
  const getPet = () => load(LS_PET, { owned:[], equipped:[] });
  const setPet = (p) => save(LS_PET, p);
  const settings = () => load(LS_SETTINGS, {});
  const toddlerOn = () => !!settings().toddlerToggle;

  const CATALOG = [
    { id:'cap',     name:'Cap',     cost:1 },
    { id:'bow',     name:'Bow',     cost:1 },
    { id:'glasses', name:'Glasses', cost:2 },
    { id:'scarf',   name:'Scarf',   cost:2 },
    { id:'boots',   name:'Boots',   cost:3 },
  ];

  function syncPetVisibility() {
    const show = toddlerOn();
    const btn = QS('button[data-route="pet"]');
    if (btn) btn.style.display = show ? '' : 'none';
    QSA('.tile[data-route="pet"], a.tile[data-route="pet"]').forEach(t=> t.style.display = show ? '' : 'none');
  }

  function elIf(cond, str){ return cond?str:''; }
  function birbSVG(list){
    const eq = new Set(list||[]);
    return `<svg viewBox="0 0 180 160" width="220" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter></defs>
      <g filter="url(#shadow)"><ellipse cx="85" cy="90" rx="55" ry="45" fill="#ffd24a"/><circle cx="95" cy="70" r="20" fill="#ffe07a"/><circle cx="103" cy="65" r="4" fill="#111"/><polygon points="77,70 62,78 77,86" fill="#ff934a"/></g>
      ${elIf(eq.has('scarf'), `<path d="M50,95 q30,-15 70,0 l0,8 q-35,15 -70,0 z" fill="#a35bff"/><rect x="112" y="96" width="10" height="22" rx="3" fill="#8d46ff"/>`)}
      ${elIf(eq.has('boots'), `<rect x="52" y="124" width="22" height="12" rx="4" fill="#8b5a2b"/><rect x="98" y="124" width="22" height="12" rx="4" fill="#8b5a2b"/>`)}
      ${elIf(eq.has('glasses'), `<g><circle cx="95" cy="66" r="10" fill="none" stroke="#333" stroke-width="4"/><circle cx="115" cy="66" r="10" fill="none" stroke="#333" stroke-width="4"/><rect x="105" y="64" width="10" height="4" fill="#333"/></g>`)}
      ${elIf(eq.has('cap'), `<path d="M80,55 q25,-18 45,2 q-20,5 -45,-2 z" fill="#2ec4b6"/><circle cx="124" cy="55" r="5" fill="#14b8a6"/>`)}
      ${elIf(eq.has('bow'), `<g><ellipse cx="84" cy="58" rx="10" ry="7" fill="#ff5ca8"/><ellipse cx="100" cy="58" rx="10" ry="7" fill="#ff5ca8"/><circle cx="92" cy="58" r="5" fill="#ff79c6"/></g>`)}
    </svg>`;
  }

  function renderPetPage() {
    const stage = QS('#petStage'); const coin = QS('#petCoins');
    const ownedWrap = QS('#accOwned'); const shopWrap = QS('#accStore');
    const earn = QS('#petEarnHow');
    if (!stage || !coin || !ownedWrap || !shopWrap) return;

    const pet = getPet(); const coins = getCoins();
    stage.innerHTML = birbSVG(pet.equipped);
    coin.textContent = String(coins);

    ownedWrap.innerHTML = '';
    pet.owned.forEach(id=>{
      const item = CATALOG.find(x=>x.id===id); if (!item) return;
      const eq = pet.equipped.includes(id);
      const d = document.createElement('div'); d.className='cardish';
      d.innerHTML = `<div class="k">${item.name} <small class="tag">owned</small></div>
        <div class="row"><button class="primary" data-equip="${item.id}">${eq?'Unequip':'Equip'}</button></div>`;
      ownedWrap.appendChild(d);
    });

    shopWrap.innerHTML='';
    CATALOG.forEach(it=>{
      const has = pet.owned.includes(it.id);
      const d = document.createElement('div'); d.className='cardish';
      d.innerHTML = `<div class="k">${it.name}</div><div class="v">Cost: ${it.cost}</div>
        <div class="row"><button class="secondary" data-buy="${it.id}" ${has?'disabled':''}>${has?'Owned':'Buy'}</button></div>`;
      shopWrap.appendChild(d);
    });

    if (earn) earn.onclick = ()=> alert('Play Minigames to earn Toddler Coins. Each clear awards 1 coin.');
  }

  document.addEventListener('click', (ev)=>{
    const buy = ev.target.closest('[data-buy]');
    const eq  = ev.target.closest('[data-equip]');
    if (buy) {
      const id = buy.getAttribute('data-buy');
      const it = CATALOG.find(x=>x.id===id); if (!it) return;
      let coins = getCoins(); if (coins < it.cost) { alert('Not enough coins'); return; }
      coins -= it.cost; setCoins(coins);
      const p = getPet(); if (!p.owned.includes(id)) p.owned.push(id); setPet(p);
      renderPetPage(); return;
    }
    if (eq) {
      const id = eq.getAttribute('data-equip');
      const p = getPet(); const i = p.equipped.indexOf(id);
      if (i>=0) p.equipped.splice(i,1); else p.equipped.push(id);
      setPet(p); renderPetPage(); return;
    }
  });

  function maybeRender() {
    syncPetVisibility();
    if (location.hash === '#pet') {
      if (!toddlerOn()) {
        const v = QS('#view'); if (v) v.innerHTML = `<section class="cardish"><h2 class="dash">Toddler Pet</h2><p>Turn on <strong>Toddler Mode</strong> in Settings to play with the birb.</p></section>`;
      } else {
        renderPetPage();
      }
    }
  }

  window.addEventListener('hashchange', maybeRender);
  document.addEventListener('DOMContentLoaded', maybeRender);
  setInterval(syncPetVisibility, 1000);
})();