// Single-module app

// ===== store (localStorage)
const KEY = "soothebirb.v2";

const defaultState = () => ({
  user: { name: "", theme: "retro", font: "pixel", art:"pixel", scanlines:true },
  pet: { name: "Pebble", species: "birb", level: 1, xp: 0, acc: ["cap","glasses"] },
  streak: { current: 0, best: 0, lastCheck: "" },
  log: {
    moods: [],            // {ts, mood, tags, notes, score}
    tasks: [],            // {id, title, tier: 'main'|'side'|'bonus', done, ts}
    journal: [],          // {id, ts, prompt, text}
    breath: [],           // {ts, secs}
    clean: { small: [], boss: { name: 'Bathroom', progress: 0 }, raid: { name:'Week 2', note:'Deep clean' } },
    coop: { toddlerWeek:false, quests: [], collectibles: [] },
    budget: { goal: 500, txns: [] },
    meals: { data: Array.from({length:7},()=>({breakfast:'', lunch:'', dinner:''})) },
    calendar: { events: Array.from({length:7},()=>[]) },
    shop: { items: [] },
    rewards: { badges: [] }
  }
});

function loadState(){ try{ return JSON.parse(localStorage.getItem(KEY)) || defaultState(); } catch(e){ return defaultState(); } }
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function resetState(){ localStorage.removeItem(KEY); }
function dayKey(ts=new Date()){ const d=new Date(ts); d.setHours(0,0,0,0); return d.toISOString(); }
function touchStreak(state){
  const today = dayKey();
  if(state.streak.lastCheck !== today){
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const yKey = dayKey(yesterday);
    if(state.streak.lastCheck === yKey){ state.streak.current += 1; } else { state.streak.current = 1; }
    state.streak.best = Math.max(state.streak.best, state.streak.current);
    state.streak.lastCheck = today;
  }
}
function addXP(state, amount){ state.pet.xp += amount; while(state.pet.xp >= xpForLevel(state.pet.level+1)){ state.pet.level += 1; fxToast('Level Up!'); fxBlast(); fxBeep(1320, 0.08);} fxReward('+'+amount+' XP'); registerXPEvent(); }
function xpForLevel(level){ return level*level*10; }

// ===== ui helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function routeTo(name){ window.location.hash = name; }
function setActiveNav(name){ $$(".nav-btn").forEach(b=> b.classList.toggle("active", b.dataset.route===name)); }
function el(tag, opts={}, children=[]){ const e=document.createElement(tag); Object.assign(e, opts); if(opts.attrs){ for(const [k,v] of Object.entries(opts.attrs)) e.setAttribute(k,v); } if(typeof children==="string"){ e.innerHTML=children; } else children.forEach(c=> e.appendChild(c)); return e; }
function fmtDate(ts){ const d=new Date(ts); return d.toLocaleDateString(undefined, {month:"short", day:"numeric"}); }

// --- dopamine FX ---
function fxToast(text){ const t=document.createElement('div'); t.className='toast'; t.textContent=text; document.body.appendChild(t); setTimeout(()=>t.remove(), 1400); }
function fxConfetti(x=window.innerWidth/2, y=window.innerHeight*0.18, n=20){
  const layer = document.getElementById('fxLayer'); if(!layer) return;
  for(let i=0;i<n;i++){
    const s=document.createElement('span'); s.className='confetti'+(i%2?' alt':''); s.style.left=x+'px'; s.style.top=y+'px';
    const dx=(Math.random()*2-1)*140, dy=(Math.random()*-1)*180-40, rot=(Math.random()*360);
    s.animate([ { transform:`translate(-50%,-50%)`, opacity:1 }, { transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity:0 } ], { duration: 900+Math.random()*500, easing:'cubic-bezier(.2,.9,.2,1)' });
    layer.appendChild(s); setTimeout(()=>s.remove(), 1500);
  }
}
function fxReward(label='+XP'){ fxToast(label); fxConfetti(); try{ navigator.vibrate && navigator.vibrate(10);}catch(e){}; fxBeep(880, 0.04); }
let _audioCtx; function fxBeep(freq=880, dur=0.05){ try{ _audioCtx = _audioCtx || new (window.AudioContext||window.webkitAudioContext)(); const o=_audioCtx.createOscillator(), g=_audioCtx.createGain(); o.frequency.value=freq; o.type='square'; o.connect(g); g.connect(_audioCtx.destination); g.gain.setValueAtTime(0.02, _audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, _audioCtx.currentTime + dur); o.start(); o.stop(_audioCtx.currentTime + dur);}catch(e){} }
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


