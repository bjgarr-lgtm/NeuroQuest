
// js/bot/nyx-actions.js — v2.3 "ultra-compatible"
// Goal: make *any* reasonable action name work, never throw, and not block your existing quest code.

/* Exports:
   - named: { Actions, run, runMany }
   - default: Actions
   - window.NYX.runAction / runActions (for older paths)
*/

const K_LISTS = 'SBX_LISTS';
const K_BUDG  = 'SBX_BUDG';
const K_QSTS  = 'SBX_QUESTS';

const log = (...a)=>console.log('[NYX-ACTIONS]', ...a);
const warn= (...a)=>console.warn('[NYX-ACTIONS]', ...a);

function jget(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (d ?? {}); } catch { return (d ?? {}); } }
function jset(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ warn('save fail', e); } }
function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
const num = (x, def=0)=> { const n = Number(x); return Number.isFinite(n) ? n : def; };
const str = (x, def='')=> (typeof x === 'string' && x.trim().length ? x.trim() : def);

function normalizeType(t){
  if (!t) return '';
  // unify: lower, remove non-alnum, but keep dot as scope separator
  const raw = String(t);
  const scoped = raw.toLowerCase().replace(/\s+/g,'');
  // map common variants:
  const map = {
    'additem': 'add_shopping_item',
    'addshoppingitem': 'add_shopping_item',
    'shopping.add': 'add_shopping_item',
    'shopping_add': 'add_shopping_item',
    'removeitem': 'remove_shopping_item',
    'removeshoppingitem': 'remove_shopping_item',
    'shopping.remove': 'remove_shopping_item',
    'toggleitem': 'toggle_shopping_item',
    'toggleshoppingitem': 'toggle_shopping_item',
    'clearchecked': 'clear_checked_shopping',
    'clearcheckedshopping': 'clear_checked_shopping',

    'addtxn': 'add_budget_txn',
    'addtransaction': 'add_budget_txn',
    'budget.add': 'add_budget_txn',
    'removetxn': 'remove_budget_txn',
    'removetransaction': 'remove_budget_txn',
    'budget.remove': 'remove_budget_txn',
    'setcategorybudget': 'set_budget_category',
    'setbudgetcategory': 'set_budget_category',

    'addquest': 'add_quest',
    'quest.add': 'add_quest',
    'completequest': 'complete_quest',
    'quest.complete': 'complete_quest',

    'getstate': 'get_state',
  };
  return map[scoped] || scoped;
}

async function tryDelegate(name, params){
  const snake = name;
  const camel = snake.replace(/_([a-z])/g, (_,c)=>c.toUpperCase());
  const cands = [
    window[snake], window[camel],
    window.App?.[snake], window.App?.[camel],
    window.App?.quests?.[snake], window.App?.quests?.[camel],
    window.NQ?.[snake], window.NQ?.[camel],
    window.NQ?.quests?.[snake], window.NQ?.quests?.[camel],
  ].filter(Boolean);

  for (const fn of cands){
    try {
      const out = fn.call(window.App || window, params);
      const val = out instanceof Promise ? await out : out;
      if (val !== undefined) return { ok:true, delegated:true, result: val };
    } catch(e){ warn('delegate error', e); }
  }
  // event bus
  try {
    const ev = `nyx:${snake}`;
    const res = await new Promise((resolve)=>{
      const done = (e)=>{ window.removeEventListener(`${ev}:result`, done, { once:true }); resolve(e.detail); };
      window.addEventListener(`${ev}:result`, done, { once:true });
      window.dispatchEvent(new CustomEvent(ev, { detail:{ params } }));
      setTimeout(()=>resolve(undefined), 40);
    });
    if (res !== undefined) return { ok:true, delegated:true, result: res };
  } catch(e){ /* ignore */ }
  return { ok:false, delegated:false };
}

// ---------- LISTS ----------
function ensureLists(){ const L = jget(K_LISTS, {}); if (!Array.isArray(L.shopping)) L.shopping = []; return L; }

async function add_shopping_item(p={}){
  const item = str(p.item ?? p.text ?? p.name ?? p.value, '');
  if (!item) return { ok:false, error:'missing item text' };
  const L = ensureLists();
  const it = { id: uid(), text: item, done: !!p.done };
  L.shopping.push(it); jset(K_LISTS, L);
  return { ok:true, item: it, lists: L };
}
async function remove_shopping_item(p={}){
  const id = str(p.id ?? p.itemId ?? p.key, '');
  if (!id) return { ok:false, error:'missing id' };
  const L = ensureLists(); const before = L.shopping.length;
  L.shopping = L.shopping.filter(x=>x.id !== id); jset(K_LISTS, L);
  return { ok:true, removed: before - L.shopping.length, lists:L };
}
async function toggle_shopping_item(p={}){
  const id = str(p.id ?? p.itemId ?? p.key, '');
  if (!id) return { ok:false, error:'missing id' };
  const L = ensureLists(); const it = L.shopping.find(x=>x.id===id);
  if (!it) return { ok:false, error:'not found' };
  it.done = p.done != null ? !!p.done : !it.done; jset(K_LISTS, L);
  return { ok:true, item: it, lists:L };
}
async function clear_checked_shopping(){
  const L = ensureLists(); L.shopping = L.shopping.filter(x=>!x.done); jset(K_LISTS, L);
  return { ok:true, lists:L };
}

