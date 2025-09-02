// ====== SootheBirb v2.5.0 — Characters + Economy ======

// ------ store (localStorage)
const KEY = "soothebirb.v25";
const defaultState = () => ({
  user: { name: "", theme: "retro", font: "press2p", art:"pixel", scanlines:true, character:{ id:'witch', img:null } },
  settings: { toddler:false },
  economy: { gold: 0, ownedAcc: ['cap','glasses'] },
  pet: { name: "Pebble", species: "birb", level: 1, xp: 0, acc: ["cap","glasses"] },
  streak: { current: 0, best: 0, lastCheck: "" },
  log: {
    moods: [], tasks: [], journal: [], breath: [],
    clean: { small: [], boss: { name: 'Bathroom', progress: 0 }, raid: { name:'Week 2', note:'Deep clean' } },
    coop: { toddlerWeek:false, quests: [], collectibles: [] },
    budget: { goal: 500, txns: [] },
    meals: { data: Array.from({length:7},()=>({breakfast:'', lunch:'', dinner:''})) },
    calendar: { events: Array.from({length:7},()=>[]) },
    shop: { items: [] },
    rewards: { badges: [] }
  }
});
function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem(KEY));
    if(s){
      const t = s.settings && typeof s.settings.toddler !== 'undefined'
        ? s.settings.toddler
        : (s.log && s.log.coop && s.log.coop.toddlerWeek) || false;
      s.settings = { toddler: t };
      if(s.log && s.log.coop) s.log.coop.toddlerWeek = t;
      return s;
    }
  }catch(e){}
  return defaultState();
}
function saveState(s){
  s.settings = s.settings || { toddler:false };
  localStorage.setItem(KEY, JSON.stringify(s));
}
function resetState(){ localStorage.removeItem(KEY); }
function dayKey(ts=new Date()){ const d=new Date(ts); d.setHours(0,0,0,0); return d.toISOString(); }
function touchStreak(state){
  const today = dayKey();
  if(state.streak.lastCheck !== today){
    const y = new Date(today); y.setDate(y.getDate()-1);
    const yKey = dayKey(y);
    state.streak.current = (state.streak.lastCheck === yKey) ? (state.streak.current||0)+1 : 1;
    state.streak.best = Math.max(state.streak.best||0, state.streak.current);
    state.streak.lastCheck = today;
  }
}
function xpForLevel(l){ return l*l*10; }
function addXP_base(state, amount){
  state.pet.xp += amount;
  while(state.pet.xp >= xpForLevel(state.pet.level+1)){
    state.pet.level += 1; fxToast('Level Up!'); fxBlast(); fxBeep(1320, 0.08);
  }
  fxReward('+'+amount+' XP'); registerXPEvent();
}

// ------ helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function routeTo(name){ window.location.hash = name; }
function setActiveNav(name){ $$(".nav-btn").forEach(b=> b.classList.toggle("active", b.dataset.route===name)); }
function el(tag, opts={}, children=[]){ const e=document.createElement(tag); Object.assign(e, opts); if(opts.attrs){ for(const [k,v] of Object.entries(opts.attrs)) e.setAttribute(k,v); } if(typeof children==="string"){ e.innerHTML=children; } else children.forEach(c=> e.appendChild(c)); return e; }
function fmtDate(ts){ const d=new Date(ts); return d.toLocaleDateString(undefined, {month:"short", day:"numeric"}); }

// --- FX core
function fxToast(text){ const t=document.createElement('div'); t.className='toast'; t.textContent=text; document.body.appendChild(t); setTimeout(()=>t.remove(), 1400); }
function fxReward(text){ fxToast(text); }
function fxConfetti(x=window.innerWidth/2, y=window.innerHeight*0.18, n=20){
  const layer = document.getElementById('fxLayer'); if(!layer) return;
  for(let i=0;i<n;i++){
    const s=document.createElement('span'); s.className='confetti'+(i%2?' alt':''); s.style.left=x+'px'; s.style.top=y+'px';
    const dx=(Math.random()*2-1)*140, dy=(Math.random()*-1)*180-40, rot=(Math.random()*360);
    s.style.position='absolute'; s.style.width='8px'; s.style.height='8px'; s.style.background=(i%2?'var(--accent-2)':'var(--accent)'); s.style.transform='translate(-50%,-50%)';
    s.animate([ { transform:`translate(-50%,-50%)`, opacity:1 }, { transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity:0 } ], { duration: 900+Math.random()*500, easing:'cubic-bezier(.2,.9,.2,1)' });
    layer.appendChild(s); setTimeout(()=>s.remove(), 1500);
  }
}
function fxBeep(freq=880, dur=0.05){ try{ window._ac = window._ac || new (window.AudioContext||window.webkitAudioContext)(); const o=_ac.createOscillator(), g=_ac.createGain(); o.frequency.value=freq; o.type='square'; o.connect(g); g.connect(_ac.destination); g.gain.setValueAtTime(0.02, _ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, _ac.currentTime + dur); o.start(); o.stop(_ac.currentTime + dur);}catch(e){} }
function fxBlast(){ fxConfetti(window.innerWidth/2, window.innerHeight*0.4, 320); const bloom=document.createElement('div'); bloom.className='bloom'; document.body.appendChild(bloom); setTimeout(()=>bloom.remove(), 700); const shock=document.createElement('div'); shock.className='shock'; document.body.appendChild(shock); setTimeout(()=>shock.remove(), 820); }
const _xpTimes=[]; function registerXPEvent(){ const now=Date.now(); _xpTimes.push(now); while(_xpTimes.length && now-_xpTimes[0]>15000) _xpTimes.shift(); if(_xpTimes.length>=3){ fxToast('COMBO!'); fxBlast(); } }
let _trailLast = 0; function trailAt(x,y){ const now=performance.now(); if(now-_trailLast<18) return; _trailLast=now; const fx = document.getElementById('fxLayer'); if(!fx) return; const s = document.createElement('span'); s.className='trail'+(Math.random()<.5?' alt':''); s.style.left=x+'px'; s.style.top=y+'px'; fx.appendChild(s); setTimeout(()=>s.remove(), 400); }
window.addEventListener('mousemove', e=> trailAt(e.clientX, e.clientY), {passive:true});
window.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(t) trailAt(t.clientX, t.clientY); }, {passive:true});
let COIN_MODE=false; function spawnCoin(x=window.innerWidth/2, y=window.innerHeight*.35){ const c=document.createElement('div'); c.className='coin'; c.style.left=x+'px'; c.style.top=y+'px'; c.addEventListener('click', ()=>{ COIN_MODE=true; addXP_base(state,1); COIN_MODE=false; fxToast('Bonus +1 XP'); c.remove(); }); document.body.appendChild(c); setTimeout(()=> c.remove(), 1800); }
function fxJackpot(){ document.body.classList.add('shake'); setTimeout(()=>document.body.classList.remove('shake'), 420); fxBlast(); const j=document.createElement('div'); j.className='jackpot'; j.textContent='JACKPOT!'; document.body.appendChild(j); setTimeout(()=>j.remove(), 1200); for(let i=0;i<8;i++){ setTimeout(()=> spawnCoin(window.innerWidth*(.15+.7*Math.random()), window.innerHeight*.3), i*60); } fxBeep(1660, .08); setTimeout(()=>fxBeep(1320,.08),80); setTimeout(()=>fxBeep(990,.08),160); }
function addXP(state, amt){ addXP_base(state, amt); if(!COIN_MODE){ if(Math.random()<0.6) spawnCoin(); if(Math.random()<0.02) fxJackpot(); } }

