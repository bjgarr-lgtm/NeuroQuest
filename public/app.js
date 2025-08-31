
// NeuroQuest Mockup Skin
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const K='neuroquest_v2';
let S = load() || seed();

function seed(){
  const today = new Date().toISOString().slice(0,10);
  return {
    date: today,
    xp: 0, coins: 0, level: 1,
    character: null, companion: null,
    quests: { main:[], side:[], bonus:[] },
    cleaning: { small:['Dishes','Trash','Quick tidy'], weekly:['Bathroom'], monthly:['Closet'] },
    coop: ['Draw with kid','Nature walk','Story pile'],
    budget: { pouch: 0, tx: [] },
    logs: {}, // date -> { done:[...] , minutes: N , stuck: N , tx:[...] }
    trends: { streak:0, last:null }
  };
}

function save(){ localStorage.setItem(K, JSON.stringify(S)); }
function load(){ try { return JSON.parse(localStorage.getItem(K)); } catch(e){ return null; } }

function show(id){ $$('.screen').forEach(s=>s.classList.add('hidden')); $(id).classList.remove('hidden'); }
function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1000); }
function updateHUD(){
  $('#coinHUD').textContent = S.coins;
  const need = S.level*100;
  const pct = Math.min(99, Math.floor((S.xp%need)/need*100));
  $('#xpFill').style.width = pct + '%';
}

function addXP(n){ S.xp += n; const need=S.level*100; if (S.xp>=need){ S.xp-=need; S.level++; toast('Level up!'); } save(); updateHUD(); }
function addCoins(n){ S.coins += n; save(); updateHUD(); }

// Build character/companion galleries
function cardFor(src, label){
  const c = document.createElement('div'); c.className='card select';
  c.innerHTML = `<img src='${src}' onerror="this.style.display='none'" style="width:100%;border-radius:10px;border:2px solid var(--edge)"><div style="padding-top:6px;text-align:center">${label}</div>`;
  return c;
}

function renderCharacter(){
  const g = $('#charGallery'); g.innerHTML='';
  const options = [
    ['/assets/img/hero-bambi.png','Bambi'],
    ['/assets/img/hero-ash.png','Ash'],
    ['/assets/img/hero-odin.png','Odin'],
    ['/assets/img/hero-fox.png','Fox'],
  ];
  options.forEach(([src,name])=>{
    const c=cardFor(src,name);
    c.addEventListener('click', ()=>{
      $$('#charGallery .select').forEach(x=>x.classList.remove('selected'));
      c.classList.add('selected'); S.character=name; save();
    });
    g.appendChild(c);
  });
}
function renderCompanion(){
  const g = $('#compGallery'); g.innerHTML='';
  const options = [
    ['/assets/img/hero-fox.png','Fox'],
    ['/assets/img/hero-odin.png','Doggo'],
    ['/assets/img/hero-bambi.png','Bear'],
  ];
  options.forEach(([src,name])=>{
    const c=cardFor(src,name);
    c.addEventListener('click', ()=>{
      $$('#compGallery .select').forEach(x=>x.classList.remove('selected'));
      c.classList.add('selected'); S.companion=name; save();
    });
    g.appendChild(c);
  });
}

function addTask(where, txt=''){
  const list = S.quests[where];
  list.push({ txt, done:false, ts:Date.now() });
  save(); renderStart();
}

function taskRow(t, where, idx){
  const row = document.createElement('div'); row.className='task';
  row.innerHTML = `<input class='chk' type='checkbox' ${t.done?'checked':''}>
    <input type='text' value="${t.txt.replace(/"/g,'&quot;')}" placeholder='task'>
    <button class='btn sm'>×</button>`;
  const [chk, txt, del] = row.children;
  chk.addEventListener('change', ()=>{ t.done = chk.checked; if(t.done){ addXP(10); addCoins(5); logDone(t.txt, where); } save(); });
  txt.addEventListener('input', ()=>{ t.txt = txt.value; save(); });
  del.addEventListener('click', ()=>{ S.quests[where].splice(idx,1); save(); renderStart(); });
  return row;
}

