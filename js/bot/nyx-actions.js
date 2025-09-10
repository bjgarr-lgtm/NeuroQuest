// nyx-actions.js — capability registry + safe app control
import { load, save } from '../util/storage.js';

function ensure(obj, path, dflt){
  const parts = path.split('.'); let cur=obj;
  for(const p of parts){ if(!(p in cur)) cur[p] = {}; cur = cur[p]; }
  return cur;
}

export const Actions = {
  _handlers: Object.create(null),
  _audit: [],
  _undo: [],

  register(name, fn, opts={}){
    this._handlers[name] = {fn, opts};
  },
  has(name){ return !!this._handlers[name]; },
  list(){ return Object.keys(this._handlers); },

  async run(name, params={}){
    const h = this._handlers[name];
    if(!h) throw new Error('Unknown action: '+name);
    const before = load(); // snapshot for undo (shallow)
    const res = await h.fn(params);
    const after = load();
    const entry = { t: Date.now(), name, params, res };
    this._audit.push(entry);
    this._undo.push({ before, after });
    try{ localStorage.setItem('nyx_audit', JSON.stringify(this._audit).slice(0,50000)); }catch(_){}
    document.dispatchEvent(new CustomEvent('nq:action', { detail: entry }));
    return res;
  },

  async runMany(list){
    const results = [];
    for(const step of (list||[])){
      if(!step || !step.action) continue;
      results.push(await this.run(step.action, step.params||{}));
    }
    return results;
  },

  async undoLast(){
    const u = this._undo.pop(); if(!u) return false;
    save(u.before); document.dispatchEvent(new CustomEvent('nq:state:reloaded')); return true;
  }
};

// ---- Default actions (operate on storage.js state), emit app events for modules that listen ----

function state(){ return load(); }
function persist(s){ save(s); document.dispatchEvent(new CustomEvent('nq:state:reloaded')); }

// Quests
Actions.register('quest.create', async ({ title, tier='side', note='' })=>{
  if(!title) throw new Error('title required');
  const s = state(); s.quests = s.quests || {}; s.quests.main = s.quests.main || []; s.quests.side = s.quests.side || [];
  const bucket = (tier==='main') ? 'main' : 'side';
  const id = 'q_'+Math.random().toString(36).slice(2,9);
  const q = { id, title, note, done:false, createdAt: Date.now(), tier: bucket };
  s.quests[bucket].push(q); persist(s);
  document.dispatchEvent(new CustomEvent('nq:quest-create', { detail: q }));
  return { ok:true, id };
});

Actions.register('quest.complete', async ({ id, title })=>{
  const s = state(); const all = [...(s.quests?.main||[]), ...(s.quests?.side||[])];
  const q = id ? all.find(x=>x.id===id) : all.find(x=> (x.title||'').toLowerCase() === String(title||'').toLowerCase());
  if(!q) throw new Error('quest not found');
  q.done = true; q.doneAt = Date.now(); persist(s);
  document.dispatchEvent(new CustomEvent('nq:quest-complete', { detail: { id:q.id, title:q.title, tier:q.tier||'side' } }));
  return { ok:true, id:q.id };
});

// Journal
Actions.register('journal.add', async ({ text })=>{
  if(!text) throw new Error('text required');
  const s = state(); s.journal = s.journal || []; s.journal.push({ id:'j_'+Math.random().toString(36).slice(2,9), text, ts: Date.now() });
  persist(s);
  document.dispatchEvent(new CustomEvent('nq:journal-saved'));
  return { ok:true };
});

// Hydration / breathe ring
Actions.register('hydrate.log', async ({ amount=1 })=>{ document.dispatchEvent(new CustomEvent('nq:hydrate', { detail: { amount } })); return { ok:true }; });
Actions.register('breathe.start', async ({ minutes=1 })=>{ document.dispatchEvent(new CustomEvent('nq:breathe', { detail: { minutes } })); return { ok:true }; });

// Shopping list
Actions.register('shopping.add', async ({ item, qty=1, unit='' })=>{
  if(!item) throw new Error('item required');
  const s = state(); s.shopping = s.shopping || []; s.shopping.push({ id:'s_'+Math.random().toString(36).slice(2,9), item, qty, unit, done:false });
  persist(s); document.dispatchEvent(new CustomEvent('nq:shopping-add', { detail: { item, qty, unit } }));
  return { ok:true };
});

// Budget
Actions.register('budget.add', async ({ item, amount=0, category='misc' })=>{
  if(!item) throw new Error('item required');
  const s = state(); s.budget = s.budget || []; s.budget.push({ id:'b_'+Math.random().toString(36).slice(2,9), item, amount: Number(amount||0), category, ts: Date.now() });
  persist(s); document.dispatchEvent(new CustomEvent('nq:budget-add', { detail: { item, amount, category } }));
  return { ok:true };
});

// Generic reward trigger
Actions.register('reward.grant', async ({ xp=5, gold=1, reason='' })=>{
  // let NYX economy handle UI fanfare
  window.NQ?.track?.('custom', { xp, gold, reason }); return { ok:true };
});
