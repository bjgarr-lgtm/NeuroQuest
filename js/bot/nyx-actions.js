// js/bot/nyx-actions.js — v2 surgical patch
// Purpose: make ALL actions non-throwing, add Shopping List + Budget Tracker,
// and provide a stable actions.run / runMany API for Nyx.
//
// Storage keys (compact to avoid quota):
//  - SBX_LISTS : { shopping: [{id, text, done}], ...future lists }
//  - SBX_BUDG  : { txns:[{id, t, amt, cat, note}], cats:{cat:budget}, totals:{cat:sum} }
(function(){
  const A = {};
  const KEY_LISTS = 'SBX_LISTS';
  const KEY_BUDG  = 'SBX_BUDG';

  function jget(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (d ?? {}); } catch { return (d ?? {}); } }
  function jset(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ console.warn('[NYX-ACTIONS] save fail', e); } }
  function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
  function num(x, def=0){ const n = Number(x); return Number.isFinite(n) ? n : def; }
  function str(x, def=''){ return (typeof x === 'string' && x.trim().length) ? x.trim() : def; }

  // ---------- LISTS ----------
  function ensureLists(){
    const L = jget(KEY_LISTS, {});
    if (!Array.isArray(L.shopping)) L.shopping = [];
    return L;
  }

  A.add_shopping_item = async (p={})=>{
    const text = str(p.item || p.text || p.name, '');
    if (!text) return { ok:false, error:'missing item text' };
    const L = ensureLists();
    const it = { id: uid(), text, done: !!p.done };
    L.shopping.push(it);
    jset(KEY_LISTS, L);
    return { ok:true, item: it, lists: L };
  };

  A.remove_shopping_item = async (p={})=>{
    const id = str(p.id, '');
    if (!id) return { ok:false, error:'missing id' };
    const L = ensureLists();
    const before = L.shopping.length;
    L.shopping = L.shopping.filter(x=>x.id !== id);
    const removed = before - L.shopping.length;
    jset(KEY_LISTS, L);
    return { ok:true, removed, lists: L };
  };

  A.toggle_shopping_item = async (p={})=>{
    const id = str(p.id, '');
    if (!id) return { ok:false, error:'missing id' };
    const L = ensureLists();
    const it = L.shopping.find(x=>x.id===id);
    if (!it) return { ok:false, error:'not found' };
    it.done = p.done != null ? !!p.done : !it.done;
    jset(KEY_LISTS, L);
    return { ok:true, item: it, lists: L };
  };

  A.clear_checked_shopping = async ()=>{
    const L = ensureLists();
    L.shopping = L.shopping.filter(x=>!x.done);
    jset(KEY_LISTS, L);
    return { ok:true, lists: L };
  };

  // ---------- BUDGET ----------
  function ensureBudget(){
    const B = jget(KEY_BUDG, {});
    if (!Array.isArray(B.txns)) B.txns = [];
    if (!B.cats) B.cats = {};      // { "groceries": 300, "gas": 150 }
    if (!B.totals) B.totals = {};  // computed spend per cat
    return B;
  }
  function recomputeTotals(B){
    const totals = {};
    for (const t of B.txns){ const c = t.cat || 'uncategorized'; totals[c] = (totals[c]||0) + num(t.amt); }
    B.totals = totals;
  }

  A.add_budget_txn = async (p={})=>{
    const amt = num(p.amount ?? p.amt, NaN);
    if (!Number.isFinite(amt)) return { ok:false, error:'missing amount' };
    const cat = str(p.category ?? p.cat, 'uncategorized').toLowerCase();
    const note = str(p.note ?? p.memo ?? p.desc, '');
    const t = { id: uid(), t: Date.now(), amt, cat, note };
    const B = ensureBudget();
    B.txns.push(t);
    recomputeTotals(B);
    jset(KEY_BUDG, B);
    return { ok:true, txn: t, budget: B };
  };

  A.remove_budget_txn = async (p={})=>{
    const id = str(p.id, '');
    if (!id) return { ok:false, error:'missing id' };
    const B = ensureBudget();
    const before = B.txns.length;
    B.txns = B.txns.filter(x=>x.id !== id);
    recomputeTotals(B);
    jset(KEY_BUDG, B);
    return { ok:true, removed: before - B.txns.length, budget:B };
  };

  A.set_budget_category = async (p={})=>{
    const cat = str(p.category ?? p.cat, '');
    const lim = num(p.limit ?? p.budget, NaN);
    if (!cat) return { ok:false, error:'missing category' };
    if (!Number.isFinite(lim)) return { ok:false, error:'missing limit' };
    const B = ensureBudget();
    B.cats[cat.toLowerCase()] = lim;
    recomputeTotals(B);
    jset(KEY_BUDG, B);
    return { ok:true, budget:B };
  };

  A.get_state = async ()=>{
    return {
      ok:true,
      lists: ensureLists(),
      budget: (recomputeTotals(ensureBudget()), jget(KEY_BUDG))
    };
  };

  // ---------- QUEST (compat shim) ----------
  // If Nyx already wired quest actions elsewhere, we NOOP gracefully.
  A.add_quest = async (p={})=>({ ok:true, note:'handled elsewhere or ignored' });
  A.complete_quest = async (p={})=>({ ok:true, note:'handled elsewhere or ignored' });

  // ---------- Runner API ----------
  const API = {
    async run({type, params}={}){
      try{
        const k = String(type||'').toLowerCase();
        const fn = A[k];
        if (typeof fn !== 'function') return { ok:false, error:`unknown action: ${k}` };
        const out = await fn(params||{});
        if (!out || out.ok === false) return out || { ok:false, error:'unknown failure' };
        return out;
      }catch(e){
        console.error('[NYX ACTION ERROR]', e);
        return { ok:false, error: String(e && e.message || e) };
      }
    },
    async runMany(arr){
      const results = [];
      for (const step of (Array.isArray(arr)?arr:[arr])){
        results.push(await API.run(step));
      }
      return { ok:true, results };
    }
  };

  // expose
  window.NYX = window.NYX || {};
  window.NYX.actions = API;
  window.NYX.runAction = API.run;   // convenience
  window.NYX.runActions = API.runMany;

  console.log('[NYX-ACTIONS] v2 patch active');
})();