function renderStart(){
  // lists
  const mount = (id, arr, where)=>{ const el=$(id); el.innerHTML=''; arr.forEach((t,i)=>el.appendChild(taskRow(t,where,i))); }
  mount('#mainList', S.quests.main, 'main');
  mount('#sideList', S.quests.side, 'side');
  mount('#bonusList', S.quests.bonus, 'bonus');
  // cleaning
  const cs = $('#cleaningSmall'); cs.innerHTML=''; S.cleaning.small.forEach((name,i)=>{
    const t = { txt:name, done:false }; cs.appendChild(taskRow(t,'cleaning_small',i));
  });
  const wb = $('#weeklyBoss'); wb.innerHTML=''; S.cleaning.weekly.forEach((name,i)=>{
    const t = { txt:name, done:false }; wb.appendChild(taskRow(t,'cleaning_weekly',i));
  });
  const mr = $('#monthlyRaid'); mr.innerHTML=''; S.cleaning.monthly.forEach((name,i)=>{
    const t = { txt:name, done:false }; mr.appendChild(taskRow(t,'cleaning_monthly',i));
  });
  // coop
  const cl = $('#coopList'); cl.innerHTML=''; S.coop.forEach((name,i)=>{
    const t = { txt:name, done:false }; cl.appendChild(taskRow(t,'coop',i));
  });
  // budget
  $('#goldPouch').textContent = '$'+S.budget.pouch.toFixed(0);
  let week=0; const now = Date.now(), weekAgo = now - 7*864e5;
  S.budget.tx.forEach(tx=>{ if(tx.time>weekAgo) week += tx.amt; });
  $('#thisWeek').textContent = (week>=0? '$'+week.toFixed(0) : '-$'+Math.abs(week).toFixed(0));
  const txL = $('#txList'); txL.innerHTML='';
  S.budget.tx.slice(-5).reverse().forEach(tx=>{
    const row = document.createElement('div'); row.className='row';
    row.innerHTML = `<div>${tx.name}</div><div class="amt ${tx.amt>=0?'plus':'minus'}">${tx.amt>=0?'+':''}$${Math.abs(tx.amt)}</div>`;
    txL.appendChild(row);
  });
}

function logDone(txt, where){
  const d = new Date().toISOString().slice(0,10);
  if (!S.logs[d]) S.logs[d] = { done:[], minutes:0, stuck:0, tx:[] };
  S.logs[d].done.push({ txt, where, t: Date.now() });
}

function addTx(name, amt){
  S.budget.tx.push({ name, amt, time: Date.now() });
  S.budget.pouch += amt;
  save(); renderStart();
}

function renderActivities(){
  // active tasks = undone
  const items = [...S.quests.main, ...S.quests.side, ...S.quests.bonus].filter(t=>!t.done);
  const el = $('#activeTasks'); el.innerHTML='';
  items.forEach((t,i)=>{
    const row = document.createElement('div'); row.className='task';
    row.innerHTML = `<input class='chk' type='checkbox'><div>${t.txt||'unnamed task'}</div>`;
    el.appendChild(row);
  });
}

let timerInt = 0, timerLeft = 600;
function setTimer(sec){ timerLeft = sec; drawTimer(); }
function drawTimer(){
  const m = Math.floor(timerLeft/60).toString().padStart(2,'0');
  const s = (timerLeft%60).toString().padStart(2,'0');
  $('#timer').textContent = `${m}:${s}`;
}
function startTimer(){
  if (timerInt) return;
  timerInt = setInterval(()=>{
    timerLeft--; drawTimer();
    if (timerLeft<=0){ clearInterval(timerInt); timerInt=0; addXP(20); toast('Timer complete! +20 XP'); }
  }, 1000);
}
function stopTimer(){ if (timerInt){ clearInterval(timerInt); timerInt=0; } }

function finishSelected(){
  $$('#activeTasks .task .chk').forEach(chk=>{
    if (chk.checked){ addXP(10); addCoins(5); }
  });
  toast('Nice work!');
}

function stuck(){ 
  const d = new Date().toISOString().slice(0,10);
  if (!S.logs[d]) S.logs[d] = { done:[], minutes:0, stuck:0, tx:[] };
  S.logs[d].stuck += 1; save(); toast('logged — we’ll adapt'); 
}

function endDay(){
  const d = new Date().toISOString().slice(0,10);
  if (!S.logs[d]) S.logs[d] = { done:[], minutes:0, stuck:0, tx:[] };
  S.logs[d].minutes += Math.round((600 - timerLeft)/60);
  save();
  renderSummary(d); renderTips(); show('#screen-end');
}

function renderSummary(d){
  const L=S.logs[d]; const total = (L?.done||[]).length;
  const cats={}; (L?.done||[]).forEach(x=>cats[x.where]=(cats[x.where]||0)+1);
  $('#summary').innerHTML = `
    <div class="tx">
      <div class="row"><div>Tasks done</div><div class="amt plus">${total}</div></div>
      <div class="row"><div>Focus minutes</div><div class="amt plus">${L?.minutes||0}</div></div>
      <div class="row"><div>Got stuck</div><div class="amt minus">${L?.stuck||0}</div></div>
    </div>
    <p class="hint">Breakdown: ${Object.entries(cats).map(([k,v])=>`${k}:${v}`).join(', ')||'—'}</p>
  `;
}