// ===== pet art
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
                  blob:[ "................","................","....111111......","..1111111111....","..1111111111....",".111111111111...",".111111111111...",".111111111111...",".111111111111...", "..1111111111....","..1111111111....","....111111......","................","................","................","................" ] };
  const grid=sprites[species]||sprites.blob; let pixels=""; for(let y=0;y<16;y++){ for(let x=0;x<16;x++){ const ch=grid[y][x]; if(ch==='1') pixels+=px(x,y,C1); if(ch==='2') pixels+=px(x,y,C2);} }
  const levelBadge=`<text x="2" y="8" font-size="4" fill="rgba(255,255,255,.8)">Lv.${level}</text>`;
  return `<svg viewBox="0 0 16 16" width="140" height="140" class="pixelize" role="img"><rect x="0" y="0" width="16" height="16" fill="rgba(255,255,255,.04)" rx="2"/>${pixels}${levelBadge}</svg>`;
}

// ===== activities
const PROMPTS = ["Name one tiny win from today.","What do you need less of right now?","Three things you’re grateful for:","What would kindness toward yourself look like today?","Finish this sentence: I feel most like me when…","A thought to let go:","A place that makes you breathe easier:","Something you’re proud of this week:"];
function startBreathing(circleEl, phaseEl, onFinish){
  const phases=[{name:"Inhale",secs:4},{name:"Hold",secs:4},{name:"Exhale",secs:6},{name:"Hold",secs:2}];
  let active=true,i=0,total=0; function step(){ if(!active) return; const p=phases[i%phases.length]; phaseEl.textContent=p.name; animateCircle(circleEl,p.name); setTimeout(()=>{ total+=p.secs; i++; if(total>=60){ active=false; onFinish(60); return;} step(); }, p.secs*1000);} step(); return ()=>{ active=false; phaseEl.textContent="Ready"; circleEl.style.transform="scale(1)"; }; }
function animateCircle(el, phase){ if(phase==="Inhale"){ el.style.transform="scale(1.2)"; el.style.borderColor="var(--accent)"; } else if(phase==="Exhale"){ el.style.transform="scale(0.85)"; el.style.borderColor="var(--accent-2)"; } else { el.style.transform="scale(1)"; el.style.borderColor="var(--muted)"; } }

// ===== app
let state = loadState();
// patch tasks without tier (older saves)
if(state.log.tasks){ state.log.tasks.forEach(t=>{ if(!('tier' in t)) t.tier='side'; }); }

// export/import
$("#exportBtn").addEventListener("click", ()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="soothebirb-data.json"; a.click(); URL.revokeObjectURL(url); });
$("#importBtn").addEventListener("click", ()=> $("#importFile").click());
$("#importFile").addEventListener("change", ev=>{ const file=ev.target.files[0]; if(!file) return; const rdr=new FileReader(); rdr.onload=()=>{ try{ state=JSON.parse(rdr.result); saveState(state); renderRoute();
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); } alert("Imported!"); }catch(e){ alert("Invalid file."); } }; rdr.readAsText(file); });

// theme
function applyTheme(){
  document.documentElement.className="";
  document.documentElement.classList.add("theme-"+(state.user.theme||"retro"));
  document.body.style.fontFamily = (state.user.font==="pixel" ? "'ArcadePixel', monospace" : state.user.font);
  document.body.classList.toggle('crt', !!state.user.scanlines);
}
applyTheme();

