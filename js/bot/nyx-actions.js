// js/bot/nyx-actions.js — v2.2 ESM
// Fix: Quest actions now DELEGATE to host app if available, else fallback to a local quest store.
// Still exports { Actions } and default, and exposes window.NYX.runAction(s).

const KEY_LISTS = 'SBX_LISTS';
const KEY_BUDG  = 'SBX_BUDG';
const KEY_QSTS  = 'SBX_QUESTS';  // fallback local quest store

function jget(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (d ?? {}); } catch { return (d ?? {}); } }
function jset(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ console.warn('[NYX-ACTIONS] save fail', e); } }
function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function num(x, def=0){ const n = Number(x); return Number.isFinite(n) ? n : def; }
function str(x, def=''){ return (typeof x === 'string' && x.trim().length) ? x.trim() : def; }

// ---------- Helper: delegate to host app if possible ----------
async function tryDelegate(name, params){
  // Common function entry points in your app:
  const candidates = [
    // explicit global functions
    window[name],
    window[name?.replace(/([a-z])_([a-z])/g,(m,a,b)=>a+b.toUpperCase())], // snake_case -> camelCase
    // App namespaces seen in builds
    window.App?.[name], window.App?.quests?.[name], window.NQ?.[name], window.NQ?.quests?.[name]
  ].filter(Boolean);

  for (const fn of candidates){
    try{
      const out = fn.call(window.App || window, params);
      const val = out instanceof Promise ? await out : out;
      if (val !== undefined) return { ok:true, delegated:true, result: val };
    }catch(e){ console.warn('[NYX-ACTIONS] delegate error', e); }
  }

  // Event-based delegation
  try {
    const evName = `nyx:${name}`;
    const detail = { params, result: undefined };
    const res = await new Promise((resolve)=>{
      const done = (e)=>{
        window.removeEventListener(`${evName}:result`, done, { once:true });
        resolve(e.detail ?? { ok:true });
      };
      window.addEventListener(`${evName}:result`, done, { once:true });
      window.dispatchEvent(new CustomEvent(evName, { detail }));
      // Failsafe timeout (no listener): resolve after 50ms with undefined
      setTimeout(()=>resolve(undefined), 50);
    });
    if (res !== undefined) return { ok:true, delegated:true, result: res };
  } catch(e) {
    console.warn('[NYX-ACTIONS] event delegate error', e);
  }
  return { ok:false, delegated:false };
}

// ---------- LISTS ----------
function ensureLists(){
  const L = jget(KEY_LISTS, {});
  if (!Array.isArray(L.shopping)) L.shopping = [];
  return L;
}

export async function add_shopping_item(p={}){
  const text = str(p.item || p.text || p.name, '');
  if (!text) return { ok:false, error:'missing item text' };
  const L = ensureLists();
  const it = { id: uid(), text, done: !!p.done };
  L.shopping.push(it);
  jset(KEY_LISTS, L);
  return { ok:true, item: it, lists: L };
}

export async function remove_shopping_item(p={}){
  const id = str(p.id, '');
  if (!id) return { ok:false, error:'missing id' };
  const L = ensureLists();
  const before = L.shopping.length;
  L.shopping = L.shopping.filter(x=>x.id !== id);
  const removed = before - L.shopping.length;
  jset(KEY_LISTS, L);
  return { ok:true, removed, lists: L };
}

export async function toggle_shopping_item(p={}){
  const id = str(p.id, '');
  if (!id) return { ok:false, error:'missing id' };
  const L = ensureLists();
  const it = L.shopping.find(x=>x.id===id);
  if (!it) return { ok:false, error:'not found' };
  it.done = p.done != null ? !!p.done : !it.done;
  jset(KEY_LISTS, L);
  return { ok:true, item: it, lists: L };
}

export async function clear_checked_shopping(){
  const L = ensureLists();
  L.shopping = L.shopping.filter(x=>!x.done);
  jset(KEY_LISTS, L);
  return { ok:true, lists: L };
}

// ---------- BUDGET ----------
function ensureBudget(){
  const B = jget(KEY_BUDG, {});
  if (!Array.isArray(B.txns)) B.txns = [];
  if (!B.cats) B.cats = {};
  if (!B.totals) B.totals = {};
  return B;
}
function recomputeTotals(B){
  const totals = {};
  for (const t of B.txns){ const c = t.cat || 'uncategorized'; totals[c] = (totals[c]||0) + num(t.amt); }
  B.totals = totals;
}