function computeTrends(days=14){
  const now = Date.now(), horizon = now - days*864e5;
  let done=0, minutes=0, stuck=0, byHour=[0,0,0], cats={};
  Object.entries(S.logs).forEach(([d,val])=>{
    if (new Date(d).getTime()>=horizon){
      done += (val.done||[]).length; minutes += val.minutes||0; stuck += val.stuck||0;
      (val.done||[]).forEach(x=>{
        const hr = new Date(x.t).getHours(); 
        if (hr<12) byHour[0]++; else if (hr<18) byHour[1]++; else byHour[2]++;
        cats[x.where]=(cats[x.where]||0)+1;
      });
    }
  });
  const bestTime = byHour.indexOf(Math.max(...byHour));
  const timeName = ['morning','afternoon','evening'][bestTime];
  const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0]||'main';
  const rate = done / Math.max(1, (Object.keys(S.logs).length||1));
  return {done, minutes, stuck, timeName, topCat, rate: Math.round(rate*100)};
}

function renderTips(){
  const t=computeTrends();
  const tips=[
    `You crush it in the <b>${t.timeName}</b>. Schedule Main Quests there.`,
    `Most wins come from <b>${t.topCat}</b>. Double-down tomorrow.`,
    t.stuck>0?`You reported being stuck <b>${t.stuck}</b> times — try a 5‑min starter or shrink a task.`:'Great flow — zero “stuck” logs.',
    `Completion cadence ~ <b>${t.rate}%</b> per day. Aim for steady, not perfect.`
  ];
  $('#tips').innerHTML = `<ul>${tips.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}

function renderTrendsModal(){
  const t=computeTrends(30);
  $('#trendsDetail').innerHTML = `
    <div class="tx">
      <div class="row"><div>Tasks (30d)</div><div class="amt plus">${t.done}</div></div>
      <div class="row"><div>Focus minutes</div><div class="amt plus">${t.minutes}</div></div>
      <div class="row"><div>Stuck events</div><div class="amt minus">${t.stuck}</div></div>
    </div>
    <p class="hint">Best time: <b>${t.timeName}</b> • Top category: <b>${t.topCat}</b> • Daily completion: <b>${t.rate}%</b></p>
  `;
}

// Event wiring
$('#goCharacter').addEventListener('click', ()=>{ renderCharacter(); show('#screen-character'); });
$('#backSplash').addEventListener('click', ()=> show('#screen-splash'));
$('#toCompanion').addEventListener('click', ()=>{ renderCompanion(); show('#screen-companion'); });
$('#backCharacter').addEventListener('click', ()=> show('#screen-character'));
$('#toStartDay').addEventListener('click', ()=>{ renderStart(); show('#screen-start'); });
$$('[data-add]').forEach(btn=>btn.addEventListener('click', ()=> addTask(btn.dataset.add, 'New task')));

$('#addIncome').addEventListener('click', ()=>{ const name=prompt('Income name?','Salary'); const amt=Number(prompt('Amount?','150')); if(!isNaN(amt)) addTx(name, Math.abs(amt)); });
$('#addExpense').addEventListener('click', ()=>{ const name=prompt('Expense?','Groceries'); const amt=Number(prompt('Amount?','50')); if(!isNaN(amt)) addTx(name, -Math.abs(amt)); });

$('#beginActivities').addEventListener('click', ()=>{ renderActivities(); setTimer(600); drawTimer(); show('#screen-activities'); });
$$('[data-timer]').forEach(b=>b.addEventListener('click', ()=> setTimer(Number(b.dataset.timer)) ));
$('#timerStart').addEventListener('click', startTimer);
$('#timerStop').addEventListener('click', stopTimer);
$('#finishSelected').addEventListener('click', finishSelected);
$('#markStuck').addEventListener('click', stuck);
$('#endDay').addEventListener('click', endDay);
$('#toNewDay').addEventListener('click', ()=>{ S.date = new Date().toISOString().slice(0,10); save(); show('#screen-start'); });
$('#openTrends').addEventListener('click', ()=>{ renderTrendsModal(); show('#screen-trends'); });
$('#closeTrends').addEventListener('click', ()=> show('#screen-start'));

// Boot
updateHUD(); show('#screen-splash');
