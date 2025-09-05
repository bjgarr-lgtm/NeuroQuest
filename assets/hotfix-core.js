
// hotfix-core.js — unify toddler toggle, budget math, calendar embed & breathe ring
(function(){
  const get = (k, d=null)=>{try{return JSON.parse(localStorage.getItem(k)) ?? d}catch(e){return d}};
  const set = (k,v)=>localStorage.setItem(k, JSON.stringify(v));

  // --------- Budget math fix ----------
  const fixBudget = () => {
    const r = location.hash.toLowerCase();
    if(!r.includes('budget')) return;
    // Attempt to find fields/buttons present in prior builds
    const pouch = document.getElementById('goldPouch');
    const spend = document.getElementById('thisSpend');
    const bar   = document.getElementById('budgetBar');
    // data
    const data = get('budget.data', {inc:[], exp:[], goal:200});
    const sum = (arr)=>arr.reduce((a,b)=>a + (Number(b.amt)||0),0);
    const income = sum(data.inc), expenses = sum(data.exp);
    if(pouch) pouch.textContent = '$'+(income - expenses);
    if(spend) spend.textContent = '$'+(expenses);
    if(bar){
      const pct = Math.max(0, Math.min(1, data.goal? (expenses / data.goal) : 0));
      bar.style.width = (pct*100)+'%';
    }
    // Wire “Add Income/Expense” if visible
    const ai = document.getElementById('addIncome');
    const ae = document.getElementById('addExpense');
    if(ai && !ai._sb){
      ai._sb=true; ai.addEventListener('click', ()=>{
        const label = (document.getElementById('incLabel')||{}).value||'Income';
        const amt = Number((document.getElementById('incAmt')||{}).value||0);
        data.inc.push({label,amt,ts:Date.now()}); set('budget.data', data); sbToast('Income added'); fixBudget();
      });
    }
    if(ae && !ae._sb){
      ae._sb=true; ae.addEventListener('click', ()=>{
        const label = (document.getElementById('expLabel')||{}).value||'Expense';
        const amt = Number((document.getElementById('expAmt')||{}).value||0);
        data.exp.push({label,amt,ts:Date.now()}); set('budget.data', data); sbToast('Expense added'); fixBudget();
      });
    }
    // Goal editing
    let goalNode = document.querySelector('.goal .k');
    if(goalNode && !goalNode._sb){
      goalNode._sb=true;
      goalNode.title='Click to set weekly goal';
      goalNode.style.cursor='pointer';
      goalNode.addEventListener('click', ()=>{
        const v = prompt('Weekly budget goal ($):', data.goal);
        if(v!=null){ data.goal = Number(v)||0; set('budget.data', data); fixBudget(); }
      });
    }
  };

  // --------- Breathe ring (animated) ----------
  const breathe = () => {
    if(!location.hash.toLowerCase().includes('breathe')) return;
    const circle = document.getElementById('breathCircle');
    if(!circle || circle._sb) return;
    circle._sb = true;
    const phaseEl = document.getElementById('breathPhase');
    let phase = 0; // 0 in, 1 hold, 2 out, 3 hold
    let running = false;
    const D = [4000, 1500, 4000, 1500];
    circle.addEventListener('click', ()=>{
      running = !running;
      if(running) loop(); else phaseEl.textContent='Paused';
    });
    const loop = async ()=>{
      while(running){
        const text = ['Inhale','Hold','Exhale','Hold'][phase];
        phaseEl.textContent = text;
        circle.style.animation = 'none'; void circle.offsetWidth; // restart
        circle.style.background = `conic-gradient(from 0deg, #0ff, #fc0, #f0f, #0ff)`;
        circle.animate([{transform:'scale(1)'},{transform:`scale(${phase===0?1.15:phase===2?0.9:1.0})`}],{duration:D[phase],easing:'ease-in-out'});
        await new Promise(r=>setTimeout(r,D[phase]));
        phase = (phase+1)%4;
      }
    };
  };

  // --------- Calendar embed (safe) ----------
  const makeCalendar = () => {
    if(!location.hash.toLowerCase().includes('calendar')) return;
    const view = document.getElementById('view'); if(!view) return;
    if(view.querySelector('.sb-cal-wrap')) return; // already
    const src = get('settings.gcalsrc', '');
    const wrap = document.createElement('div'); wrap.className='sb-cal-wrap';
    wrap.innerHTML = src
      ? `<iframe style="width:100%;height:70vh;border:0;border-radius:12px"
           src="https://calendar.google.com/calendar/embed?src=${encodeURIComponent(src)}&ctz=America%2FLos_Angeles"></iframe>`
      : `<div class="cardish"><button class="sb-btn" id="sbConnectCal">Connect Google Calendar</button></div>`;
    view.appendChild(wrap);
    const btn = wrap.querySelector('#sbConnectCal');
    if(btn) btn.addEventListener('click', ()=>{
      const v = prompt('Paste your Google Calendar "src" (e.g. yourid@group.calendar.google.com):', get('settings.gcalsrc',''));
      if(v!=null){ const s=get('settings',{}); s.gcalsrc=v; set('settings',s); set('settings.gcalsrc', v); sbToast('Calendar linked'); location.reload(); }
    });
  };

  // --------- Toddler mode unified toggle ----------
  const updateToddler = (on) => {
    set('settings.toddler', !!on);
    const s = get('settings', {}); s.toddler = !!on; set('settings', s);
    window.dispatchEvent(new CustomEvent('sb:toddler-changed'));
    sbToast(on? 'Toddler Mode ON' : 'Toddler Mode OFF');
  };
  const wireToddler = () => {
    // Settings toggle
    const st = document.getElementById('toddlerToggle');
    if(st && !st._sb){
      st._sb=true;
      st.addEventListener('change', e=>updateToddler(e.target.checked));
    }
    // Co‑Op toggle (button id observed in earlier builds)
    const tbtn = document.getElementById('toggleWeek');
    if(tbtn && !tbtn._sb){
      tbtn._sb=true;
      tbtn.addEventListener('click', ()=>{
        // Flip toddler flag
        const on = !get('settings.toddler', false);
        updateToddler(on);
      });
    }
  };

  // ----- Toddler Pet panel inside Minigames -----
  const renderToddlerHub = () => {
    if(!location.hash.toLowerCase().includes('minigame')) return;
    const toddlerOn = get('settings.toddler', false);
    const view = document.getElementById('view'); if(!view) return;
    if(view.querySelector('#sbToddlerPet')){ // keep synced
      view.querySelector('#sbToddlerPet').style.display = toddlerOn? '' : 'none';
      return;
    }
    const box = document.createElement('section'); box.id='sbToddlerPet'; box.className='cardish';
    box.style.display = toddlerOn ? '' : 'none';
    const state = get('toddler.pet', {coins:0, owned:{}, equipped:{}});
    const coin = ()=> state.coins;
    const BIRD = `<svg viewBox="0 0 120 90" width="120"><circle cx="60" cy="45" r="32" fill="#ffe26a"/><circle cx="78" cy="40" r="5" fill="#423c"/>
      <polygon points="88,48 100,42 100,54" fill="#f78"/></svg>`;
    const items = [
      {id:'cap', name:'Cap', cost:0, svg:'<path d="M20 40 Q60 10 100 40 L100 46 L20 46 Z" fill="#48f"/>'},
      {id:'bow', name:'Bow', cost:1, svg:'<circle cx="60" cy="58" r="6" fill="#f4a"/><path d="M40 56 q8-8 16 0 q-8 8 -16 0z" fill="#f7c"/><path d="M80 56 q-8-8 -16 0 q8 8 16 0z" fill="#f7c"/>'},
      {id:'glasses', name:'Glasses', cost:2, svg:'<circle cx="70" cy="40" r="8" fill="none" stroke="#222" stroke-width="3"/><circle cx="50" cy="42" r="8" fill="none" stroke="#222" stroke-width="3"/><rect x="58" y="40" width="6" height="2" fill="#222"/>'},
      {id:'scarf', name:'Scarf', cost:2, svg:'<path d="M30 64 h60 v8 h-60z" fill="#c33"/>'},
      {id:'boots', name:'Boots', cost:3, svg:'<rect x="42" y="70" width="12" height="8" fill="#333"/><rect x="66" y="70" width="12" height="8" fill="#333"/>'},
    ];
    const shop = items.map(it=>`<div class="panel-list"><b>${it.name}</b> <small>Cost: ${it.cost}</small>
      <button class="sb-btn buy" data-id="${it.id}">Buy</button></div>`).join('');
    box.innerHTML = `
      <h2 class="dash">Toddler Pet</h2>
      <div style="display:flex;gap:1rem;align-items:center">
        <div id="petStage" style="border:1px solid #678;border-radius:12px;padding:.5rem">${BIRD}</div>
        <div><div class="gold">Toddler Coins: <b id="tdCoins">${coin()}</b></div>
        <button class="sb-btn" id="howEarn">How do we earn?</button></div>
      </div>
      <details open><summary>Accessories (owned)</summary><div id="owned"></div></details>
      <h3>Shop</h3><div id="shop">${shop}</div>
    `;
    view.prepend(box);
    const draw = ()=>{
      const stage = box.querySelector('#petStage svg');
      // remove prior overlays
      stage.querySelectorAll('.ovl').forEach(n=>n.remove());
      Object.keys(state.owned||{}).forEach(id=>{
        if(state.equipped[id]){
          const it = items.find(x=>x.id===id);
          const g = document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class','ovl');
          g.innerHTML = it.svg; stage.appendChild(g);
        }
      });
      box.querySelector('#tdCoins').textContent = coin();
      const owned = Object.keys(state.owned||{}); 
      box.querySelector('#owned').textContent = owned.length? owned.join(', ') : '(none yet)';
    };
    box.addEventListener('click', (e)=>{
      if(e.target.id==='howEarn'){
        sbModal('How toddler earns coins', `<ul>
          <li>Win a round in any minigame (+1 coin)</li>
          <li>Daily check‑in (+1 coin)</li>
          <li>Sidekick quest complete (+1 coin)</li>
        </ul>`);
      }
      if(e.target.classList.contains('buy')){
        const id=e.target.dataset.id; const it=items.find(x=>x.id===id);
        if(state.owned[id]){ state.equipped[id]=!state.equipped[id]; set('toddler.pet', state); draw(); return; }
        if(state.coins>=it.cost){ state.coins-=it.cost; state.owned[id]=true; state.equipped[id]=true; set('toddler.pet',state); sbToast(`Bought ${it.name}`); draw(); }
        else sbToast('Not enough coins');
      }
    });
    draw();
  };

  // --------- Character accessories (adult) ----------
  const renderCharacter = () => {
    if(!location.hash.toLowerCase().includes('character')) return;
    const view = document.getElementById('view'); if(!view) return;
    if(view.querySelector('#sbCharEquip')) return;
    const box = document.createElement('section'); box.id='sbCharEquip'; box.className='cardish';
    const C = get('char.equip', {color:'#63c', items:{cape:false,cap:true,boots:false,pauldrons:false,wand:false}});
    const items = [
      {id:'cap', name:'Adventurer Cap', svg:'<path d="M-40 -10 q40-40 80 0 v16 h-80z" fill="#1ea"/>'},
      {id:'cape', name:'Cape', svg:'<path d="M-80 30 q80 40 160 0 v90 h-160z" fill="#d06" opacity=".8"/>'},
      {id:'boots', name:'Boots', svg:'<rect x="-30" y="80" width="30" height="16" fill="#432"/><rect x="0" y="80" width="30" height="16" fill="#432"/>'},
      {id:'pauldrons', name:'Pauldrons', svg:'<circle cx="-30" cy="15" r="18" fill="#888"/><circle cx="30" cy="15" r="18" fill="#888"/>'},
      {id:'wand', name:'Wand', svg:'<rect x="45" y="20" width="8" height="70" fill="#fc6"/><circle cx="49" cy="16" r="8" fill="#ff0"/>'},
    ];
    box.innerHTML = `
      <h2 class="dash">Hero Customization</h2>
      <div style="display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap">
        <svg viewBox="-100 -40 200 200" width="240" height="240" id="sbHero">
          <circle cx="0" cy="-10" r="26" fill="#f5d4b3"/>
          <circle cx="-7" cy="-15" r="3" fill="#234"/><circle cx="7" cy="-15" r="3" fill="#234"/>
          <path d="M-60 20 a60 60 0 0 0 120 0 a60 60 0 0 0 -120 0z" fill="${C.color}" id="sbTorso"/>
        </svg>
        <div>
          <label class="field"><span>Color</span> <input type="color" id="sbColor" value="${C.color}"/></label>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(140px,1fr));gap:.5rem;margin-top:.5rem">
            ${items.map(it=>`<label><input type="checkbox" class="eq" data-id="${it.id}" ${C.items[it.id]?'checked':''}/> ${it.name}</label>`).join('')}
          </div>
        </div>
      </div>`;
    view.prepend(box);
    const hero = box.querySelector('#sbHero');
    const draw = () => {
      // remove overlays
      hero.querySelectorAll('.ovl').forEach(n=>n.remove());
      items.forEach(it=>{
        if(C.items[it.id]){
          const g = document.createElementNS('http://www.w3.org/2000/svg','g'); g.setAttribute('class','ovl');
          g.innerHTML = it.svg; hero.appendChild(g);
        }
      });
      hero.querySelector('#sbTorso').setAttribute('fill', C.color);
      set('char.equip', C);
    };
    box.addEventListener('change', (e)=>{
      if(e.target.id==='sbColor'){ C.color=e.target.value; draw(); sbToast('Color updated'); return; }
      if(e.target.classList.contains('eq')){ const id=e.target.dataset.id; C.items[id]=e.target.checked; draw(); sbToast('Equipped updated'); }
    });
    draw();
  };

  // sweep
  const sweep = () => { fixBudget(); breathe(); makeCalendar(); wireToddler(); renderToddlerHub(); renderCharacter(); };
  window.addEventListener('DOMContentLoaded', sweep);
  window.addEventListener('hashchange', sweep);
  window.addEventListener('sb:toddler-changed', sweep);
})();
