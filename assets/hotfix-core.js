/* SootheBirb Core Hotfix Pack (UI fixes + persistence)
   - Shopping list: add/save/remove
   - Budget: income/expense tracking + bar
   - Breathe: simple 4-4-4-4 cycle
   - Journal: prompts, save, list
   - Check-In: mood select + history
   - Rewards: simple achievements
   - Settings: persistence + application
   Everything stored in localStorage under 'sb.*'
*/
(function () {
  const QS  = (s, el=document) => el.querySelector(s);
  const QSA = (s, el=document) => Array.from(el.querySelectorAll(s));
  const nowISO = () => new Date().toISOString();

  const load = (k, def) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
    catch { return def; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ---------- SETTINGS ----------
  function applySettings(st) {
    const body = document.body;
    // theme
    body.classList.remove('theme-retro', 'theme-forest', 'theme-dusk', 'theme-sunrise', 'theme-ocean', 'theme-punk');
    body.classList.add(`theme-${st.theme || 'retro'}`);
    // font
    body.dataset.font = st.font || 'press2p';
    // art
    body.dataset.art = st.art || 'pixel';
    // scanlines
    if (st.scanlines !== false) body.classList.add('crt'); else body.classList.remove('crt');
    // toddler banner helper
    if (st.toddlerToggle) body.classList.add('toddler-on'); else body.classList.remove('toddler-on');
  }

  function wireSettings() {
    const saveBtn = QS('#saveSettings');
    const resetBtn= QS('#resetApp');
    if (!saveBtn && !resetBtn) return;

    const st = load('sb.settings', {theme:'retro', font:'press2p', art:'pixel', scanlines:true, toddlerToggle:false});
    const m = {
      '#themeSelect':'theme',
      '#fontSelect':'font',
      '#artSelect':'art',
      '#scanlinesToggle':'scanlines',
      '#toddlerToggle':'toddlerToggle',
      '#userName':'userName',
    };
    Object.entries(m).forEach(([sel,key]) => {
      const el = QS(sel);
      if (el) {
        if (el.type === 'checkbox') el.checked = !!st[key];
        else if (typeof st[key] !== 'undefined') el.value = st[key];
      }
    });

    applySettings(st);

    if (saveBtn) saveBtn.onclick = () => {
      const st2 = {...st};
      Object.entries(m).forEach(([sel,key]) => {
        const el = QS(sel);
        if (!el) return;
        if (el.type === 'checkbox') st2[key] = !!el.checked;
        else st2[key] = el.value;
      });
      save('sb.settings', st2);
      applySettings(st2);
      // small toast
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
    listEl.innerHTML = '';
    items.forEach((txt, i)=>{
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span>${txt}</span><span style="flex:1"></span><button class="danger" data-del="${i}">✕</button>`;
      listEl.appendChild(row);
    });
    addBtn.onclick = () => {
      const v = (inp.value||'').trim();
      if (!v) return;
      items.push(v);
      save('sb.shop', items);
      inp.value='';
      renderShop();
    };
    listEl.onclick = (ev)=>{
      const btn = ev.target.closest('[data-del]');
      if (!btn) return;
      const idx = +btn.getAttribute('data-del');
      items.splice(idx,1);
      save('sb.shop', items);
      renderShop();
    };
  }

  // ---------- BUDGET ----------
  function renderBudget() {
    const pouch = QS('#goldPouch');
    const spend = QS('#thisSpend');
    const bar   = QS('#budgetBar');
    const incLabel = QS('#incLabel'), incAmt = QS('#incAmt'), incBtn = QS('#addIncome');
    const expLabel = QS('#expLabel')||QS('#expLabel'), expAmt = QS('#expAmt'), expBtn = QS('#addExpense');
    const list = QS('#txnList');
    if (!pouch || !spend || !bar || !incBtn || !expBtn || !incLabel || !incAmt || !expAmt || !list) return;

    const tx = load('sb.tx', []); // {t:'inc'|'exp', label, amt, ts}
    function paint(){
      let income = 0, expense = 0;
      tx.forEach(x=>{ if (x.t==='inc') income+=x.amt; else expense+=x.amt; });
      if (pouch) pouch.textContent = '$' + income.toFixed(0);
      if (spend) spend.textContent = '$' + expense.toFixed(0);
      if (bar)   bar.style.width = Math.min(100, (expense/(income||1))*100) + '%';
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
      save('sb.tx', tx); incLabel.value=''; incAmt.value=''; paint();
    };
    expBtn.onclick = ()=>{
      const label=(expLabel&&expLabel.value||'').trim(); const amt = Number(expAmt.value||0);
      if (!label||!amt) return;
      tx.push({t:'exp', label, amt, ts: nowISO()});
      save('sb.tx', tx); if (expLabel) expLabel.value=''; expAmt.value=''; paint();
    };
  }

  // ---------- BREATHE ----------
  function wireBreathe() {
    const circle = QS('#breathCircle');
    const phaseEl= QS('#breathPhase');
    if (!circle || !phaseEl) return;

    let running = false, timer=null;
    const phases = [
      ['Inhale', 'inhale'],
      ['Hold', 'hold'],
      ['Exhale', 'exhale'],
      ['Hold', 'hold']
    ];
    let idx=0, t=0, dur=4; // seconds per phase

    function tick(){
      const [label, cls]= phases[idx];
      phaseEl.textContent = label;
      circle.dataset.phase = cls;
      t++;
      if (t>=dur){ t=0; idx=(idx+1)%phases.length; }
    }

    function start(){
      if (running) return;
      running = true; idx=0; t=0;
      circle.classList.add('active');
      tick();
      timer = setInterval(tick, 1000);
    }
    function stop(){
      running = false;
      clearInterval(timer); timer=null;
      circle.classList.remove('active'); phaseEl.textContent='Ready'; delete circle.dataset.phase;
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
      const entries = load('sb.journal', []); // {prompt,text,ts}
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

    let chosen = null;
    moodRow.onclick = (ev)=>{
      const el = ev.target.closest('.mood');
      if (!el) return;
      QSA('.mood', moodRow).forEach(x=>x.classList.remove('selected'));
      el.classList.add('selected');
      chosen = el.getAttribute('data-mood');
    };

    function paint() {
      const items = load('sb.moods', []); // {mood,tags,notes,ts}
      list.innerHTML = '';
      items.slice().reverse().forEach(m=>{
        const d = new Date(m.ts).toLocaleString();
        const el = document.createElement('div');
        el.className='row';
        el.innerHTML = `<span>${d}</span><span style="flex:1"></span><span>${m.mood}</span>`;
        list.appendChild(el);
      });
    }
    paint();

    btn.onclick = ()=>{
      if (!chosen) { alert('Pick a mood face first.'); return; }
      const items = load('sb.moods', []);
      items.push({mood: chosen, tags: (tags.value||'').trim(), notes:(notes.value||'').trim(), ts: nowISO()});
      save('sb.moods', items);
      tags.value=''; notes.value=''; chosen=null; QSA('.mood', moodRow).forEach(x=>x.classList.remove('selected'));
      paint();
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
  // also attempt when #view content might be swapped without hash change
  // triggers occasionally
  setInterval(wireEverythingOnRoute, 1000);
})();