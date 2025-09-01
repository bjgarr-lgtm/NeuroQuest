// == store.js ==

// Simple localStorage data layer
const KEY = "soothebirb.v1";

const defaultState = () => ({
  user: { name: "", theme: "forest", font: "system-ui" },
  pet: { name: "Pebble", species: "birb", level: 1, xp: 0, acc: [], discovered: ["cap","bow","glasses"] },
  streak: { current: 0, best: 0, lastCheck: "" },
  log: {
    moods: [], // {ts, mood, tags, notes, score}
    tasks: [], // {id, title, done, ts}
    journal: [], // {id, ts, prompt, text}
    breath: []  // {ts, secs}
  }
});

function loadState(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || defaultState(); }
  catch(e){ return defaultState(); }
}

function saveState(s){
  localStorage.setItem(KEY, JSON.stringify(s));
}

function resetState(){
  localStorage.removeItem(KEY);
}

function dayKey(ts=new Date()){
  const d = new Date(ts);
  d.setHours(0,0,0,0);
  return d.toISOString();
}

function touchStreak(state){
  const today = dayKey();
  if(state.streak.lastCheck !== today){
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const yKey = dayKey(yesterday);
    if(state.streak.lastCheck === yKey){
      state.streak.current += 1;
    } else {
      state.streak.current = 1;
    }
    state.streak.best = Math.max(state.streak.best, state.streak.current);
    state.streak.lastCheck = today;
  }
}

function addXP(state, amount){
  state.pet.xp += amount;
  while(state.pet.xp >= xpForLevel(state.pet.level+1)){
    state.pet.level += 1;
  }
}

function xpForLevel(level){
  return level*level*10; // quadratic
}


// == ui.js ==

// Tiny DOM helpers and routing
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function routeTo(name){
  window.location.hash = name;
}

function setActiveNav(name){
  $$(".nav-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.route===name);
  });
}

function el(tag, opts={}, children=[]){
  const e = document.createElement(tag);
  Object.assign(e, opts);
  for(const [k,v] of Object.entries(opts.attrs||{})){ e.setAttribute(k,v); }
  if(typeof children === "string"){ e.innerHTML = children; }
  else children.forEach(c=> e.appendChild(c));
  return e;
}

function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {month:"short", day:"numeric"});
}

function sparkline(svg, values){
  const W=320, H=64;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  if(!values.length){ svg.innerHTML=""; return; }
  const max = Math.max(...values), min = Math.min(...values);
  const norm = v => (H-4) - ((v-min)/(max-min||1))*(H-8);
  const step = W/Math.max(1, values.length-1);
  let d="M 0 "+norm(values[0]);
  values.forEach((v,i)=> d += ` L ${i*step} ${norm(v)}`);
  svg.innerHTML = `<path d="${d}" fill="none" stroke="var(--accent-2)" stroke-width="2"/>`;
}


// == pet.js ==

