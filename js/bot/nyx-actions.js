// nyx-actions.js — capability registry + safe app control (patched)
import { load, save } from '../util/storage.js';

function deepClone(v){ try { return structuredClone(v); } catch { return JSON.parse(JSON.stringify(v)); } }
function state(){ return load(); }
function persist(s){
  save(s);
  // let modules refresh if they care
  document.dispatchEvent(new CustomEvent('nq:state:reloaded'));
}

export const Actions = {
  _handlers: Object.create(null),
  _audit: [],
  _undo: [],

  register(name, fn, opts={}){ this._handlers[name] = { fn, opts }; },
  has(name){ return !!this._handlers[name]; },
  list(){ return Object.keys(this._handlers); },

  async run(name, params = {}){
    const h = this._handlers[name];
    if(!h) throw new Error('Unknown action: '+name);

    const before = deepClone(state()); // snapshot for undo
    const res = await h.fn(params);
    const entry = { t: Date.now(), name, params: deepClone(params), res: deepClone(res) };

    this._audit.push(entry);
    this._undo.push({ before });

    try {
      localStorage.setItem('nyx_audit', JSON.stringify(this._audit).slice(0, 50000));
    } catch(_) {}

    document.dispatchEvent(new CustomEvent('nq:action', { detail: entry }));
    return res;
  },

  async runMany(list){
    const out = [];
    for(const step of (list || [])){
      if(!step || !step.action) continue;
      out.push(await this.run(step.action, step.params || {}));
    }
    return out;
  },

  async undoLast(){
    const u = this._undo.pop();
    if(!u) return false;
    save(u.before);
    document.dispatchEvent(new CustomEvent('nq:state:reloaded'));
    return true;
  }
};

// ---------- Default actions (operate on storage.js state) ----------

// Quests
Actions.register('quest.create', async ({ title, tier='side', note='' })=>{
  if(!title) throw new Error('title required');
  const s = state();
  s.quests ||= {};
  s.quests.main ||= [];
  s.quests.side ||= [];
  const bucket = (tier === 'main') ? 'main' : 'side';
  const id = 'q_' + Math.random().toString(36).slice(2, 9);
  const q = { id, title, note, done:false, createdAt: Date.now(), tier: bucket };
  s.quests[bucket].push(q);
  persist(s);
  document.dispatchEvent(new CustomEvent('nq:quest-create', { detail: q }));
  return { ok:true, id };
});

Actions.register('quest.complete', async ({ id, title })=>{
  const s = state();
  const all = [...(s.quests?.main || []), ...(s.quests?.side || [])];
  const q = id
    ? all.find(x => x.id === id)
    : all.find(x => (x.title || '').toLowerCase() === String(title || '').toLowerCase());
  if(!q) throw new Error('quest not found');

  q.done = true;
  q.doneAt = Date.now();
  persist(s);

  document.dispatchEvent(new CustomEvent('nq:quest-complete', {
    detail: { id: q.id, title: q.title, tier: q.tier || 'side' }
  }));
  return { ok:true, id: q.id };
});

// Journal (matches journal.js structure: { entries:[], moods:[] })
Actions.register('journal.add', async ({ text })=>{
  if(!text) throw new Error('text required');
  const s = state();
  s.journal ||= { prompt:'', entries:[], moods:[] };
  s.journal.entries.push({ id: 'j_' + Math.random().toString(36).slice(2,9), t: Date.now(), text });
  persist(s);
  document.dispatchEvent(new CustomEvent('nq:journal-saved'));
  return { ok:true };
});

// Hydration / breathe ring (events only; economy handled by NYX)
Actions.register('hydrate.log', async ({ amount = 1 })=>{
  document.dispatchEvent(new CustomEvent('nq:hydrate', { detail: { amount } }));
  return { ok:true };
});
Actions.register('breathe.start', async ({ minutes = 1 })=>{
  document.dispatchEvent(new CustomEvent('nq:breathe', { detail: { minutes } }));
  return { ok:true };
});

// Shopping list (matches life.js: s.shop = [{ text, done }])
Actions.register('shopping.add', async ({ item, qty=1, unit='' })=>{
  if(!item) throw new Error('item required');
  const s = state();
  s.shop ||= [];
  s.shop.push({ text: String(item), done:false, qty, unit });
  persist(s);
  document.dispatchEvent(new CustomEvent('nq:shopping-add', { detail: { item, qty, unit } }));
  return { ok:true };
});

// Budget (matches life.js: s.budget.tx with { type:'inc'|'exp', amt, label })
Actions.register('budget.add', async ({ item, label, amount = 0, amt, category='misc', type })=>{
  const lbl = (label || item || 'Item');
  const val = Number(amount ?? amt ?? 0);
  if(!lbl) throw new Error('item/label required');

  const s = state();
  s.budget ||= { tx:[], income:0, expense:0 };
  const txType = type || (val >= 0 ? 'exp' : 'inc'); // default: positive = expense
  const v = Math.abs(val);

  s.budget.tx.push({
    type: txType,
    amt: v,
    label: lbl,
    category,
    ts: Date.now()
  });

  persist(s);
  document.dispatchEvent(new CustomEvent('nq:budget-add', { detail: { item: lbl, amount: v, category, type: txType } }));
  return { ok:true };
});

// Generic reward trigger (NYX economy/UI will celebrate)
Actions.register('reward.grant', async ({ xp = 5, gold = 1, reason = '' })=>{
  window.NQ?.track?.('custom', { xp, gold, reason });
  return { ok:true };
});
