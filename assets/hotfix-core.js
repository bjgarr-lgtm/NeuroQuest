/* SootheBirb Hotfix v4 (core logic)
   - Budget: net = income - expenses; spend = expenses; bar = expenses/goal
   - Settings: persist/apply + googleCalSrc (for Calendar embed)
   - Calendar: clean embed using googleCalSrc
   - Breathe: colorful spinner ring
   - Cleaning boss/raid: click rewards + FX
   - Journal/Check-in/Shop/Rewards like v3
   - Character overlay SVG reflects equipped items + color picker
   - Minigames hub: inject Toddler Pet panel when toddler mode ON
*/
(function(){
  const QS  = (s,el=document)=>el.querySelector(s);
  const QSA = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const nowISO = ()=>new Date().toISOString();
  const load=(k,def)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } };
  const save=(k,v)=>localStorage.setItem(k, JSON.stringify(v));

  // ---------- SETTINGS ----------
  function applySettings(st){
    const html=document.documentElement, body=document.body;
    const themes=['retro','forest','dusk','sunrise','ocean','punk'];
    themes.forEach(t=>{body.classList.remove('theme-'+t); html.classList.remove('theme-'+t)});
    body.classList.add('theme-'+(st.theme||'retro'));
    html.classList.add('theme-'+(st.theme||'retro'));
    body.dataset.font=(st.font||'press2p'); body.dataset.art=(st.art||'pixel');
    if (st.scanlines!==false) body.classList.add('crt'); else body.classList.remove('crt');
    body.classList.toggle('toddler-on', !!st.toddlerToggle);
  }
  function currentSettings(){ return load('sb.settings',{theme:'retro', font:'press2p', art:'pixel', scanlines:true, toddlerToggle:false, userName:'', googleCalSrc:''}); }
  function wireSettings(){
    const saveBtn=QS('#saveSettings'), resetBtn=QS('#resetApp');
    const map={'#themeSelect':'theme','#fontSelect':'font','#artSelect':'art','#scanlinesToggle':'scanlines','#toddlerToggle':'toddlerToggle','#userName':'userName','#googleCalSrc':'googleCalSrc'};
    if (!saveBtn && !resetBtn) return;
    const st=currentSettings();
    Object.entries(map).forEach(([sel,k])=>{ const el=QS(sel); if(!el) return;
      if (el.type==='checkbox') el.checked=!!st[k];
      else el.value = typeof st[k]!=='undefined'? st[k] : el.value;
      // autosave on change
      el.addEventListener('change', ()=>{
        const s2=currentSettings();
        Object.entries(map).forEach(([sel2,k2])=>{ const el2=QS(sel2); if(!el2) return; s2[k2] = (el2.type==='checkbox')?!!el2.checked:el2.value; });
        save('sb.settings', s2); applySettings(s2); window.dispatchEvent(new Event('hashchange'));
      });
    });
    applySettings(st);
    if (saveBtn) saveBtn.onclick=()=>{
      const s2=currentSettings();
      Object.entries(map).forEach(([sel,k])=>{ const el=QS(sel); if(!el) return; s2[k] = (el.type==='checkbox')?!!el.checked:el.value; });
      save('sb.settings', s2); applySettings(s2); window.dispatchEvent(new Event('hashchange'));
      saveBtn.classList.add('pulse'); setTimeout(()=>saveBtn.classList.remove('pulse'),600);
    };
    if (resetBtn) resetBtn.onclick=()=>{ if(!confirm('Reset all local data?')) return; Object.keys(localStorage).filter(k=>k.startsWith('sb.')).forEach(k=>localStorage.removeItem(k)); location.reload(); };
  }

  // ---------- SHOP ----------
  function renderShop(){
    const list=QS('#shopList'), inp=QS('#shopItem'), add=QS('#addShop');
    if (!list||!inp||!add) return;
    const items=load('sb.shop',[]);
    function paint(){ list.innerHTML=''; items.forEach((txt,i)=>{ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${txt}</span><span style="flex:1"></span><button class="danger" data-del="${i}">✕</button>`; list.appendChild(row); }); }
    paint();
    add.onclick=()=>{ const v=(inp.value||'').trim(); if(!v) return; items.push(v); save('sb.shop',items); inp.value=''; paint(); };
    list.onclick=(e)=>{ const b=e.target.closest('[data-del]'); if(!b) return; items.splice(+b.getAttribute('data-del'),1); save('sb.shop',items); paint(); };
  }

  // ---------- BUDGET ----------
  function renderBudget(){
    const pouch=QS('#goldPouch'), spend=QS('#thisSpend'), bar=QS('#budgetBar'), list=QS('#txnList');
    const incLabel=QS('#incLabel'), incAmt=QS('#incAmt'), incBtn=QS('#addIncome');
    const expLabel=QS('#expLabel')||QS('#expLabel'), expAmt=QS('#expAmt'), expBtn=QS('#addExpense');
    if (!pouch||!spend||!bar||!list||!incBtn||!expBtn||!incAmt||!expAmt||!incLabel) return;
    const tx=load('sb.tx',[]);
    const bud=load('sb.budget',{goal:200});
    const goal = Math.max(1, Number(bud.goal)||200);

    const sums = tx.reduce((a,x)=>{ if(x.t==='inc') a.income+=x.amt; else if(x.t==='exp') a.expense+=x.amt; return a; }, {income:0,expense:0});
    const net = sums.income - sums.expense;
    pouch.textContent = '$'+net.toFixed(0);
    spend.textContent = '$'+sums.expense.toFixed(0);
    bar.style.width = Math.min(100, (sums.expense/goal)*100) + '%';

    // Goal label (click to edit)
    const goalCard = bar.closest('.goal')||bar.parentElement;
    if (goalCard && !QS('#budgetGoalText', goalCard)){
      const info=document.createElement('div'); info.id='budgetGoalText'; info.className='muted'; info.style.marginTop='6px'; info.textContent=`Goal: $${goal}`; info.title='Click to change goal';
      info.style.cursor='pointer'; info.onclick=()=>{ const v=prompt('Set weekly budget goal (USD):', String(load('sb.budget',{goal}).goal||goal)); if(v!==null){ const b=load('sb.budget',{goal}); b.goal=Math.max(0,Number(v)||0); save('sb.budget',b); renderBudget(); } };
      goalCard.appendChild(info);
    } else if (goalCard) {
      const info=QS('#budgetGoalText', goalCard); if (info) info.textContent=`Goal: $${goal}`;
    }

    function paintList(){ list.innerHTML=''; tx.slice().reverse().forEach(x=>{ const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${x.label}</span><span style="flex:1"></span><span class="${x.t==='exp'?'danger':'k'}">${x.t==='exp'?'-':'+'}$${x.amt}</span>`; list.appendChild(row); }); }
    paintList();

    incBtn.onclick=()=>{ const label=(incLabel.value||'').trim(); const amt=Number(incAmt.value||0); if(!label||!amt) return;
      tx.push({t:'inc', label, amt, ts:nowISO()}); save('sb.tx',tx); incLabel.value=''; incAmt.value=''; renderBudget();
    };
    expBtn.onclick=()=>{ const label=(expLabel&&expLabel.value||'').trim(); const amt=Number(expAmt.value||0); if(!label||!amt) return;
      tx.push({t:'exp', label, amt, ts:nowISO()}); save('sb.tx',tx); if(expLabel) expLabel.value=''; expAmt.value=''; renderBudget();
    };
  }

  // ---------- BREATHE ----------
  function wireBreathe(){
    const circle=QS('#breathCircle'), phase=QS('#breathPhase');
    if(!circle||!phase) return;
    let running=false, raf=0, idx=0, t0=0;
    const DUR=4000, phases=[['Inhale',0],['Hold',60],['Exhale',180],['Hold',240]];
    function frame(ts){
      if(!t0) t0=ts; const elapsed=ts-t0, r=Math.min(1, elapsed/DUR);
      const [label, hue]=phases[idx]; phase.textContent=label;
      const angle=(ts/10)%360;
      circle.style.background = `conic-gradient(from ${angle}deg, hsl(${hue},90%,60%), hsl(${(hue+120)%360},90%,60%), hsl(${(hue+240)%360},90%,60%))`;
      circle.style.webkitMaskImage = 'radial-gradient(circle 38px at center, transparent 60%, black 61%)';
      circle.style.maskImage = 'radial-gradient(circle 38px at center, transparent 60%, black 61%)';
      let scale=1; if (label==='Inhale') scale=1+0.25*r; else if(label==='Exhale') scale=1.25-0.35*r; else scale=1.25;
      circle.style.transform=`scale(${scale})`;
      if (elapsed>=DUR){ idx=(idx+1)%phases.length; t0=ts; }
      if (running) raf=requestAnimationFrame(frame);
    }
    function start(){ if(running) return; running=true; idx=0; t0=0; circle.classList.add('active'); raf=requestAnimationFrame(frame); }
    function stop(){ running=false; if(raf) cancelAnimationFrame(raf); circle.classList.remove('active'); phase.textContent='Ready'; circle.style.transform='scale(1)'; }
    circle.onclick = ()=> running?stop():start();
  }

  // ---------- JOURNAL ----------
  const PROMPTS=['What made you smile today?','One small win you had:','Something you’re grateful for:','A task you’ll do tomorrow:','How did you take care of yourself today?'];
  function wireJournal(){
    const sel=QS('#journalPrompt'), txt=QS('#journalText'), saveBtn=QS('#saveJournal'), newBtn=QS('#newPrompt'), list=QS('#journalList'), info=QS('#journalStorage');
    if(!sel||!txt||!saveBtn||!newBtn||!list) return;
    const prompts=load('sb.prompts',PROMPTS); sel.innerHTML=prompts.map(p=>`<option>${p}</option>`).join('');
    const render=()=>{ const entries=load('sb.journal',[]).slice().reverse(); list.innerHTML=''; entries.forEach(e=>{ const d=new Date(e.ts).toLocaleString(); const c=document.createElement('div'); c.className='cardish'; c.innerHTML=`<div class="k">${d}</div><div class="v"><strong>${e.prompt}</strong><br>${(e.text||'').replace(/</g,'&lt;')}</div>`; list.appendChild(c); }); if(info){ const size=(localStorage.getItem('sb.journal')||'').length; info.textContent=`Storage used: ${size} bytes`; } };
    render(); newBtn.onclick=()=>{ sel.selectedIndex=(sel.selectedIndex+1)%sel.options.length; };
    saveBtn.onclick=()=>{ const data=load('sb.journal',[]); data.push({prompt:sel.value,text:txt.value,ts:nowISO()}); save('sb.journal',data); txt.value=''; render(); };
  }

  // ---------- CHECK-IN ----------
  function wireCheckin(){
    const row=QS('.mood-row'), tags=QS('#checkinTags'), notes=QS('#checkinNotes'), btn=QS('#saveCheckin'), list=QS('#moodList');
    if(!row||!btn||!list) return;
    const map={'😖':'awful','☹️':'bad','😐':'ok','🙂':'good','🤩':'great'}; let chosen=null;
    row.onclick=(e)=>{ let el=e.target.closest('.mood'); if(!el && e.target.tagName==='SPAN') el=e.target; if(!el) return; const dm = el.getAttribute('data-mood') || map[el.textContent.trim()]; if(!dm) return; QSA('.mood',row).forEach(x=>x.classList&&x.classList.remove('selected')); if(el.classList) el.classList.add('selected'); chosen=dm; };
    const paint=()=>{ const items=load('sb.moods',[]).slice().reverse(); list.innerHTML=''; items.forEach(m=>{ const d=new Date(m.ts).toLocaleString(); const r=document.createElement('div'); r.className='row'; r.innerHTML=`<span>${d}</span><span style="flex:1"></span><span>${m.mood}</span>`; list.appendChild(r); }); };
    paint(); btn.onclick=()=>{ if(!chosen){alert('Pick a mood face first.'); return;} const items=load('sb.moods',[]); items.push({mood:chosen,tags:(tags.value||'').trim(),notes:(notes.value||'').trim(),ts:nowISO()}); save('sb.moods',items); tags.value=''; notes.value=''; chosen=null; paint(); };
  }

  // ---------- CLEANING ----------
  function wireCleaning(){
    const bossBar=QS('#bossProg'), bossList=QS('#bossList'), bossNameIn=QS('#bossName'), bossSet=QS('#bossNew'), bossTick=QS('#bossTick');
    const raidInfo=QS('#raidInfo'); if (!bossBar||!bossList||!bossNameIn||!bossSet||!bossTick||!raidInfo) return;
    const state = load('sb.clean', {bossName:'Bathroom', bossPct:0, raidName:'Deep clean', raidWeek:2});
    function paint(){ bossBar.style.width = Math.min(100, state.bossPct) + '%'; bossList.innerHTML = `<div class="row"><div>Boss: <strong>${state.bossName}</strong></div><div style="flex:1"></div><div>${state.bossPct|0}%</div></div>`; raidInfo.innerHTML = `<div class="row"><div>Week ${state.raidWeek} — <strong>${state.raidName}</strong></div></div>`; }
    paint();
    bossSet.onclick = ()=>{ const v=(bossNameIn.value||'').trim(); if(!v) return; state.bossName=v; save('sb.clean', state); paint(); };
    bossTick.onclick = ()=>{ state.bossPct = Math.min(100, (state.bossPct||0)+10); save('sb.clean', state); paint(); try{window.SB_FX && SB_FX.confetti(); window.SB_FX && SB_FX.crown();}catch{} award(1, 10); };
    raidInfo.onclick = ()=>{ const v=prompt('Set Monthly Raid name:', state.raidName||''); if (v!==null){ state.raidName=v; save('sb.clean', state); paint(); }};
    function award(coins, xp){ const t=load('sb.tx',[]); t.push({t:'inc', label:'Cleaning reward', amt:coins, ts:nowISO()}); save('sb.tx', t); const xpEl = document.getElementById('hudXp')||QS('#xpBig'); if (xpEl) { xpEl.style.width = Math.min(100, (parseFloat(xpEl.style.width)||0)+xp) + '%'; } }
  }

  // ---------- REWARDS ----------
  function renderRewards(){
    const grid=QS('#badgeGrid'); if(!grid) return;
    const tx=load('sb.tx',[]), moods=load('sb.moods',[]), jrnl=load('sb.journal',[]), shop=load('sb.shop',[]);
    const badges=[];
    if(tx.length>=1) badges.push({name:'First Coins',desc:'Logged your first budget item.'});
    if(jrnl.length>=1) badges.push({name:'Inkling',desc:'Saved a journal entry.'});
    if(moods.length>=3) badges.push({name:'Feelings Tracker',desc:'Tracked 3 moods.'});
    if(shop.length>=5) badges.push({name:'List Master',desc:'5 things on your shopping list.'});
    grid.innerHTML = badges.length? badges.map(b=>`<div class="cardish"><div class="k">${b.name}</div><div class="v">${b.desc}</div></div>`).join('') : `<div class="muted">No rewards yet. Keep playing!</div>`;
  }

  // ---------- Calendar Embed ----------
  function wireCalendar(){
    const calWrap = QS('#weekGrid') || QS('.calendar');
    if (!calWrap) return;
    const st = currentSettings();
    if (!st.googleCalSrc) {
      // show a small prompt button if empty
      if (!QS('#calPromptBtn', calWrap)) {
        const btn = document.createElement('button'); btn.id='calPromptBtn'; btn.className='secondary'; btn.textContent='Connect Google Calendar';
        btn.onclick = ()=>{
          const v = prompt('Paste Google Calendar "src" (e.g. yourid@group.calendar.google.com):', st.googleCalSrc||'');
          if (v!==null){ const s2=currentSettings(); s2.googleCalSrc = v.trim(); save('sb.settings', s2); applySettings(s2); renderCalendarEmbed(calWrap, s2.googleCalSrc); }
        };
        calWrap.innerHTML=''; calWrap.appendChild(btn);
      }
      return;
    }
    renderCalendarEmbed(calWrap, st.googleCalSrc);
  }
  function renderCalendarEmbed(host, src){
    host.innerHTML='';
    const iframe = document.createElement('iframe');
    iframe.title = 'Google Calendar';
    const params = new URLSearchParams({mode:'WEEK', showTitle:'0', wkst:'1', bgcolor:'#00000000', ctz:'America/Los_Angeles', src});
    iframe.src = 'https://calendar.google.com/calendar/embed?' + params.toString();
    Object.assign(iframe.style, {border:'0', width:'100%', height:'640px'});
    host.appendChild(iframe);
  }

  // ---------- Character Overlay (SVG) ----------
  const CHAR_CATALOG=[
    {id:'cap', name:'Adventurer Cap', cost:0, layer:'head'},
    {id:'cape', name:'Cape', cost:0, layer:'back'},
    {id:'wand', name:'Wand', cost:4, layer:'hand'},
    {id:'boots', name:'Ranger Boots', cost:3, layer:'feet'},
    {id:'pauldrons', name:'Pauldrons', cost:5, layer:'shoulders'}
  ];
  function charState(){ return load('sb.charGear', {owned:['cap','cape'], equipped:['cap'], color:'#73b6ff'}); }
  function setCharState(s){ save('sb.charGear', s); }
  function charSVG(st){
    const eq=new Set(st.equipped||[]); const body=st.color||'#73b6ff';
    const el=(c,s)=>c?s:'';
    return `<svg viewBox="0 0 220 220" width="260" height="260" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter></defs>
      <g filter="url(#shadow)">
        <!-- body -->
        <circle cx="110" cy="110" r="60" fill="${body}"/>
        <!-- head -->
        <circle cx="110" cy="78" r="26" fill="#ffe0bd"/>
        <circle cx="96" cy="74" r="4" fill="#222"/><circle cx="124" cy="74" r="4" fill="#222"/>
        <!-- feet -->
        ${el(eq.has('boots'), `<rect x="80" y="168" width="25" height="14" rx="4" fill="#8b5a2b"/><rect x="115" y="168" width="25" height="14" rx="4" fill="#8b5a2b"/>`)}
        <!-- shoulders -->
        ${el(eq.has('pauldrons'), `<path d="M70,102 q40,-26 80,0 l0,14 q-40,20 -80,0 z" fill="#8f9bb3"/>`)}
        <!-- cape -->
        ${el(eq.has('cape'), `<path d="M110,110 q-40,20 -50,60 q50,5 100,0 q-10,-40 -50,-60 z" fill="#6a00f4" opacity="0.85"/>`)}
        <!-- hand item -->
        ${el(eq.has('wand'), `<rect x="58" y="120" width="60" height="6" rx="3" fill="#c08c5a"/> <circle cx="120" cy="123" r="6" fill="#ffd24a"/>`)}
        <!-- cap -->
        ${el(eq.has('cap'), `<path d="M84,64 q26,-18 52,0 q-5,6 -52,6 z" fill="#2ec4b6"/> <circle cx="138" cy="64" r="6" fill="#0ea5a6"/>`)}
      </g>
    </svg>`;
  }
  function ensureCharPanel(){
    if (location.hash!=='#character' && location.hash!=='#characters') return;
    const view=QS('#view'); if(!view) return;
    if (!QS('#charDisplay', view)){
      const sec=document.createElement('section'); sec.className='cardish';
      sec.innerHTML=`<h2 class="dash">Your Hero</h2><div id="charDisplay" class="pet-stage" style="min-height:260px"></div>
        <div class="row"><label class="field"><span>Color</span><input type="color" id="charColor" value="#73b6ff"/></label></div>`;
      view.prepend(sec);
    }
    const ownedWrap=QS('#charGearOwned')||QS('#charGearPanel #charGearOwned');
    const shopWrap =QS('#charGearShop')||QS('#charGearPanel #charGearShop');
    if (!QS('#charGearPanel', view)){
      const sec=document.createElement('section'); sec.id='charGearPanel'; sec.className='cardish';
      sec.innerHTML=`<h3>Character Gear</h3><div class="grid two"><div><h4>Owned</h4><div id="charGearOwned" class="panel-list"></div></div><div><h4>Shop</h4><div id="charGearShop" class="panel-list"></div></div></div>`;
      view.appendChild(sec);
    }
    wireCharGear();
  }
  function wireCharGear(){
    const display=QS('#charDisplay'); const color=QS('#charColor');
    const ownedWrap=QS('#charGearOwned'); const shopWrap=QS('#charGearShop'); if(!display||!ownedWrap||!shopWrap) return;
    const st=charState();
    display.innerHTML = charSVG(st);
    if (color) { color.value = st.color || '#73b6ff'; color.onchange = ()=>{ const s=charState(); s.color=color.value; setCharState(s); display.innerHTML=charSVG(s); }; }
    // Owned
    ownedWrap.innerHTML=''; st.owned.forEach(id=>{
      const it = CHAR_CATALOG.find(x=>x.id===id); if(!it) return;
      const eq = st.equipped.includes(id);
      const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${it.name}</span><span style="flex:1"></span><button class="primary" data-eq-char="${id}">${eq?'Unequip':'Equip'}</button>`; ownedWrap.appendChild(row);
    });
    // Shop
    shopWrap.innerHTML=''; CHAR_CATALOG.forEach(it=>{
      const has = st.owned.includes(it.id);
      const row=document.createElement('div'); row.className='row'; row.innerHTML=`<span>${it.name}</span><span style="flex:1"></span><button class="secondary" data-buy-char="${it.id}" ${has?'disabled':''}>${has?'Owned':'Buy'}</button>`; shopWrap.appendChild(row);
    });
  }
  document.addEventListener('click',(e)=>{
    const buy=e.target.closest('[data-buy-char]'); const eq=e.target.closest('[data-eq-char]');
    if (buy){ const id=buy.getAttribute('data-buy-char'); const st=charState(); if(!st.owned.includes(id)) st.owned.push(id); setCharState(st); wireCharGear(); try{window.SB_FX&&SB_FX.confetti();}catch{} }
    if (eq){ const id=eq.getAttribute('data-eq-char'); const st=charState(); const i=st.equipped.indexOf(id); if(i>=0) st.equipped.splice(i,1); else st.equipped.push(id); setCharState(st); wireCharGear(); }
  });

  // ---------- Minigames hub + Toddler Pet panel ----------
  function wireMinigames(){
    if (location.hash !== '#minigames') return;
    const st = currentSettings();
    const v=QS('#view'); if(!v) return;
    const container = v.querySelector('.cardish, .game, .minigame-hub') || v;
    // build a small hub surface
    if (!QS('#miniHub', container)){
      const hub = document.createElement('section');
      hub.id = 'miniHub'; hub.className='cardish';
      hub.innerHTML = `<h2 class="dash">Minigame Hub</h2><div id="miniRows"></div>`;
      container.prepend(hub);
    }
    const rows = QS('#miniRows', container);
    if (!rows) return;
    rows.innerHTML = '';

    if (st.toddlerToggle) {
      const petSec = document.createElement('section');
      petSec.className = 'cardish';
      petSec.innerHTML = `<h3>Toddler Pet</h3>
        <div class="row"><div class="gold tag">Toddler Coins: <span id="petCoins">0</span></div>
        <button id="petEarnHow" class="secondary">How to earn?</button></div>
        <div class="pet-stage" id="petStage" style="min-height:220px"></div>
        <details open><summary>Accessories (owned)</summary><div id="accOwned" class="panel-list"></div></details>
        <section class="cardish"><h4>Shop</h4><div id="accStore" class="panel-list"></div></section>`;
      rows.appendChild(petSec);
      // Reuse existing pet hotfix renderer if available
      if (window.renderPetPage) { window.renderPetPage(); } // noop if not defined
      // Otherwise, trigger hashchange to let toddler-pet hotfix hook run
      setTimeout(()=>window.dispatchEvent(new Event('hashchange')), 50);
    } else {
      const note = document.createElement('div');
      note.className='muted';
      note.textContent='Enable Toddler Mode in Settings to show Toddler Pet and games.';
      rows.appendChild(note);
    }
  }

  // ---------- Router & wiring ----------
  function onRoute(){
    wireSettings();
    renderShop();
    renderBudget();
    wireBreathe();
    wireJournal();
    wireCheckin();
    wireCleaning();
    renderRewards();
    wireCalendar();
    ensureCharPanel();
    wireCharGear();
    wireMinigames();
  }
  window.addEventListener('hashchange', ()=> setTimeout(onRoute, 0));
  document.addEventListener('DOMContentLoaded', ()=> setTimeout(onRoute, 0));
  setInterval(onRoute, 1200);
})();