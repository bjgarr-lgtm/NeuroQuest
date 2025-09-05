/* SootheBirb Core Hotfix Pack v2
   - Budget: explicit Goal with editor + spend vs goal bar
   - Check-In: robust mood selection
   - Breathe: smooth animated 4-4-4-4 loop (requestAnimationFrame)
   - Settings: persist & apply immediately
   - Journal/Shop/Budget/Rewards same as v1
*/
(function () {
  const QS  = (s, el=document) => el.querySelector(s);
  const QSA = (s, el=document) => Array.from(el.querySelectorAll(s));
  const nowISO = () => new Date().toISOString();

  const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ---------- SETTINGS ----------
  function applySettings(st) {
    const html = document.documentElement;
    const body = document.body;
    // theme classes
    const themes = ['retro','forest','dusk','sunrise','ocean','punk'];
    themes.forEach(t => { body.classList.remove('theme-'+t); html.classList.remove('theme-'+t); });
    const theme = st.theme || 'retro';
    body.classList.add('theme-'+theme); html.classList.add('theme-'+theme);

    // font/art toggles
    body.dataset.font = st.font || 'press2p';
    body.dataset.art = st.art || 'pixel';

    // scanlines
    if (st.scanlines !== false) body.classList.add('crt'); else body.classList.remove('crt');

    // toddler helper
    if (st.toddlerToggle) body.classList.add('toddler-on'); else body.classList.remove('toddler-on');
  }

  function wireSettings() {
    const saveBtn = QS('#saveSettings');
    const resetBtn= QS('#resetApp');
    const inputs = {
      '#themeSelect':'theme',
      '#fontSelect':'font',
      '#artSelect':'art',
      '#scanlinesToggle':'scanlines',
      '#toddlerToggle':'toddlerToggle',
      '#userName':'userName',
    };
    if (!saveBtn && !resetBtn) return;

    const st = load('sb.settings', {theme:'retro', font:'press2p', art:'pixel', scanlines:true, toddlerToggle:false, userName:''});
    Object.entries(inputs).forEach(([sel,key])=>{
      const el = QS(sel); if (!el) return;
      if (el.type === 'checkbox') el.checked = !!st[key];
      else if (typeof st[key] !== 'undefined') el.value = st[key];
    });
    applySettings(st);

    if (saveBtn) saveBtn.onclick = () => {
      const s2 = {...st};
      Object.entries(inputs).forEach(([sel,key]) => {
        const el = QS(sel); if (!el) return;
        if (el.type === 'checkbox') s2[key] = !!el.checked;
        else s2[key] = el.value;
      });
      save('sb.settings', s2);
      applySettings(s2);
      // notify other hotfixes to re-evaluate (e.g., toddler pet visibility)
      window.dispatchEvent(new Event('hashchange'));
      try { saveBtn.classList.add('pulse'); setTimeout(()=>saveBtn.classList.remove('pulse'), 600);} catch(e){}
    };

    if (resetBtn) resetBtn.onclick = () => {
      if (!confirm('Reset all local data?')) return;
      Object.keys(localStorage).filter(k=>k.startsWith('sb.')).forEach(k=>localStorage.removeItem(k));
      location.reload();
    };
  }

  // ---------- SHOPPING ----------
  function renderShop() {
    const listEl = QS('#shopList');
    const inp = QS('#shopItem');
    const addBtn = QS('#addShop');
    if (!listEl || !addBtn || !inp) return;

    const items = load('sb.shop', []);
    function paint(){
      listEl.innerHTML = '';
      items.forEach((txt, i)=>{
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `<span>${txt}</span><span style="flex:1"></span><button class="danger" data-del="${i}">✕</button>`;
        listEl.appendChild(row);
      });
    }
    paint();
    addBtn.onclick = () => {
      const v = (inp.value||'').trim(); if (!v) return;
      items.push(v); save('sb.shop', items); inp.value=''; paint();
    };
    listEl.onclick = (ev)=>{
      const b = ev.target.closest('[data-del]'); if (!b) return;
      const i = +b.getAttribute('data-del'); items.splice(i,1); save('sb.shop', items); paint();
    };
  }

  // ---------- BUDGET (Goal) ----------
  function renderBudget() {
    const pouch = QS('#goldPouch');
    const spend = QS('#thisSpend');
    const bar   = QS('#budgetBar');
    const incLabel = QS('#incLabel'), incAmt = QS('#incAmt'), incBtn = QS('#addIncome');
    const expLabel = QS('#expLabel')||QS('#expLabel'), expAmt = QS('#expAmt'), expBtn = QS('#addExpense');
    const list = QS('#txnList');
    if (!pouch || !spend || !bar || !incBtn || !expBtn || !incLabel || !incAmt || !expAmt || !list) return;

    const tx = load('sb.tx', []); // {t,label,amt,ts}
    const budget = load('sb.budget', {goal: 200}); // default goal $200
    // ensure a tiny goal so division doesn't NaN
    const goal = Math.max(1, Number(budget.goal)||200);

    // inject Goal text + edit
    const goalCard = bar.closest('.goal') || bar.parentElement;
    if (goalCard && !QS('#budgetGoalText', goalCard)) {
      const info = document.createElement('div');
      info.id = 'budgetGoalText';
      info.className = 'muted';
      info.style.marginTop = '6px';
      info.textContent = `Goal: $${goal}`;
      goalCard.appendChild(info);

      // click to edit
      info.style.cursor = 'pointer';
      info.title = 'Click to change goal';
      info.addEventListener('click', ()=>{
        const v = prompt('Set weekly budget goal (USD):', String(Math.max(0, load('sb.budget', {goal}).goal)));
        if (v!==null) {
          const b = load('sb.budget', {goal});
          b.goal = Math.max(0, Number(v)||0);
          save('sb.budget', b);
          renderBudget();
        }
      });
    } else if (goalCard) {
      const info = QS('#budgetGoalText', goalCard);
      if (info) info.textContent = `Goal: $${goal}`;
    }

    function totals(){
      let income=0, expense=0;
      tx.forEach(x=>{ if (x.t==='inc') income+=x.amt; else expense+=x.amt; });
      return {income, expense};
    }
    function paint(){
      const {income, expense} = totals();
      if (pouch) pouch.textContent = '$'+income.toFixed(0);
      if (spend) spend.textContent = '$'+expense.toFixed(0);
      const pct = Math.min(100, (expense/goal)*100);
      bar.style.width = pct + '%';
      list.innerHTML='';
      tx.slice().reverse().forEach(entry=>{
        const row = document.createElement('div');
        row.className='row';
        row.innerHTML = `<span>${entry.label}</span><span style="flex:1"></span><span class="${entry.t==='exp'?'danger':'k'}">${entry.t==='exp'?'-':'+'}$${entry.amt}</span>`;
        list.appendChild(row);
      });
    }
    paint();

    incBtn.onclick = ()=>{
      const label=(incLabel.value||'').trim(); const amt = Number(incAmt.value||0);
      if (!label||!amt) return;
      tx.push({t:'inc', label, amt, ts: nowISO()});
      save('sb.tx', tx); incLabel.value=''; incAmt.value=''; renderBudget();
    };
    expBtn.onclick = ()=>{
      const label=(expLabel&&expLabel.value||'').trim(); const amt = Number(expAmt.value||0);
      if (!label||!amt) return;
      tx.push({t:'exp', label, amt, ts: nowISO()});
      save('sb.tx', tx); if (expLabel) expLabel.value=''; expAmt.value=''; renderBudget();
    };
  }

  // ---------- BREATHE (smooth) ----------
  function wireBreathe() {
    const circle = QS('#breathCircle');
    const phaseEl= QS('#breathPhase');
    if (!circle || !phaseEl) return;

    let running = false, rafId = null;
    const DUR = 4000; // ms per phase
    const phases = [
      ['Inhale', 'inhale'],
      ['Hold', 'hold1'],
      ['Exhale', 'exhale'],
      ['Hold', 'hold2']
    ];
    let idx=0, t0=0;

    function frame(ts){
      if (!t0) t0 = ts;
      const elapsed = ts - t0;
      const ratio = Math.min(1, elapsed/DUR);
      const [label, cls] = phases[idx];
      phaseEl.textContent = label;
      circle.dataset.phase = cls;

      // animate scale smoothly across phases
      let scale = 1;
      if (cls==='inhale') scale = 1 + 0.25*ratio;
      else if (cls==='hold1' || cls==='hold2') scale = 1.25;
      else if (cls==='exhale') scale = 1.25 - 0.35*ratio;

      circle.style.transform = `scale(${scale})`;
      circle.style.boxShadow = `0 0 ${8 + 16*ratio}px rgba(255,255,255,0.25)`;

      if (elapsed >= DUR) { // advance
        idx = (idx+1) % phases.length;
        t0 = ts;
      }
      if (running) rafId = requestAnimationFrame(frame);
    }

    function start(){
      if (running) return;
      running = true; idx=0; t0=0;
      circle.classList.add('active');
      rafId = requestAnimationFrame(frame);
    }
    function stop(){
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null; t0=0;
      circle.classList.remove('active'); phaseEl.textContent='Ready'; circle.style.transform='scale(1)'; circle.style.boxShadow='none'; delete circle.dataset.phase;
    }

    circle.onclick = ()=> running ? stop() : start();
  }

  // ---------- JOURNAL ----------
  const DEFAULT_PROMPTS = [
    'What made you smile today?',
    'One small win you had:',
    'Something you’re grateful for:',
    'A task you’ll do tomorrow:',
    'How did you take care of yourself today?',
  ];

  function wireJournal() {
    const sel = QS('#journalPrompt');
    const txt = QS('#journalText');
    const saveBtn = QS('#saveJournal');
    const newBtn  = QS('#newPrompt');
    const list    = QS('#journalList');
    const info    = QS('#journalStorage');
    if (!sel || !txt || !saveBtn || !newBtn || !list) return;

    const prompts = load('sb.prompts', DEFAULT_PROMPTS);
    sel.innerHTML = prompts.map(p=>`<option>${p}</option>`).join('');

    function renderList() {
      const entries = load('sb.journal', []);
      list.innerHTML='';
      entries.slice().reverse().forEach(en=>{
        const d = new Date(en.ts).toLocaleString();
        const el = document.createElement('div');
        el.className = 'cardish';
        el.innerHTML = `<div class="k">${d}</div><div class="v"><strong>${en.prompt}</strong><br/>${(en.text||'').replace(/</g,'&lt;')}</div>`;
        list.appendChild(el);
      });
      if (info) {
        const size = (localStorage.getItem('sb.journal')||'').length;
        info.textContent = `Storage used: ${size} bytes`;
      }
    }
    renderList();

    newBtn.onclick = ()=>{ sel.selectedIndex = (sel.selectedIndex+1)%sel.options.length; };
    saveBtn.onclick = ()=>{
      const entries = load('sb.journal', []);
      entries.push({prompt: sel.value, text: txt.value, ts: nowISO()});
      save('sb.journal', entries);
      txt.value='';
      renderList();
    };
  }

  // ---------- CHECK-IN ----------
  function wireCheckin() {
    const moodRow = QS('.mood-row');
    const tags = QS('#checkinTags');
    const notes= QS('#checkinNotes');
    const btn  = QS('#saveCheckin');
    const list = QS('#moodList');
    if (!moodRow || !btn || !list) return;

    // support either .mood elements or plain spans
    const map = {'😖':'awful','☹️':'bad','😐':'ok','🙂':'good','🤩':'great'};
    let chosen = null;
    moodRow.style.cursor = 'pointer';

    moodRow.onclick = (ev)=>{
      let el = ev.target.closest('.mood'); 
      if (!el && ev.target.tagName === 'SPAN') el = ev.target;
      if (!el) return;
      const dm = el.getAttribute('data-mood') || map[el.textContent.trim()] || null;
      if (!dm) return;
      QSA('.mood', moodRow).forEach(x=>x.classList && x.classList.remove('selected'));
      if (el.classList) el.classList.add('selected');
      chosen = dm;
    };

    function paint() {
      const items = load('sb.moods', []);
      list.innerHTML = '';
      items.slice().reverse().forEach(m=>{
        const d = new Date(m.ts).toLocaleString();
        const row = document.createElement('div');
        row.className='row';
        row.innerHTML = `<span>${d}</span><span style="flex:1"></span><span>${m.mood}</span>`;
        list.appendChild(row);
      });
    }
    paint();

    btn.onclick = ()=>{
      if (!chosen) { alert('Pick a mood face first.'); return; }
      const items = load('sb.moods', []);
      items.push({mood: chosen, tags: (tags.value||'').trim(), notes:(notes.value||'').trim(), ts: nowISO()});
      save('sb.moods', items);
      tags.value=''; notes.value=''; chosen=null; paint();
    };
  }

  // ---------- REWARDS ----------
  function renderRewards() {
    const grid = QS('#badgeGrid');
    if (!grid) return;
    const tx = load('sb.tx', []);
    const moods = load('sb.moods', []);
    const jrnl = load('sb.journal', []);
    const shop = load('sb.shop', []);
    const badges = [];
    if (tx.length >= 1) badges.push({id:'first-coin', name:'First Coins', desc:'Logged your first budget item.'});
    if (jrnl.length >= 1) badges.push({id:'first-journal', name:'Inkling', desc:'Saved a journal entry.'});
    if (moods.length >= 3) badges.push({id:'feels', name:'Feelings Tracker', desc:'Tracked 3 moods.'});
    if (shop.length >= 5) badges.push({id:'groceries', name:'List Master', desc:'5 things on your shopping list.'});
    grid.innerHTML = badges.length ? badges.map(b=>`
      <div class="cardish">
        <div class="k">${b.name}</div>
        <div class="v">${b.desc}</div>
      </div>`).join('')
      : `<div class="muted">No rewards yet. Keep playing!</div>`;
  }

  // ---------- ROUTE WATCH ----------
  function wireEverythingOnRoute() {
    wireSettings();
    renderShop();
    renderBudget();
    wireBreathe();
    wireJournal();
    wireCheckin();
    renderRewards();
  }

  window.addEventListener('hashchange', ()=> setTimeout(wireEverythingOnRoute, 0));
  document.addEventListener('DOMContentLoaded', ()=> setTimeout(wireEverythingOnRoute, 0));
  setInterval(wireEverythingOnRoute, 1000);
})();