// ---------- BUDGET ----------
function ensureBudget(){ const B = jget(K_BUDG, {}); if (!Array.isArray(B.txns)) B.txns = []; if(!B.cats) B.cats={}; if(!B.totals) B.totals={}; return B; }
function recomputeTotals(B){ const t={}; for (const x of B.txns){ const c=x.cat||'uncategorized'; t[c]=(t[c]||0)+num(x.amt); } B.totals=t; }

async function add_budget_txn(p={}){
  const amt = num(p.amount ?? p.amt ?? p.value, NaN);
  if (!Number.isFinite(amt)) return { ok:false, error:'missing amount' };
  const cat = str((p.category ?? p.cat ?? 'uncategorized'), 'uncategorized').toLowerCase();
  const note = str(p.note ?? p.memo ?? p.desc ?? p.text, '');
  const t = { id: uid(), t: Date.now(), amt, cat, note };
  const B = ensureBudget(); B.txns.push(t); recomputeTotals(B); jset(K_BUDG, B);
  return { ok:true, txn:t, budget:B };
}
async function remove_budget_txn(p={}){
  const id = str(p.id ?? p.txnId ?? p.key, '');
  if (!id) return { ok:false, error:'missing id' };
  const B = ensureBudget(); const before=B.txns.length; B.txns=B.txns.filter(x=>x.id!==id);
  recomputeTotals(B); jset(K_BUDG, B);
  return { ok:true, removed: before-B.txns.length, budget:B };
}
async function set_budget_category(p={}){
  const cat = str(p.category ?? p.cat, '');
  const lim = num(p.limit ?? p.budget ?? p.value, NaN);
  if (!cat) return { ok:false, error:'missing category' };
  if (!Number.isFinite(lim)) return { ok:false, error:'missing limit' };
  const B = ensureBudget(); B.cats[cat.toLowerCase()] = lim; recomputeTotals(B); jset(K_BUDG, B);
  return { ok:true, budget:B };
}

// ---------- QUESTS ----------
function ensureQuests(){ const Q = jget(K_QSTS, {}); if (!Array.isArray(Q.items)) Q.items = []; return Q; }

async function add_quest(p={}){
  // try host
  const del = await tryDelegate('add_quest', p);
  if (del.delegated) return del.result ?? { ok:true, delegated:true };
  // fallback
  const text = str(p.text ?? p.title ?? p.name ?? p.quest, '');
  if (!text) return { ok:false, error:'missing quest text' };
  const Q = ensureQuests(); const q={ id: uid(), text, done: !!p.done, created: Date.now() };
  Q.items.push(q); jset(K_QSTS, Q);
  return { ok:true, quest:q, quests:Q, delegated:false };
}
async function complete_quest(p={}){
  const del = await tryDelegate('complete_quest', p);
  if (del.delegated) return del.result ?? { ok:true, delegated:true };
  const id = str(p.id ?? p.questId ?? p.key, '');
  if (!id) return { ok:false, error:'missing id' };
  const Q = ensureQuests(); const it = Q.items.find(x=>x.id===id);
  if (!it) return { ok:false, error:'not found' };
  it.done = true; jset(K_QSTS, Q);
  return { ok:true, quest:it, quests:Q, delegated:false };
}

async function get_state(){
  const B = ensureBudget(); recomputeTotals(B);
  return { ok:true, lists: ensureLists(), budget:B, quests: ensureQuests() };
}

// ---------- Registry + aliasing ----------
const impl = {
  add_shopping_item, remove_shopping_item, toggle_shopping_item, clear_checked_shopping,
  add_budget_txn, remove_budget_txn, set_budget_category,
  add_quest, complete_quest, get_state
};

function resolve(type){
  const normalized = normalizeType(type);
  if (impl[normalized]) return impl[normalized];
  // allow direct canonical names too
  if (impl[type]) return impl[type];
  return null;
}

export async function run({type, params}={}){
  try{
    const fn = resolve(type);
    if (!fn) return { ok:false, error:`unknown action: ${type}` };
    const out = await fn(params||{});
    return out && out.ok !== false ? out : (out || { ok:false, error:'unknown failure' });
  }catch(e){
    warn('run error', e);
    return { ok:false, error:String(e && e.message || e) };
  }
}

export async function runMany(arr){
  const steps = Array.isArray(arr) ? arr : [arr];
  const results = [];
  for (const step of steps){
    results.push(await run(step));
  }
  return { ok:true, results };
}

// Build exported Actions object
export const Actions = {
  run, runMany,
  add_shopping_item, remove_shopping_item, toggle_shopping_item, clear_checked_shopping,
  add_budget_txn, remove_budget_txn, set_budget_category,
  add_quest, complete_quest, get_state
};

export default Actions;

// Window attachment for legacy paths
if (typeof window !== 'undefined'){
  window.NYX = window.NYX || {};
  window.NYX.actions = { run, runMany };
  window.NYX.runAction = run;
  window.NYX.runActions = runMany;
  log('v2.3 ultra-compatible loaded');
}