// HUD
function renderHUD(){
  const hp=3, cur=Math.min(3, 1 + (state.streak.current>0?1:0) + (state.pet.level>3?1:0));
  $("#hudHearts").innerHTML = Array.from({length:3},(_,i)=>`<span class="heart ${i<cur?'':'off'}"></span>`).join("");
  const lvl=state.pet.level, xp=state.pet.xp, next=xpForLevel(lvl+1), prev=xpForLevel(lvl);
  const pct = Math.max(0, Math.min(100, Math.round(((xp-prev)/(next-prev))*100)));
  $("#hudLevel").textContent = `Lv ${lvl}`; $("#hudXp").style.width = pct+"%";
}
renderHUD();

// routing
$$(".top-nav .nav-btn").forEach(btn=> btn.addEventListener("click", ()=>{ routeTo(btn.dataset.route); renderRoute();
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); } }));
window.addEventListener("hashchange", renderRoute);
renderRoute();
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); }

function renderRoute(){
  const name=(location.hash||"#home").replace("#","");
  setActiveNav(name);
  moveNavHi();
  const view=$("#view"); view.innerHTML="";
  const tpl=$("#tpl-"+name); if(!tpl){ view.textContent="Not found"; return; }
  view.appendChild(tpl.content.cloneNode(true));
  wireTiles();
  if(name==="home") initDashboard();
  if(name==="tasks") initTasks();
  if(name==="clean") initCleaning();
  if(name==="coop") initCoop();
  if(name==="budget") initBudget();
  if(name==="meals") initMeals();
  if(name==="calendar") initCalendar();
  if(name==="shop") initShop();
  if(name==="rewards") initRewards();
  if(name==="checkin") initCheckin();
  if(name==="journal") initJournal();
  if(name==="breathe") initBreathe();
  if(name==="pet") initPet();
  if(name==="settings") initSettings();
  updateFooter();
}

// ---- footer
function updateFooter(){ $("#streakLabel").textContent = `Streak: ${state.streak.current} 🔥 | Best: ${state.streak.best}`; }

// ---- dashboard
function initDashboard(){
  const lvl=state.pet.level, xp=state.pet.xp, next=xpForLevel(lvl+1), prev=xpForLevel(lvl);
  const pct=Math.max(0, Math.min(100, Math.round(((xp-prev)/(next-prev))*100)));
  const bar=$("#xpBig"); if(bar) bar.style.width=pct+"%";
  const lbl=$("#xpBigLabel"); if(lbl) lbl.textContent = `Lv ${lvl}`;
}