// Companion rendering (simple SVG-based critters) and accessories
function petSVG(species, level, acc=[]){
  // base body
  const core = {
    birb: `<ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)"/><circle cx="60" cy="52" r="18" fill="url(#g)"/>
           <circle cx="52" cy="48" r="4" fill="#111"/><circle cx="68" cy="48" r="4" fill="#111"/>
           <polygon points="60,55 56,60 64,60" fill="#ffc66d"/>`,
    sprout:`<rect x="30" y="45" width="60" height="55" rx="16" fill="url(#g)"/>
            <circle cx="60" cy="40" r="8" fill="#64d66a"/><ellipse cx="54" cy="38" rx="6" ry="3" fill="#64d66a"/><ellipse cx="66" cy="38" rx="6" ry="3" fill="#64d66a"/>`,
    blob:  `<circle cx="60" cy="70" r="38" fill="url(#g)"/>
            <circle cx="48" cy="64" r="5" fill="#111"/><circle cx="72" cy="64" r="5" fill="#111"/>`
  }[species] || ""

  const defs = `<defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></radialGradient></defs>`;

  const levelBadge = `<text x="10" y="18" font-size="12" fill="rgba(0,0,0,.65)">Lv.</text>
                      <rect x="28" y="6" rx="6" ry="6" width="26" height="16" fill="rgba(0,0,0,.35)"/>
                      <text x="41" y="18" text-anchor="middle" font-weight="700" fill="#fff">${level}</text>`;

  const accSVG = accessories(acc);

  return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Companion">
    ${defs}
    <rect x="0" y="0" width="120" height="120" rx="22" fill="rgba(0,0,0,.15)"/>
    ${core}
    ${accSVG}
    ${levelBadge}
  </svg>`;
}

function accessories(list){
  const set = new Set(list);
  let s = "";
  if(set.has("cap")) s += `<path d="M42 40 q18 -16 36 0 v8 h-36z" fill="#1f2937"/>`;
  if(set.has("bow")) s += `<path d="M52 78 q-12 -4 0 -8 q12 4 0 8z" fill="#e11d48"/><path d="M68 78 q12 -4 0 -8 q-12 4 0 8z" fill="#e11d48"/><circle cx="60" cy="76" r="6" fill="#be123c"/>`;
  if(set.has("glasses")) s += `<circle cx="50" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><circle cx="70" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><line x1="57" y1="48" x2="63" y2="48" stroke="#111" stroke-width="2"/>`;
  if(set.has("leaf")) s += `<path d="M84 28 q12 6 -2 16 q-12 -6 2 -16z" fill="#22c55e"/>`;
  if(set.has("star")) s += `<polygon points="60,22 65,34 78,34 67,41 71,54 60,46 49,54 53,41 42,34 55,34" fill="#f59e0b"/>`;
  return s;
}

const ALL_ACC = [
  { id:"cap", name:"Cap" }, { id:"bow", name:"Bow" }, { id:"glasses", name:"Glasses" },
  { id:"leaf", name:"Leaf" }, { id:"star", name:"Star" }
];


// == activities.js ==

// Breathing animation and prompts
function startBreathing(circleEl, phaseEl, onFinish){
  const phases = [
    {name:"Inhale", secs:4},
    {name:"Hold", secs:4},
    {name:"Exhale", secs:6},
    {name:"Hold", secs:2},
  ];
  let active = true;
  let i=0;
  let totalSecs = 0;

  function step(){
    if(!active) return;
    const p = phases[i % phases.length];
    phaseEl.textContent = p.name;
    animateCircle(circleEl, p.name);
    const t = setTimeout(()=>{
      totalSecs += p.secs;
      i++;
      if(totalSecs >= 60){ active=false; onFinish(60); return; }
      step();
    }, p.secs*1000);
  }
  step();
  return () => { active=false; phaseEl.textContent="Ready"; circleEl.style.transform="scale(1)"; }
}

function animateCircle(el, phase){
  if(phase==="Inhale"){ el.style.transform = "scale(1.2)"; el.style.borderColor="var(--accent)"; }
  else if(phase==="Exhale"){ el.style.transform = "scale(0.85)"; el.style.borderColor="var(--accent-2)"; }
  else { el.style.transform = "scale(1)"; el.style.borderColor="var(--muted)"; }
}

const PROMPTS = [
  "Name one tiny win from today.",
  "What do you need less of right now?",
  "Three things you’re grateful for:",
  "What would kindness toward yourself look like today?",
  "Finish this sentence: I feel most like me when…",
  "A thought to let go:",
  "A place that makes you breathe easier:",
  "Something you’re proud of this week:",
];


// == main.js ==

let state = loadState();

// Wire nav
$$(".top-nav .nav-btn").forEach(btn=> btn.addEventListener("click", ()=>{
  routeTo(btn.dataset.route);
  renderRoute();
}));
$("#exportBtn").addEventListener("click", exportData);
$("#importBtn").addEventListener("click", ()=> $("#importFile").click());
$("#importFile").addEventListener("change", importData);

function exportData(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "soothebirb-data.json"; a.click();
  URL.revokeObjectURL(url);
}
function importData(ev){
  const file = ev.target.files[0]; if(!file) return;
  const rdr = new FileReader();
  rdr.onload = ()=>{
    try{ state = JSON.parse(rdr.result); saveState(state); renderRoute(); alert("Imported!"); }
    catch(e){ alert("Invalid file."); }
  };
  rdr.readAsText(file);
}

function applyTheme(){
  document.documentElement.classList.remove("theme-forest","theme-dusk","theme-sunrise","theme-ocean","theme-punk");
  document.documentElement.classList.add("theme-"+(state.user.theme||"forest"));
  document.body.style.fontFamily = state.user.font || "system-ui";
}
applyTheme();

window.addEventListener("hashchange", renderRoute);
renderRoute();

function renderRoute(){
  const name = (location.hash||"#home").replace("#","");
  setActiveNav(name);
  const view = $("#view");
  view.innerHTML = "";
  const tpl = $("#tpl-"+name);
  if(!tpl){ view.textContent = "Not found"; return; }
  view.appendChild(tpl.content.cloneNode(true));
  // Per-route init
  if(name==="home") renderHome();
  if(name==="checkin") initCheckin();
  if(name==="tasks") initTasks();
  if(name==="breathe") initBreathe();
  if(name==="journal") initJournal();
  if(name==="pet") initPet();
  if(name==="settings") initSettings();
  updateFooter();
}

function updateFooter(){
  $("#streakLabel").textContent = `Streak: ${state.streak.current} 🔥 | Best: ${state.streak.best}`;
}

function renderHome(){
  $("#welcomeName").textContent = state.user.name ? `, ${state.user.name}` : "";
  $("#homePet").innerHTML = `<div class="pet">${petSVG(state.pet.species, state.pet.level, state.pet.acc)}</div>`;
  // Today summary
  const dkey = dayKey();
  const todayMoods = state.log.moods.filter(m=> dayKey(m.ts)===dkey);
  const todayTasks = state.log.tasks.filter(t=> t.done && dayKey(t.ts)===dkey);
  const todayJ = state.log.journal.filter(j=> dayKey(j.ts)===dkey);
  const sum = el("div", {className:"list"});
  sum.appendChild(el("div",{className:""},[document.createTextNode(`Moods logged: ${todayMoods.length}`)]));
  sum.appendChild(el("div",{className:""},[document.createTextNode(`Quests done: ${todayTasks.length}`)]));
  sum.appendChild(el("div",{className:""},[document.createTextNode(`Journal entries: ${todayJ.length}`)]));
  $("#todaySummary").replaceChildren(sum);
}

function initCheckin(){
  let chosen = null;
  $$("#tpl-checkin .mood").forEach(b=>{
    const clone = $("#view .mood-row").children;
  });
  $$("#view .mood-row .mood").forEach(b=> b.addEventListener("click", ()=>{
    $$("#view .mood-row .mood").forEach(x=> x.classList.remove("active"));
    b.classList.add("active");
    chosen = b.dataset.mood;
  }));
  $("#saveCheckin").addEventListener("click", ()=>{
    if(!chosen){ alert("Pick a mood first"); return; }
    const tags = $("#checkinTags").value.trim();
    const notes = $("#checkinNotes").value.trim();
    const score = {awful:1,bad:2,ok:3,good:4,great:5}[chosen];
    state.log.moods.push({ ts: Date.now(), mood: chosen, tags, notes, score });
    touchStreak(state); addXP(state, 5);
    saveState(state);
    renderRoute(); // rerender to refresh lists
  });
  // list
  const list = $("#moodList");
  state.log.moods.slice(-10).reverse().forEach(m=>{
    list.appendChild(el("div",{className:"card"},[
      document.createTextNode(`${fmtDate(m.ts)} — ${m.mood.toUpperCase()} ${m.tags? "— "+m.tags:""}`)
    ]));
  });
  // spark
  const values = state.log.moods.slice(-20).map(m=> m.score);
  sparkline($("#moodSparkline"), values);
}

const DEFAULT_TASKS = [
  "2 minutes of stretching",
  "Drink a glass of water",
  "Look outside for 30 seconds",
  "Tidy one tiny thing",
  "Send a kind text to someone",
];
function initTasks(){
  const list = $("#taskList");
  // Ensure task list has today's defaults
  if(state.log.tasks.length===0){
    DEFAULT_TASKS.forEach(t=> state.log.tasks.push({id:crypto.randomUUID(), title:t, done:false, ts:0}));
    saveState(state);
  }
  function render(){
    list.replaceChildren();
    state.log.tasks.forEach(task=>{
      const row = el("div",{className:"row"});
      const cb = el("input",{type:"checkbox"});
      cb.checked = task.done;
      cb.addEventListener("change", ()=>{
        task.done = cb.checked; task.ts = cb.checked? Date.now():0;
        if(task.done){ touchStreak(state); addXP(state, 3); }
        saveState(state); render(); updateFooter();
      });
      const title = el("span",{textContent: task.title, style: task.done? "text-decoration:line-through; opacity:.7":""});
      const del = el("button",{className:"secondary", textContent:"Delete"});
      del.addEventListener("click", ()=>{
        state.log.tasks = state.log.tasks.filter(x=> x.id!==task.id);
        saveState(state); render();
      });
      row.append(cb, title, del);
      list.appendChild(row);
    });
  }
  render();
  $("#addTaskBtn").addEventListener("click", ()=>{
    const t = $("#newTaskTitle").value.trim(); if(!t) return;
    state.log.tasks.push({id:crypto.randomUUID(), title:t, done:false, ts:0});
    $("#newTaskTitle").value = ""; saveState(state); render();
  });
}

function initBreathe(){
  const circle = $("#breathCircle"), phase = $("#breathPhase");
  let stop = null;
  $("#startBreath").addEventListener("click", ()=>{
    if(stop) stop();
    stop = startBreathing(circle, phase, secs=>{
      state.log.breath.push({ ts: Date.now(), secs });
      touchStreak(state); addXP(state, 4);
      saveState(state); alert("Nice breathing session ✨");
      renderRoute();
    });
  });
  $("#stopBreath").addEventListener("click", ()=>{ if(stop){ stop(); stop=null; } });
}

function initJournal(){
  const sel = $("#journalPrompt");
  sel.replaceChildren(...PROMPTS.map(p=> el("option",{value:p, textContent:p})));
  $("#newPrompt").addEventListener("click", ()=>{
    const i = Math.floor(Math.random()*PROMPTS.length);
    sel.value = PROMPTS[i];
  });
  $("#saveJournal").addEventListener("click", ()=>{
    const prompt = sel.value; const text = $("#journalText").value.trim();
    if(!text) return;
    state.log.journal.push({ id: crypto.randomUUID(), ts: Date.now(), prompt, text });
    touchStreak(state); addXP(state, 6);
    saveState(state); renderRoute();
  });
  const list = $("#journalList");
  state.log.journal.slice().reverse().forEach(j=>{
    list.appendChild(el("div",{className:"card"},[
      el("div",{className:"row"},[
        el("strong",{textContent: fmtDate(j.ts)}),
        el("span",{textContent: " — "+j.prompt})
      ]),
      el("div",{textContent: j.text})
    ]));
  });
}

function initPet(){
  const stage = $("#petStage");
  stage.innerHTML = `<div class="pet">${petSVG(state.pet.species, state.pet.level, state.pet.acc)}</div>`;

  const stats = $("#petStats");
  const xp = state.pet.xp, lvl = state.pet.level, next = xpForLevel(lvl+1);
  stats.textContent = `Level ${lvl} — ${xp}/${next} XP`;

  $("#petName").value = state.pet.name;
  $("#petSpecies").value = state.pet.species;
  $("#savePet").addEventListener("click", ()=>{
    state.pet.name = $("#petName").value.trim() || "Pebble";
    state.pet.species = $("#petSpecies").value;
    saveState(state); initPet();
  });

  const accList = $("#accList");
  accList.replaceChildren();
  ALL_ACC.forEach(a=>{
    const btn = el("button",{className: state.pet.acc.includes(a.id)?"":"secondary", textContent:a.name});
    btn.addEventListener("click", ()=>{
      const i = state.pet.acc.indexOf(a.id);
      if(i>=0) state.pet.acc.splice(i,1); else state.pet.acc.push(a.id);
      saveState(state); initPet();
    });
    accList.appendChild(btn);
  });
}

function initSettings(){
  $("#userName").value = state.user.name || "";
  $("#themeSelect").value = state.user.theme || "forest";
  $("#fontSelect").value = state.user.font || "system-ui";

  $("#saveSettings").addEventListener("click", ()=>{
    state.user.name = $("#userName").value.trim();
    state.user.theme = $("#themeSelect").value;
    state.user.font = $("#fontSelect").value;
    applyTheme(); saveState(state); alert("Saved!");
  });

  $("#resetApp").addEventListener("click", ()=>{
    if(confirm("Reset all data?")){ resetState(); state = loadState(); applyTheme(); renderRoute(); }
  });

  // Preview swatches inherit CSS variables, no extra logic needed
}

// Initial streak touch on load for the day
touchStreak(state); saveState(state);



// mark init
window.__SOOTHEBIRB_OK__ = true;