// ---- SFX helpers
const SFX={ click:()=>fxBeep(660,.03), check:()=>fxBeep(990,.04), gold:()=>fxBeep(770,.06) };
document.addEventListener('click',e=>{ if(e.target.closest('button')) SFX.click(); }, {passive:true});

// --- Music (asset-free)
let MUSIC_ON=false, _seqTimer=null;
function ensureAudio(){ try{ window._ac = window._ac || new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} return window._ac; }
function tone(freq=440, dur=0.25, type='square', vol=0.02){
  const ctx = ensureAudio(); if(!ctx) return;
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
  const t=ctx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o.start(t); o.stop(t+dur+0.02);
}
function midi(n){ return 440 * Math.pow(2, (n-69)/12); }
const SONG={ bpm:112, lead:[74,74,77,74,79,79,77,74, 74,74,77,74,81,81,79,77], bass:[50,50,55,55,48,48,43,43,50,50,55,55,48,48,43,43] };
function startMusic(){ const ctx=ensureAudio(); if(!ctx || _seqTimer) return; MUSIC_ON=true; $('#musicBtn')?.classList.add('on'); const spb=60/SONG.bpm, step=spb/2; let i=0; _seqTimer=setInterval(()=>{ tone(midi(SONG.lead[i%SONG.lead.length]), step*.9, 'square', .02); tone(midi(SONG.bass[i%SONG.bass.length]), step*.9, 'sawtooth', .01); i++; }, step*1000); }
function stopMusic(){ MUSIC_ON=false; $('#musicBtn')?.classList.remove('on'); if(_seqTimer){ clearInterval(_seqTimer); _seqTimer=null; } }
function toggleMusic(){ if(MUSIC_ON) stopMusic(); else startMusic(); }
document.addEventListener('click', function unlock(){ ensureAudio(); document.removeEventListener('click', unlock); }, {once:true});

// economy
const GOLD_REWARD={main:10,side:6,bonus:4,clean:5,coop:5,budget_inc:6,budget_exp:2,journal:5,breathe:4,checkin:5};
function addGold(n){ state.economy.gold=Math.max(0,(state.economy.gold||0)+n); SFX.gold(); saveState(state); renderHUD(); }

// --- Theme + HUD
let state; try{ state = loadState(); }catch(e){ console.error('init', e); state=defaultState(); }
state.settings = state.settings || { toddler:false };
function applyTheme(){
  document.documentElement.className="";
  document.documentElement.classList.add("theme-"+(state.user.theme||"retro"));
  const fontMap={ press2p: "'Press Start 2P', monospace", "system-ui":"system-ui", serif:"serif", mono:"monospace" };
  document.body.style.fontFamily = fontMap[state.user.font||"press2p"];
  document.body.classList.toggle('crt', !!state.user.scanlines);
}
applyTheme();
function renderHUD(){
  document.body.classList.toggle('toddler-on', state.settings.toddler);
  const cur=2; $("#hudHearts").innerHTML = Array.from({length:3},(_,i)=>`<span class="heart ${i<cur?'':'off'}"></span>`).join("");
  const lvl=state.pet.level, xp=state.pet.xp, next=xpForLevel(lvl+1), prev=xpForLevel(lvl);
  const pct = Math.max(0, Math.min(100, Math.round(((xp-prev)/(next-prev))*100)));
  $("#hudLevel").textContent = `Lv ${lvl}`; $("#hudXp").style.width = pct+"%";
  $("#hudGold").textContent = `🪙 ${state.economy.gold}`;
  const av=$('#hudAvatars'); if(av){ av.innerHTML=''; const c=state.user.character; const img=c?.img? `<img src='${c.img}' alt='char'/>` : `<div class='char-portrait'>${petPixelSVG('sprout',1)}</div>`; const p=petPixelSVG(state.pet.species, state.pet.level, state.pet.acc); av.innerHTML = `<div class='avatar'>${img}</div><div class='avatar'>${p}</div>`; }
  document.querySelectorAll('.toddler-only').forEach(el=>{ el.style.display = state.settings?.toddler ? '' : 'none'; });
}
renderHUD();

