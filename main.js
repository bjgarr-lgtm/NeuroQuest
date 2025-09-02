import { loadState, saveState, resetState, dayKey, touchStreak, addXP, xpForLevel } from "./store.js";
import { $, $$, routeTo, setActiveNav, el, fmtDate, sparkline } from "./ui.js";
import { petSVG, ALL_ACC } from "./pet.js";
import { startBreathing, PROMPTS } from "./activities.js";

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

let journalEditId = null;
function initJournal(){
  const sel=$("#journalPrompt"), txt=$("#journalText"), saveBtn=$("#saveJournal");
  sel.replaceChildren(...PROMPTS.map(p=> el("option",{value:p, textContent:p})));
  $("#newPrompt").addEventListener("click",()=>{ const i=Math.floor(Math.random()*PROMPTS.length); sel.value=PROMPTS[i]; });
  saveBtn.textContent=journalEditId?"Update":"Save";
  saveBtn.addEventListener("click",()=>{
    const prompt=sel.value; const text=txt.value.trim(); if(!text) return;
    if(journalEditId){ const e=state.log.journal.find(x=>x.id===journalEditId); if(e){ e.prompt=prompt; e.text=text; } journalEditId=null; }
    else { state.log.journal.push({ id:crypto.randomUUID(), ts:Date.now(), prompt, text }); touchStreak(state); addXP(state,6); }
    saveState(state); renderRoute();
  });
  const list=$("#journalList"); list.replaceChildren();
  state.log.journal.slice().reverse().forEach(j=>{
    const row=el("div",{className:"card"},[
      el("div",{className:"row"},[
        el("strong",{textContent:fmtDate(j.ts)}),
        el("span",{textContent:" — "+j.prompt})
      ])
    ]);
    const btn=el("button",{className:"secondary", textContent:"Open"});
    btn.addEventListener("click",()=>{ journalEditId=j.id; sel.value=j.prompt; txt.value=j.text; saveBtn.textContent="Update"; });
    row.appendChild(btn); list.appendChild(row);
  });
  $("#journalStorage").textContent="Entries are stored locally in your browser.";
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