export async function add_budget_txn(p={}){
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
}

export async function remove_budget_txn(p={}){
  const id = str(p.id, '');
  if (!id) return { ok:false, error:'missing id' };
  const B = ensureBudget();
  const before = B.txns.length;
  B.txns = B.txns.filter(x=>x.id !== id);
  recomputeTotals(B);
  jset(KEY_BUDG, B);
  return { ok:true, removed: before - B.txns.length, budget:B };
}

export async function set_budget_category(p={}){
  const cat = str(p.category ?? p.cat, '');
  const lim = num(p.limit ?? p.budget, NaN);
  if (!cat) return { ok:false, error:'missing category' };
  if (!Number.isFinite(lim)) return { ok:false, error:'missing limit' };
  const B = ensureBudget();
  B.cats[cat.toLowerCase()] = lim;
  recomputeTotals(B);
  jset(KEY_BUDG, B);
  return { ok:true, budget:B };
}

// ---------- QUESTS ----------
function ensureQuests(){
  const Q = jget(KEY_QSTS, {});
  if (!Array.isArray(Q.items)) Q.items = [];
  return Q;
}

export async function add_quest(p={}){
  // 1) Try to hand off to host app (keeps your existing working behavior)
  const d = await tryDelegate('add_quest', p);
  if (d.delegated) return d.result || { ok:true, delegated:true };

  // 2) Fallback local store
  const text = str(p.text || p.title || p.name || p.quest, '');
  if (!text) return { ok:false, error:'missing quest text' };
  const Q = ensureQuests();
  const q = { id: uid(), text, done: !!p.done, created: Date.now() };
  Q.items.push(q);
  jset(KEY_QSTS, Q);
  return { ok:true, quest:q, quests:Q, delegated:false };
}

export async function complete_quest(p={}){
  const d = await tryDelegate('complete_quest', p);
  if (d.delegated) return d.result || { ok:true, delegated:true };

  const id = str(p.id, '');
  if (!id) return { ok:false, error:'missing id' };
  const Q = ensureQuests();
  const it = Q.items.find(x=>x.id===id);
  if (!it) return { ok:false, error:'not found' };
  it.done = true;
  jset(KEY_QSTS, Q);
  return { ok:true, quest: it, quests: Q, delegated:false };
}

export async function get_state(){
  const B = ensureBudget();
  recomputeTotals(B);
  return { ok:true, lists: ensureLists(), budget: B, quests: ensureQuests() };
}

// ---------- Runner API ----------
const registry = Object.create(null);
for (const fn of [
  add_shopping_item, remove_shopping_item, toggle_shopping_item, clear_checked_shopping,
  add_budget_txn, remove_budget_txn, set_budget_category, get_state,
  add_quest, complete_quest
]) {
  registry[fn.name.toLowerCase()] = fn;
}

export async function run({type, params}={}){
  try{
    const k = String(type||'').toLowerCase();
    const fn = registry[k];
    if (typeof fn !== 'function') return { ok:false, error:`unknown action: ${k}` };
    const out = await fn(params||{});
    if (!out || out.ok === false) return out || { ok:false, error:'unknown failure' };
    return out;
  }catch(e){
    console.error('[NYX ACTION ERROR]', e);
    return { ok:false, error: String(e && e.message || e) };
  }
}

export async function runMany(arr){
  const results = [];
  for (const step of (Array.isArray(arr)?arr:[arr])){
    results.push(await run(step));
  }
  return { ok:true, results };
}

export const Actions = { run, runMany,
  add_shopping_item, remove_shopping_item, toggle_shopping_item, clear_checked_shopping,
  add_budget_txn, remove_budget_txn, set_budget_category, get_state,
  add_quest, complete_quest
};

export default Actions;

if (typeof window !== 'undefined') {
  window.NYX = window.NYX || {};
  window.NYX.actions = { run, runMany };
  window.NYX.runAction = run;
  window.NYX.runActions = runMany;
  console.log('[NYX-ACTIONS] v2.2 ESM patch active');
}