// --- Routing (robust)
function safeRouteName(hash){ const name=(hash||'#home').replace('#',''); const ok=['home','tasks','clean','coop','budget','meals','calendar','shop','rewards','checkin','journal','breathe','minigames','pet','settings','characters','companion']; return ok.includes(name)? name : 'home'; }
document.querySelector('.top-nav')?.addEventListener('click', (e)=>{ const b = e.target.closest('.nav-btn'); if(!b) return; e.preventDefault(); routeTo(b.dataset.route); renderRoute(); });
function clearFx(){ document.querySelectorAll('.bloom,.shock,.toast,.coin,.jackpot').forEach(n=>n.remove()); }
window.addEventListener('hashchange', renderRoute);

function moveNavHi(){
  const active = document.querySelector('.top-nav .nav-btn.active');
  const hi = document.getElementById('navHighlighter'); if(!active||!hi) return;
  const r = active.getBoundingClientRect(); const pr = active.parentElement.getBoundingClientRect();
  const w = Math.max(40, r.width*0.7);
  const x = (r.left - pr.left) + (r.width - w)/2;
  hi.style.width = w+'px';
  hi.style.transform = `translateX(${x}px)`;
}
window.addEventListener('resize', ()=> setTimeout(moveNavHi, 50));

function wireTiles(){ document.querySelectorAll('.tile[data-route]').forEach(t => { t.addEventListener('click', ()=>{ routeTo(t.dataset.route); renderRoute(); }); }); }

function renderRoute(){
  try{
    clearFx();
    const name = safeRouteName(location.hash || '#home');
    setActiveNav(name); moveNavHi();
    const view = document.querySelector('#view'); view.innerHTML='';
    const tpl = document.querySelector('#tpl-'+name);
    if(!tpl){ view.textContent='Not found'; return; }
    view.appendChild(tpl.content.cloneNode(true));
    wireTiles();
    renderHUD();
    if(name==='home') initDashboard();
    if(name==='tasks') initTasks();
    if(name==='clean') initCleaning();
    if(name==='coop') initCoop();
    if(name==='budget') initBudget();
    if(name==='meals') initMeals();
    if(name==='calendar') initCalendar();
    if(name==='shop') initShop();
    if(name==='rewards') initRewards();
    if(name==='checkin') initCheckin();
    if(name==='journal') initJournal();
    if(name==='breathe') initBreathe();
    if(name==='minigames') initMinigame();
    if(name==='pet') initPet();
    if(name==='settings') initSettings();
    if(name==='characters') initCharacters();
    if(name==='companion') initCompanion();
    updateFooter();
  }catch(err){ console.error('renderRoute', err); const v=document.querySelector('#view'); v.innerHTML='<div class="cardish">Render error — reloading…</div>'; setTimeout(()=>location.reload(), 50); }
}

// ---- footer
function updateFooter(){ $("#streakLabel").textContent = `Streak: ${state.streak.current} 🔥 | Best: ${state.streak.best}`; }

// ---- dashboard
function initDashboard(){
  const lvl=state.pet.level, xp=state.pet.xp, next=xpForLevel(lvl+1), prev=xpForLevel(lvl);
  const pct=Math.max(0, Math.min(100, Math.round(((xp-prev)/(next-prev))*100)));
  $("#xpBig").style.width=pct+"%"; $("#xpBigLabel").textContent = `Lv ${lvl}`;
}