// ---- quests
const DEFAULT_TASKS = [
  {title:"Pay a bill", tier:"main"},
  {title:"Pick up prescription", tier:"main"},
  {title:"Clean bathroom", tier:"side"},
  {title:"Journal", tier:"side"},
  {title:"Organize drawer", tier:"bonus"},
];
function initTasks(){
  if(state.log.tasks.length===0){ DEFAULT_TASKS.forEach(t=> state.log.tasks.push({id:crypto.randomUUID(), title:t.title, tier:t.tier, done:false, ts:0})); saveState(state); }
  const panelMain=$("#panelMain"), panelSide=$("#panelSide"), panelBonus=$("#panelBonus");
  function render(){
    panelMain.replaceChildren(); panelSide.replaceChildren(); panelBonus.replaceChildren();
    const tiers={main:panelMain, side:panelSide, bonus:panelBonus};
    state.log.tasks.forEach(task=>{
      const row=el("div",{className:"quest-row"+(task.done?" done":"")});
      const box=el("div",{className:"checkbox"+(task.done?" checked":"")}); box.innerHTML=task.done?"✓":"";
      box.addEventListener("click", ()=>{ task.done=!task.done; task.ts=task.done?Date.now():0; if(task.done){ touchStreak(state); addXP(state,3);} saveState(state); render(); updateFooter(); renderHUD(); });
      const title=el("span",{textContent:task.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click", ()=>{ state.log.tasks=state.log.tasks.filter(x=>x.id!==task.id); saveState(state); render(); });
      row.append(box,title,del); (tiers[task.tier||"side"]||panelSide).appendChild(row);
    });
  }
  render();
  $("#addTaskBtn").addEventListener("click", ()=>{
    const t=$("#newTaskTitle").value.trim(); if(!t) return;
    const tier=$("#newTaskTier").value||"side";
    state.log.tasks.push({id:crypto.randomUUID(), title:t, tier, done:false, ts:0});
    $("#newTaskTitle").value=""; saveState(state); render();
  });
}

// ---- cleaning
function initCleaning(){
  const small=$("#cleanSmall");
  function draw(){
    small.replaceChildren();
    state.log.clean.small.forEach((q,i)=>{
      const row=el("div",{className:"quest-row"+(q.done?" done":"")});
      const box=el("div",{className:"checkbox"+(q.done?" checked":"")}); box.innerHTML=q.done?"✓":"";
      box.addEventListener("click",()=>{ q.done=!q.done; if(q.done) addXP(state,2); saveState(state); draw(); renderHUD(); });
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
      box.addEventListener("click",()=>{ q.done=!q.done; if(q.done) addXP(state,2); saveState(state); draw(); renderHUD(); });
      const t=el("span",{textContent:q.title});
      const del=el("button",{className:"secondary", textContent:"Delete"}); del.addEventListener("click",()=>{ state.log.coop.quests.splice(i,1); saveState(state); draw(); });
      row.append(box,t,del); list.appendChild(row);
    });
    (state.log.rewards.badges||[]).forEach(b=> coll.appendChild(el("div",{className:"quest-row"},[el("span",{textContent:b.name+" ⭐"})])));
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
  $("#addIncome").addEventListener("click",()=>{ const label=$("#incLabel").value.trim(); const amt=parseFloat($("#incAmt").value||"0"); if(!label||!amt) return; state.log.budget.txns.push({ts:Date.now(),label,amount:Math.abs(amt)}); $("#incLabel").value=""; $("#incAmt").value=""; addXP(state,4); saveState(state); draw(); renderHUD(); });
  $("#addExpense").addEventListener("click",()=>{ const label=$("#expLabel").value.trim(); const amt=parseFloat($("#expAmt").value||"0"); if(!label||!amt) return; state.log.budget.txns.push({ts:Date.now(),label,amount:-Math.abs(amt)}); $("#expLabel").value=""; $("#expAmt").value=""; addXP(state,2); saveState(state); draw(); renderHUD(); });
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

// ---- shop
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
  $("#saveCheckin").addEventListener("click",()=>{ if(!chosen){ alert("Pick a mood"); return; } const tags=$("#checkinTags").value.trim(); const notes=$("#checkinNotes").value.trim(); const score={awful:1,bad:2,ok:3,good:4,great:5}[chosen]; state.log.moods.push({ts:Date.now(), mood:chosen, tags, notes, score}); touchStreak(state); addXP(state,5); saveState(state); renderHUD(); alert("Logged!"); });
}

// ---- journal
function initJournal(){
  const sel=$("#journalPrompt"); sel.replaceChildren(...PROMPTS.map(p=> el("option",{value:p, textContent:p})));
  $("#newPrompt").addEventListener("click",()=>{ sel.value = PROMPTS[Math.floor(Math.random()*PROMPTS.length)]; });
  $("#saveJournal").addEventListener("click",()=>{ const prompt=sel.value; const text=$("#journalText").value.trim(); if(!text) return; state.log.journal.push({ id: crypto.randomUUID(), ts: Date.now(), prompt, text }); touchStreak(state); addXP(state,6); saveState(state); initJournal(); });
  const list=$("#journalList"); list.replaceChildren(); state.log.journal.slice().reverse().forEach(j=> list.appendChild(el("div",{className:"quest-row"},[ el("strong",{textContent:fmtDate(j.ts)}), el("span",{textContent:" — "+j.prompt}), el("div",{textContent:j.text}) ])));
}

// ---- breathe
function initBreathe(){
  const circle=$("#breathCircle"), phase=$("#breathPhase"); let stop=null;
  $("#startBreath").addEventListener("click",()=>{ if(stop) stop(); stop=startBreathing(circle,phase, secs=>{ state.log.breath.push({ts:Date.now(),secs}); touchStreak(state); addXP(state,4); saveState(state); alert("Nice breathing session ✨"); renderHUD(); }); });
  $("#stopBreath").addEventListener("click",()=>{ if(stop){ stop(); stop=null; } });
}

// ---- pet
function initPet(){
  const stage=$("#petStage");
  const petMarkup = (state.user.art==='pixel') ? petPixelSVG(state.pet.species, state.pet.level, state.pet.acc) : petSVG(state.pet.species, state.pet.level, state.pet.acc);
  stage.innerHTML = `<div class="pet">${petMarkup}</div>`;
  const xp=state.pet.xp, lvl=state.pet.level, next=xpForLevel(lvl+1);
  $("#petStats").textContent = `Level ${lvl} — ${xp}/${next} XP`;
  $("#petName").value = state.pet.name; $("#petSpecies").value = state.pet.species;
  $("#savePet").addEventListener("click",()=>{ state.pet.name=$("#petName").value.trim()||"Pebble"; state.pet.species=$("#petSpecies").value; saveState(state); initPet(); renderHUD(); });
  const acc=["cap","bow","glasses"]; const accList=$("#accList"); accList.replaceChildren();
  acc.forEach(a=>{ const btn=el("button",{className: state.pet.acc.includes(a)? "":"secondary", textContent:a}); btn.addEventListener("click",()=>{ const i=state.pet.acc.indexOf(a); if(i>=0) state.pet.acc.splice(i,1); else state.pet.acc.push(a); saveState(state); initPet(); }); accList.appendChild(btn); });
}

// ---- settings
function initSettings(){
  $("#userName").value = state.user.name || "";
  $("#themeSelect").value = state.user.theme || "retro";
  $("#fontSelect").value = state.user.font || "pixel";
  $("#artSelect").value = state.user.art || "pixel";
  $("#scanlinesToggle").checked = !!state.user.scanlines;
  $("#saveSettings").addEventListener("click",()=>{
    state.user.name = $("#userName").value.trim();
    state.user.theme = $("#themeSelect").value;
    state.user.font = $("#fontSelect").value;
    state.user.art = $("#artSelect").value;
    state.user.scanlines = $("#scanlinesToggle").checked;
    applyTheme(); saveState(state); alert("Saved!");
  });
  $("#resetApp").addEventListener("click",()=>{ if(confirm("Reset all data?")){ resetState(); state=loadState(); applyTheme(); renderRoute();
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); } } });
}

// boot streak at load
touchStreak(state); saveState(state);

// Safe: wire dashboard tiles to routes
function wireTiles(){
  document.querySelectorAll('.tile[data-route]').forEach(t => {
    t.addEventListener('click', ()=>{ routeTo(t.dataset.route); renderRoute();
const _mb=document.getElementById('musicBtn'); if(_mb){ _mb.addEventListener('click', ()=> toggleMusic()); } });
  });
}

// Retro chiptune (no external assets)
let MUSIC_ON=false, _audioCtx=null, _seqTimer=null;
function ensureAudio(){ if(!_audioCtx){ try{ _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return _audioCtx; }
function tone(freq=440, dur=0.25, type='square', vol=0.02){
  const ctx = ensureAudio(); if(!ctx) return;
  const o=ctx.createOscillator(), g=ctx.createGain();
  o.type=type; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
  const t=ctx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o.start(t); o.stop(t+dur+0.02);
}
function midi(n){ return 440 * Math.pow(2, (n-69)/12); }
const SONG={ bpm:112, lead:[74,74,77,74,79,79,77,74, 74,74,77,74,81,81,79,77], bass:[50,50,55,55,48,48,43,43,50,50,55,55,48,48,43,43] };
function startMusic(){ const ctx=ensureAudio(); if(!ctx || _seqTimer) return; MUSIC_ON=true; document.getElementById('musicBtn')?.classList.add('on'); const spb=60/SONG.bpm, step=spb/2; let i=0; _seqTimer=setInterval(()=>{ tone(midi(SONG.lead[i%SONG.lead.length]), step*.9, 'square', .02); tone(midi(SONG.bass[i%SONG.bass.length]), step*.9, 'sawtooth', .01); i++; }, step*1000); }
function stopMusic(){ MUSIC_ON=false; document.getElementById('musicBtn')?.classList.remove('on'); if(_seqTimer){ clearInterval(_seqTimer); _seqTimer=null; } }
function toggleMusic(){ if(MUSIC_ON) stopMusic(); else startMusic(); }
document.addEventListener('click', function unlock(){ ensureAudio(); document.removeEventListener('click', unlock); }, {once:true});

// Big-screen celebration
function fxBlast(){
  fxConfetti(window.innerWidth/2, window.innerHeight*0.4, 320);
  const bloom=document.createElement('div'); bloom.className='bloom'; document.body.appendChild(bloom); setTimeout(()=>bloom.remove(), 700);
  const shock=document.createElement('div'); shock.className='shock'; document.body.appendChild(shock); setTimeout(()=>shock.remove(), 800);
}
// Combo detection (3+ XP events in 15s)
const _xpTimes=[];
function registerXPEvent(){ const now=Date.now(); _xpTimes.push(now); while(_xpTimes.length && now-_xpTimes[0]>15000) _xpTimes.shift(); if(_xpTimes.length>=3){ fxToast('COMBO!'); fxBlast(); } }


// ===== Particle trail (throttled) =====
let _trailLast = 0;
function trailAt(x,y){
  const now=performance.now(); if(now-_trailLast<18) return; _trailLast=now;
  const fx = document.getElementById('fxLayer'); if(!fx) return;
  const s = document.createElement('span'); s.className='trail'+(Math.random()<.5?' alt':''); s.style.left=x+'px'; s.style.top=y+'px';
  fx.appendChild(s); setTimeout(()=>s.remove(), 400);
}
window.addEventListener('mousemove', e=> trailAt(e.clientX, e.clientY), {passive:true});
window.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(t) trailAt(t.clientX, t.clientY); }, {passive:true});

// ===== Coin drops =====
let COIN_MODE=false;
function spawnCoin(x=window.innerWidth/2, y=window.innerHeight*.35){
  const c=document.createElement('div'); c.className='coin'; c.style.left=x+'px'; c.style.top=y+'px';
  c.addEventListener('click', ()=>{ COIN_MODE=true; addXP(state,1); COIN_MODE=false; fxToast('Bonus +1 XP'); c.remove(); });
  document.body.appendChild(c); setTimeout(()=> c.remove(), 1800);
}

// ===== Jackpot =====
function fxJackpot(){
  document.body.classList.add('shake'); setTimeout(()=>document.body.classList.remove('shake'), 420);
  fxBlast();
  const j=document.createElement('div'); j.className='jackpot'; j.textContent='JACKPOT!'; document.body.appendChild(j); setTimeout(()=>j.remove(), 1200);
  // rain extra coins
  for(let i=0;i<8;i++){ setTimeout(()=> spawnCoin(window.innerWidth*(.15+.7*Math.random()), window.innerHeight*.3), i*60); }
  fxBeep(1660, .08); setTimeout(()=>fxBeep(1320,.08),80); setTimeout(()=>fxBeep(990,.08),160);
}

// Hook into XP rewards without breaking flow
const _oldAddXP = addXP;
addXP = function(state, amount){
  _oldAddXP(state, amount);
  if(!COIN_MODE){ if(Math.random()<0.6) spawnCoin(); if(Math.random()<0.02) fxJackpot(); }
};