// ---- quests
const DEFAULT_TASKS = [{title:"Pay a bill", tier:"main"}, {title:"Pick up prescription", tier:"main"}, {title:"Clean bathroom", tier:"side"}, {title:"Journal", tier:"side"}, {title:"Organize drawer", tier:"bonus"}];
const TODDLER_TASKS = [
  {title:"Read picture book", tier:"side", xp:1, gold:1},
  {title:"Outside play 10m", tier:"side", xp:1, gold:1}
];
function regenTasks(){
  const arr = (state.settings && state.settings.toddler) ? TODDLER_TASKS : DEFAULT_TASKS;
  state.log.tasks = arr.map(t=>({id:crypto.randomUUID(), title:t.title, tier:t.tier, xp:t.xp, gold:t.gold, done:false, ts:0, toddler:state.settings?.toddler}));
  saveState(state);
}
function initTasks(){
  if(state.log.tasks.length===0 || (!!state.settings?.toddler !== !!state.log.tasks[0]?.toddler)){ regenTasks(); }
  const panelMain=$("#panelMain"), panelSide=$("#panelSide"), panelBonus=$("#panelBonus");
  function render(){
    panelMain.replaceChildren(); panelSide.replaceChildren(); panelBonus.replaceChildren();
    const tiers={main:panelMain, side:panelSide, bonus:panelBonus};
    state.log.tasks.forEach(task=>{
      const row=el("div",{className:"quest-row"+(task.done?" done":"")});
      const box=el("div",{className:"checkbox"+(task.done?" checked":"")}); box.innerHTML=task.done?"✓":"";
      box.addEventListener("click", ()=>{ task.done=!task.done; task.ts=task.done?Date.now():0; box.classList.toggle('checked', task.done); row.classList.toggle('done', task.done); SFX.check(); if(task.done){ touchStreak(state); addXP(state, task.xp||3); addGold(task.gold||GOLD_REWARD[task.tier]||3); maybeUnlockAccessory(); } saveState(state); updateFooter(); renderHUD(); });
      const title=el("span",{textContent:task.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click", ()=>{ state.log.tasks=state.log.tasks.filter(x=>x.id!==task.id); saveState(state); render(); });
      row.append(box,title,del); (tiers[task.tier||"side"]||panelSide).appendChild(row);
    });
  }
  render();
  $("#addTaskBtn").addEventListener("click", ()=>{ const t=$("#newTaskTitle").value.trim(); if(!t) return; const tier=$("#newTaskTier").value||"side"; state.log.tasks.push({id:crypto.randomUUID(), title:t, tier, done:false, ts:0}); $("#newTaskTitle").value=""; saveState(state); render(); });
}

// ---- cleaning
function initCleaning(){
  const small=$("#cleanSmall");
  function draw(){
    small.replaceChildren();
    state.log.clean.small.forEach((q,i)=>{
      const row=el("div",{className:"quest-row"+(q.done?" done":"")});
      const box=el("div",{className:"checkbox"+(q.done?" checked":"")}); box.innerHTML=q.done?"✓":"";
      box.addEventListener("click",()=>{ q.done=!q.done; box.classList.toggle('checked', q.done); row.classList.toggle('done', q.done); if(q.done){ addXP(state,2); addGold(GOLD_REWARD.clean); maybeUnlockAccessory(); } saveState(state); renderHUD(); });
      const t=el("span",{textContent:q.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click",()=>{ state.log.clean.small.splice(i,1); saveState(state); draw(); });
      row.append(box,t,del); small.appendChild(row);
    });
    $("#bossProg").style.width = Math.min(100, state.log.clean.boss.progress)+"%";
    $("#bossList").replaceChildren(el("div",{textContent:`Boss: ${state.log.clean.boss.name}`}));
    $("#raidInfo").replaceChildren(el("div",{textContent:`${state.log.clean.raid.name} — ${state.log.clean.raid.note}`}));
  }
  draw();
  $("#addCleanTask").addEventListener("click",()=>{ const t=$("#newCleanTask").value.trim(); if(!t) return; state.log.clean.small.push({title:t,done:false}); $("#newCleanTask").value=""; saveState(state); draw(); });
  $("#bossNew").addEventListener("click",()=>{ const name=$("#bossName").value.trim(); if(!name) return; state.log.clean.boss.name=name; state.log.clean.boss.progress=0; saveState(state); draw(); });
  $("#bossTick").addEventListener("click",()=>{ state.log.clean.boss.progress = Math.min(100, state.log.clean.boss.progress+10); if(state.log.clean.boss.progress===100) addXP(state,10); saveState(state); draw(); renderHUD(); });
}

// ---- coop
function initCoop(){
  $("#coopWeek").textContent = state.log.coop.toddlerWeek? "Toddler Week" : "Solo Week";
  const list=$("#sidekickList"), coll=$("#coopCollect");
  function draw(){
    list.replaceChildren(); coll.replaceChildren();
    state.log.coop.quests.forEach((q,i)=>{
      const row=el("div",{className:"quest-row"+(q.done?" done":"")});
      const box=el("div",{className:"checkbox"+(q.done?" checked":"")}); box.innerHTML=q.done?"✓":"";
      box.addEventListener("click",()=>{ q.done=!q.done; box.classList.toggle('checked', q.done); row.classList.toggle('done', q.done); if(q.done) { addXP(state,2); addGold(GOLD_REWARD.coop); maybeUnlockAccessory(); } saveState(state); renderHUD(); });
      const t=el("span",{textContent:q.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click",()=>{ state.log.coop.quests.splice(i,1); saveState(state); draw(); });
      row.append(box,t,del); list.appendChild(row);
    });
    (state.log.rewards.badges||[]).forEach(b=> coll.appendChild(el("div",{className:"quest-row"},[el("span",{textContent:b.name+' ⭐'})])));
  }
  draw();
  $("#addSidekick").addEventListener("click",()=>{ const t=$("#newSidekick").value.trim(); if(!t) return; state.log.coop.quests.push({title:t,done:false}); $("#newSidekick").value=""; saveState(state); draw(); });
  $("#toggleWeek").addEventListener("click",()=>{ state.log.coop.toddlerWeek=!state.log.coop.toddlerWeek; saveState(state); $("#coopWeek").textContent = state.log.coop.toddlerWeek? "Toddler Week" : "Solo Week"; });
}

// ---- budget
function initBudget(){
  const list=$("#txnList");
  function money(n){ return (n<0?"-":"") + "$" + Math.abs(n).toLocaleString(); }
  function draw(){
    list.replaceChildren();
    const tx=state.log.budget.txns.slice().reverse();
    let balance=0, spend=0; state.log.budget.txns.forEach(t=>{ balance+=t.amount; if(t.amount<0) spend+=-t.amount; });
    $("#goldPouch").textContent = "$"+balance.toLocaleString();
    $("#thisSpend").textContent = "$"+spend.toLocaleString();
    const goal = state.log.budget.goal || 500;
    const pct = Math.max(0, Math.min(100, Math.round(((Math.max(0, goal-spend))/goal)*100)));
    $("#budgetBar").style.width = pct+"%";
    tx.forEach(t=> list.appendChild(el("div",{className:"quest-row"},[ el("strong",{textContent:(t.amount>=0?"+ ":"- ")+money(Math.abs(t.amount)) }), el("span",{textContent:" — "+t.label}) ])));
  }
  draw();
  $("#addIncome").addEventListener("click",()=>{ const label=$("#incLabel").value.trim(); const amt=parseFloat($("#incAmt").value||"0"); if(!label||!amt) return; state.log.budget.txns.push({ts:Date.now(),label,amount:Math.abs(amt)}); addGold(GOLD_REWARD.budget_inc); $("#incLabel").value=""; $("#incAmt").value=""; addXP(state,4); saveState(state); draw(); renderHUD(); });
  $("#addExpense").addEventListener("click",()=>{ const label=$("#expLabel").value.trim(); const amt=parseFloat($("#expAmt").value||"0"); if(!label||!amt) return; state.log.budget.txns.push({ts:Date.now(),label,amount:-Math.abs(amt)}); addGold(GOLD_REWARD.budget_exp); $("#expLabel").value=""; $("#expAmt").value=""; addXP(state,2); saveState(state); draw(); renderHUD(); });
}

// ---- meals
function initMeals(){
  const grid=$("#mealGrid"); grid.replaceChildren();
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  days.forEach(d=> grid.appendChild(el("div",{className:"cell hdr", textContent:d})));
  ["breakfast","lunch","dinner"].forEach(mealRow =>{
    for(let d=0; d<7; d++){
      const cell=el("div",{className:"cell"});
      const ta=el("textarea",{value: state.log.meals.data[d][mealRow]||"", placeholder: mealRow });
      ta.addEventListener("input",()=>{ state.log.meals.data[d][mealRow]=ta.value; saveState(state); });
      cell.appendChild(ta); grid.appendChild(cell);
    }
  });
}

// ---- calendar
function initCalendar(){
  const grid=$("#weekGrid"); grid.replaceChildren();
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for(let d=0; d<7; d++){
    const col=el("div",{className:"day"});
    col.appendChild(el("div",{className:"ttl", textContent:days[d]}));
    (state.log.calendar.events[d]||[]).forEach(ev => col.appendChild(el("div",{className:"event", textContent:ev})));
    grid.appendChild(col);
  }
  $("#addCal").addEventListener("click",()=>{ const text=$("#calText").value.trim(); const day=Math.max(0, Math.min(6, parseInt($("#calDay").value||"0"))); if(!text) return; state.log.calendar.events[day].push(text); $("#calText").value=""; saveState(state); initCalendar(); });
}

// ---- shop (includes accessories store)
function initShop(){
  const list=$("#shopList");
  function draw(){
    list.replaceChildren();
    state.log.shop.items.forEach((it,i)=>{
      const row=el("div",{className:"quest-row"+(it.done?" done":"")});
      const box=el("div",{className:"checkbox"+(it.done?" checked":"")}); box.innerHTML=it.done?"✓":"";
      box.addEventListener("click",()=>{ it.done=!it.done; saveState(state); draw(); });
      const t=el("span",{textContent:it.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click",()=>{ state.log.shop.items.splice(i,1); saveState(state); draw(); });
      row.append(box,t,del); list.appendChild(row);
    });
  }
  draw();
  $("#addShop").addEventListener("click",()=>{ const t=$("#shopItem").value.trim(); if(!t) return; state.log.shop.items.push({title:t, done:false}); $("#shopItem").value=""; saveState(state); draw(); });

  // Accessories store
  const STORE=[{id:'cap',label:'Cap',cost:20},{id:'bow',label:'Bow',cost:25},{id:'glasses',label:'Glasses',cost:30},{id:'scarf',label:'Scarf',cost:35}];
  const storeEl=el('div',{className:'panel-list'});
  storeEl.appendChild(el('h3',{textContent:'Accessories Store'}));
  STORE.forEach(it=>{
    const owned=(state.economy.ownedAcc||[]).includes(it.id);
    const row=el('div',{className:'quest-row'},[el('span',{textContent:`${it.label} — 🪙 ${it.cost}`}), el('button',{className: owned?'secondary':'primary', textContent: owned? 'Owned' : 'Buy'})]);
    row.querySelector('button').addEventListener('click',()=>{
      if(owned) return;
      if((state.economy.gold||0) < it.cost){ alert('Not enough gold'); return; }
      state.economy.gold -= it.cost;
      state.economy.ownedAcc = Array.from(new Set([...(state.economy.ownedAcc||[]), it.id]));
      saveState(state); renderHUD(); initShop();
    });
    storeEl.appendChild(row);
  });
  list.parentElement.appendChild(storeEl);
}

// ---- rewards
function initRewards(){
  const grid=$("#badgeGrid"); grid.replaceChildren();
  const defs=[
    {id:"first-checkin", name:"First Check‑In", test:s=>s.log.moods.length>0, ico:"💠"},
    {id:"week-streak-3", name:"3‑Day Streak", test:s=>s.streak.best>=3, ico:"🔥"},
    {id:"ten-quests", name:"10 Quests", test:s=>s.log.tasks.filter(t=>t.done).length>=10, ico:"🏅"},
    {id:"budget-boss", name:"Budget Keeper", test:s=>s.log.budget.txns.length>=5, ico:"💰"}
  ];
  defs.forEach(b=>{ if(!state.log.rewards.badges.find(x=>x.id===b.id) && b.test(state)){ state.log.rewards.badges.push({id:b.id, name:b.name, ts:Date.now()}); } });
  saveState(state);
  defs.forEach(b=>{
    const unlocked=!!state.log.rewards.badges.find(x=>x.id===b.id);
    grid.appendChild(el("div",{className:"badge "+(unlocked?"":"locked")},[ el("div",{className:"b-ico", textContent:b.ico}), el("div",{className:"b-txt", textContent:b.name}) ]));
  });
}

// ---- checkin
function initCheckin(){
  let chosen=null;
  $$(".mood").forEach(b=> b.addEventListener("click",()=>{ $$(".mood").forEach(x=> x.classList.remove("active")); b.classList.add("active"); chosen=b.dataset.mood; }));
  $("#saveCheckin").addEventListener("click",()=>{ if(!chosen){ alert("Pick a mood"); return; } const tags=$("#checkinTags").value.trim(); const notes=$("#checkinNotes").value.trim(); const score={awful:1,bad:2,ok:3,good:4,great:5}[chosen]; state.log.moods.push({ts:Date.now(), mood:chosen, tags, notes, score}); touchStreak(state); addXP(state,5); addGold(GOLD_REWARD.checkin); saveState(state); renderHUD(); alert("Logged!"); });
}

// ---- journal
const PROMPTS = ["Name one tiny win from today.","What do you need less of right now?","Three things you’re grateful for:","What would kindness toward yourself look like today?","Finish this sentence: I feel most like me when…","A thought to let go:","A place that makes you breathe easier:","Something you’re proud of this week:"];
function initJournal(){
  const sel=$("#journalPrompt"); sel.replaceChildren(...PROMPTS.map(p=> el("option",{value:p, textContent:p})));
  $("#newPrompt").addEventListener("click",()=>{ sel.value = PROMPTS[Math.floor(Math.random()*PROMPTS.length)]; });
  $("#saveJournal").addEventListener("click",()=>{ const prompt=sel.value; const text=$("#journalText").value.trim(); if(!text) return; state.log.journal.push({ id: crypto.randomUUID(), ts: Date.now(), prompt, text }); touchStreak(state); addXP(state,6); addGold(GOLD_REWARD.journal); saveState(state); initJournal(); });
  const list=$("#journalList"); list.replaceChildren(); state.log.journal.slice().reverse().forEach(j=> list.appendChild(el("div",{className:"quest-row"},[ el("strong",{textContent:fmtDate(j.ts)}), el("span",{textContent:" — "+j.prompt}), el("div",{textContent:j.text}) ])));
}

// ---- minigames
function initMinigame(){
  const c=document.getElementById('popGame');
  if(!c) return;
  if(!state.settings?.toddler){ routeTo('home'); renderRoute(); return; }
  const ctx=c.getContext('2d'), W=c.width, H=c.height;
  const bs=[]; const spawn=()=> bs.push({x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false});
  for(let i=0;i<8;i++) spawn();
  let score=0,last=0,done=false;
  c.addEventListener('click',e=>{ const r=c.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top; for(const b of bs){ if(Math.hypot(b.x-x,b.y-y)<b.r){ b.pop=true; score++; addGold(1); break; } } });
  (function loop(t){ if(done) return; const dt=(t-last)||16; last=t; ctx.clearRect(0,0,W,H);
    for(const b of bs){ b.y-=b.v*dt/1000; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(135,206,250,0.6)'; ctx.fill(); if(b.pop||b.y+b.r<-10){ Object.assign(b,{x:Math.random()*W,y:H+20,r:12+Math.random()*18,v:40+Math.random()*50,pop:false}); } }
    ctx.fillStyle='#fff'; ctx.fillText('Popped: '+score,12,20);
    if(score>=20){ done=true; addXP(state,20); addGold(5); fxConfetti(); fxToast('Great job! +XP +Gold'); return; }
    requestAnimationFrame(loop);
  })(0);
}

// ---- breathe
function startBreathing(circleEl, phaseEl, onFinish){
  const phases=[{name:"Inhale",secs:4},{name:"Hold",secs:4},{name:"Exhale",secs:6},{name:"Hold",secs:2}];
  let active=true,i=0,total=0; function step(){ if(!active) return; const p=phases[i%phases.length]; phaseEl.textContent=p.name; animateCircle(circleEl,p.name); setTimeout(()=>{ total+=p.secs; i++; if(total>=60){ active=false; onFinish(60); return;} step(); }, p.secs*1000);} step(); return ()=>{ active=false; phaseEl.textContent="Ready"; circleEl.style.transform="scale(1)"; }; }
function animateCircle(el, phase){ if(phase==="Inhale"){ el.style.transform="scale(1.2)"; el.style.borderColor="var(--accent)"; } else if(phase==="Exhale"){ el.style.transform="scale(0.85)"; el.style.borderColor="var(--accent-2)"; } else { el.style.transform="scale(1)"; el.style.borderColor="var(--muted)"; } }
function initBreathe(){
  const circle=$("#breathCircle"), phase=$("#breathPhase"); let stop=null;
  $("#startBreath").addEventListener("click",()=>{ if(stop) stop(); stop=startBreathing(circle,phase, secs=>{ state.log.breath.push({ts:Date.now(),secs}); touchStreak(state); addXP(state,4); addGold(GOLD_REWARD.breathe); saveState(state); alert("Nice breathing session ✨"); renderHUD(); }); });
  $("#stopBreath").addEventListener("click",()=>{ if(stop){ stop(); stop=null; } });
}

// ---- pet
function accessories(list){ const set=new Set(list); let s=""; if(set.has("cap")) s+=`<path d="M42 40 q18 -16 36 0 v8 h-36z" fill="#1f2937"/>`; if(set.has("bow")) s+=`<path d="M52 78 q-12 -4 0 -8 q12 4 0 8z" fill="#e11d48"/><path d="M68 78 q12 -4 0 -8 q-12 4 0 8z" fill="#e11d48"/><circle cx="60" cy="76" r="6" fill="#be123c"/>`; if(set.has("glasses")) s+=`<circle cx="50" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><circle cx="70" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><line x1="57" y1="48" x2="63" y2="48" stroke="#111" stroke-width="2"/>`; return s; }
function petSVG(species, level, acc=[]){
  const core = { birb:`<ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)"/><circle cx="60" cy="52" r="18" fill="url(#g)"/><circle cx="52" cy="48" r="4" fill="#111"/><circle cx="68" cy="48" r="4" fill="#111"/><polygon points="60,55 56,60 64,60" fill="#ffc66d"/>`,
                 sprout:`<rect x="30" y="45" width="60" height="55" rx="16" fill="url(#g)"/><circle cx="60" cy="40" r="8" fill="#64d66a"/><ellipse cx="54" cy="38" rx="6" ry="3" fill="#64d66a"/><ellipse cx="66" cy="38" rx="6" ry="3" fill="#64d66a"/>`,
                 blob:`<circle cx="60" cy="70" r="38" fill="url(#g)"/><circle cx="48" cy="64" r="5" fill="#111"/><circle cx="72" cy="64" r="5" fill="#111"/>` }[species] || "";
  const defs = `<defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></radialGradient></defs>`;
  const levelBadge = `<text x="10" y="18" font-size="12" fill="rgba(255,255,255,.65)">Lv.</text><rect x="28" y="6" rx="6" ry="6" width="26" height="16" fill="rgba(0,0,0,.35)"/><text x="41" y="18" text-anchor="middle" font-weight="700" fill="#fff">${level}</text>`;
  return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Companion"><rect x="0" y="0" width="120" height="120" rx="22" fill="rgba(0,0,0,.15)"/>${defs}${core}${accessories(acc)}${levelBadge}</svg>`;
}
function petPixelSVG(species, level, acc=[]){
  const px=(x,y,c)=>`<rect x='${x}' y='${y}' width='1' height='1' fill='${c}'/>`;
  const C1=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#00eaff';
  const C2=getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim()||'#ff3ea5';
  const sprites={ birb:[ "................","......11........",".....1111.......","....111111......","...11111111.....","...11122111.....","...11222111.....","...11122111.....","...11111111.....","....111111......",".....1..1.......",".....1..1.......","................","................","................","................" ],
                  sprout:[ "................","......22........",".....2222.......",".......22.......","....111111......","...11111111.....","...11111111.....","...11111111.....","...11111111.....","...11111111.....","....111111......","................","................","................","................","................" ],
                  blob:[ "................","................","....111111......","..1111111111....","..1111111111....",".111111111111...",".111111111111...",".111111111111...",".111111111111...","..1111111111....","..1111111111....","....111111......","................","................","................","................" ] };
  const grid=sprites[species]||sprites.blob; let pixels=""; for(let y=0;y<16;y++){ for(let x=0;x<16;x++){ const ch=grid[y][x]; if(ch==='1') pixels+=px(x,y,C1); if(ch==='2') pixels+=px(x,y,C2);} }
  const levelBadge=`<text x="2" y="8" font-size="4" fill="rgba(255,255,255,.8)">Lv.${level}</text>`;
  return `<svg viewBox="0 0 16 16" width="140" height="140" class="pixelize" role="img"><rect x="0" y="0" width="16" height="16" fill="rgba(255,255,255,.04)" rx="2"/>${pixels}${levelBadge}</svg>`;
}
function initPet(){
  const stage=$("#petStage");
  const petMarkup = (state.user.art==='pixel') ? petPixelSVG(state.pet.species, state.pet.level, state.pet.acc) : petSVG(state.pet.species, state.pet.level, state.pet.acc);
  stage.innerHTML = `<div class="pet">${petMarkup}</div>`;
  const xp=state.pet.xp, lvl=state.pet.level, next=xpForLevel(lvl+1);
  $("#petStats").textContent = `Level ${lvl} — ${xp}/${next} XP`;

  const nameInput=$("#petName"), speciesInput=$("#petSpecies"), saveBtn=$("#savePet"), accList=$("#accList");
  const editRow=saveBtn?.closest('.row');
  const accDetails=accList?.closest('details');
  const toddler=state.settings?.toddler;

  nameInput.value=state.pet.name;
  speciesInput.value=state.pet.species;

  if(toddler){
    if(editRow) editRow.style.display='none';
    if(accDetails) accDetails.style.display='none';
    accList?.replaceChildren();
    document.getElementById('toddlerActions')?.remove();
    const actions=el('div',{id:'toddlerActions',className:'toddler-actions'},[
      el('button',{className:'primary',textContent:'Feed'}),
      el('button',{className:'primary',textContent:'Play'})
    ]);
    if(accDetails) accDetails.insertAdjacentElement('afterend',actions); else stage.insertAdjacentElement('afterend',actions);
    const [feedBtn,playBtn]=actions.querySelectorAll('button');
    feedBtn.addEventListener('click',()=>{ addXP(state,1); addGold(1); initPet(); renderHUD(); });
    playBtn.addEventListener('click',()=>{ addXP(state,1); addGold(1); initPet(); renderHUD(); });
  } else {
    if(editRow) editRow.style.display='';
    if(accDetails) accDetails.style.display='';
    document.getElementById('toddlerActions')?.remove();
    saveBtn.onclick=()=>{ state.pet.name=nameInput.value.trim()||"Pebble"; state.pet.species=speciesInput.value; saveState(state); initPet(); renderHUD(); };
    const acc=Array.from(new Set([...(state.economy.ownedAcc||[]), 'cap','glasses']));
    accList.replaceChildren();
    acc.forEach(a=>{ const btn=el('button',{className: state.pet.acc.includes(a)? "":"secondary", textContent:a}); btn.addEventListener('click',()=>{ const i=state.pet.acc.indexOf(a); if(i>=0) state.pet.acc.splice(i,1); else state.pet.acc.push(a); saveState(state); initPet(); }); accList.appendChild(btn); });
  }
}

// ---- settings
function initSettings(){
  $("#userName").value = state.user.name || "";
  $("#themeSelect").value = state.user.theme || "retro";
  $("#fontSelect").value = state.user.font || "press2p";
  $("#artSelect").value = state.user.art || "pixel";
  $("#scanlinesToggle").checked = !!state.user.scanlines;
  const tt = $("#toddlerToggle");
  if(tt){
    tt.checked = !!(state.settings && state.settings.toddler);
    tt.addEventListener("change",()=>{
      state.settings.toddler = tt.checked;
      state.log.coop.toddlerWeek = tt.checked;
      state.log.tasks = [];
      saveState(state);
      renderHUD();
      if(document.querySelector('#panelMain')) initTasks();
    });
  }
  $("#saveSettings").addEventListener("click",()=>{
    state.user.name = $("#userName").value.trim();
    state.user.theme = $("#themeSelect").value;
    state.user.font = $("#fontSelect").value;
    state.user.art = $("#artSelect").value;
    state.user.scanlines = $("#scanlinesToggle").checked;
    applyTheme(); saveState(state); alert("Saved!");
  });
  $("#resetApp").addEventListener("click",()=>{ if(confirm("Reset all data?")){ resetState(); state=loadState(); applyTheme(); renderRoute(); } });
}

// ---- Characters & Companion screens
function characterCards(){ return [ {id:'witch', label:'Witch', svg:petPixelSVG('sprout',1)}, {id:'knight', label:'Knight', svg:petPixelSVG('blob',1)}, {id:'ranger', label:'Ranger', svg:petPixelSVG('birb',1)} ]; }
function initCharacters(){ const grid=$('#charGrid'); grid.replaceChildren(); characterCards().forEach(c=>{ const card=el('div',{className:'char-card'},[ el('div',{className:'char-portrait', innerHTML:c.svg}), el('div',{textContent:c.label}) ]); card.addEventListener('click',()=>{ state.user.character={id:c.id,img:null}; saveState(state); fxToast('Character selected'); renderHUD(); routeTo('companion'); renderRoute(); }); grid.appendChild(card); }); const up=$('#uploadChar'); const file=$('#charFile'); up.addEventListener('click',()=> file.click()); file.addEventListener('change', ev=>{ const f=ev.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ state.user.character={id:'custom', img:rd.result}; saveState(state); renderHUD(); routeTo('companion'); renderRoute(); }; rd.readAsDataURL(f); }); }
function initCompanion(){ const grid=$('#compGrid'); grid.replaceChildren(); const opts=[ {id:'solo', label:'Solo Week', desc:'Just you + companion'}, {id:'toddler', label:'Toddler Week', desc:'Two characters co-op'} ]; opts.forEach(o=>{ const card=el('div',{className:'comp-card'},[ el('div',{className:'char-portrait', innerHTML: petPixelSVG('birb',1) }), el('div',{textContent:o.label}), el('div',{className:'sub', textContent:o.desc}) ]); card.addEventListener('click',()=>{ state.log.coop.toddlerWeek = (o.id==='toddler'); saveState(state); fxToast('Mode: '+o.label); routeTo('home'); renderRoute(); }); grid.appendChild(card); }); }

// Unlocks
function maybeUnlockAccessory(){ const POOL=['cap','bow','glasses']; const owned=new Set(state.economy.ownedAcc||[]); const cand = POOL.filter(x=>!owned.has(x)); if(cand.length && Math.random()<0.15){ const item=cand[Math.floor(Math.random()*cand.length)]; state.economy.ownedAcc = Array.from(new Set([...(state.economy.ownedAcc||[]), item])); fxToast('Unlocked: '+item+'!'); saveState(state);} }

// --- export/import
$("#exportBtn").addEventListener("click", ()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="soothebirb-data.json"; a.click(); URL.revokeObjectURL(url); });
$("#importBtn").addEventListener("click", ()=> $("#importFile").click());
$("#importFile").addEventListener("change", ev=>{ const file=ev.target.files[0]; if(!file) return; const rdr=new FileReader(); rdr.onload=()=>{ try{ state=JSON.parse(rdr.result); saveState(state); renderRoute(); alert("Imported!"); }catch(e){ alert("Invalid file."); } }; rdr.readAsText(file); });

// --- boot
touchStreak(state); saveState(state);
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); }
if(!location.hash || !['#home','#tasks','#clean','#coop','#budget','#meals','#calendar','#shop','#rewards','#checkin','#journal','#breathe','#minigames','#pet','#settings','#characters','#companion'].includes(location.hash)){ location.hash = '#home'; }
renderRoute();
