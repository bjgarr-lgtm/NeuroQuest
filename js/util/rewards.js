
// util/rewards.js
// Central registry for rewards + detectors. If we define a reward, we MUST define how it's detected.

import {load, save} from './storage.js';
import {confetti} from '../ui/fx.js';

// --- Event bus (very tiny) ---
const listeners = new Set();
export function onEvent(fn){ listeners.add(fn); return ()=>listeners.delete(fn); }
export function emit(type, data={}){ for(const fn of listeners){ try{ fn(type, data); }catch(_){ } } }

// --- State helpers ---
export function state(){ const s=load(); s.progress??={}; s.ach??={}; s.tokens??=[]; return s; }
function award(id, token){
  const s = state();
  if(s.ach[id]) return false;
  s.ach[id]=true;
  s.tokens.push(token);
  s.gold = (s.gold||0) + 1;
  save(s);
  try{ confetti(); }catch(_){}
  if(window.NQ_updateHud) window.NQ_updateHud();
  return true;
}

// --- Reward rules: each rule has a detector and a threshold.
export const rules = [
  { id:'first-quest', token:'⭐', key:'quest_done', need:1 },
  { id:'journal-3', token:'📔', key:'journal_entry', need:3 },
  { id:'walk-5', token:'👟', key:'walk', need:5 },
  { id:'cook-3', token:'🍳', key:'cook', need:3 },
  { id:'hydrate-7', token:'💧', key:'hydrate', need:7 },
  { id:'hydrate-30', token:'💦', key:'hydrate', need:30 },
  { id:'budget-setup', token:'💰', key:'budget_setup', need:1 },
  { id:'sleep-5', token:'😴', key:'sleep', need:5 },
  { id:'meditate-5', token:'🧘', key:'meditate', need:5 },
  { id:'social-2', token:'💬', key:'social', need:2 },
  { id:'laundry-week', token:'🧺', key:'laundry', need:1 },
  { id:'dish-streak', token:'🍽️', key:'dishes', need:4 },
  { id:'inbox-zero', token:'📬', key:'inbox_zero', need:1 },
  { id:'garden', token:'🪴', key:'garden', need:3 },
  { id:'book', token:'📚', key:'book', need:1 },
  { id:'skill', token:'🎯', key:'skill', need:5 },
  { id:'pet-care', token:'🐾', key:'pet_care', need:7 },
  { id:'kindness', token:'🌈', key:'kindness', need:3 },
  { id:'screen-down', token:'📵', key:'screen_down', need:3 },
  { id:'breathe-3rounds', token:'🌬️', key:'breath_session', need:1 },
];

// --- Progress logging + auto-claim ---
export function logProgress(key, amt=1){
  const s = state();
  s.progress[key] = (s.progress[key]||0) + amt;
  save(s);
  for(const r of rules){
    if(r.key===key && (s.progress[key]||0) >= r.need){
      award(r.id, r.token);
    }
  }
}

// --- Detectors ("AI bot"): heuristics so user doesn't have to press log buttons
const MAP = [
  ['hydrate','hydrate'],['water','hydrate'],
  ['walk','walk'],['run','walk'],
  ['cook','cook'],['meal','cook'],
  ['journal','journal_entry'],['save entry','journal_entry'],['add entry','journal_entry'],
  ['budget','budget_setup'],['income','budget_setup'],
  ['kind','kindness'],['kindness','kindness'],
  ['sleep','sleep'],['meditate','meditate'],
  ['social','social'],['laundry','laundry'],['dishes','dishes'],
  ['inbox','inbox_zero'],['garden','garden'],['plant','garden'],
  ['book','book'],['skill','skill'],['pet','pet_care'],
  ['screen','screen_down'],['quest','quest_done'],['complete','quest_done'],['done','quest_done']
];

function textOf(el){ return (el?.innerText || el?.textContent || '').toLowerCase(); }

let lastHit = new Map();
function hit(key, amt=1){
  const now=Date.now(), prev=lastHit.get(key)||0;
  if(now-prev<1200) return; // debounce
  lastHit.set(key, now);
  logProgress(key, amt);
  emit('progress', {key, amt});
}

// Click-based inference
document.addEventListener('click', (e)=>{
  const t = e.target.closest('button, a, .btn, .primary, .secondary, .danger, [role="button"], input[type="submit"]');
  if(!t) return;
  const txt = textOf(t);
  for(const [needle, key] of MAP){
    if(txt.includes(needle)){ hit(key); break; }
  }
}, {capture:true});

// Checkbox inference for quests
document.addEventListener('change', (e)=>{
  const input = e.target;
  if(input && input.matches('input[type="checkbox"]') && input.checked){
    const label = input.closest('label,.row,.quest') || input.parentElement;
    const t = textOf(label);
    hit('quest_done');
    if(/walk/.test(t)) hit('walk');
    if(/cook|meal/.test(t)) hit('cook');
    if(/hydrate|water/.test(t)) hit('hydrate');
    if(/kind/.test(t)) hit('kindness');
  }
}, {capture:true});

// Keyboard shortcuts (journal quick save)
document.addEventListener('keydown', (e)=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='enter'){
    const h = document.querySelector('h2,h3')?.innerText?.toLowerCase() || '';
    if(h.includes('journal')) hit('journal_entry');
  }
}, {capture:true});

// Mutation observer for success toasts/messages (journal save fallbacks)
const mo = new MutationObserver((muts)=>{
  for(const m of muts){
    for(const n of m.addedNodes){
      if(!(n instanceof HTMLElement)) continue;
      const txt=textOf(n);
      if(/journal/.test(txt) && /saved|added|entry created|posted|done/.test(txt)){
        hit('journal_entry');
      }
    }
  }
});
mo.observe(document.documentElement, {childList:true, subtree:true});

// Public API for explicit emits (e.g., breath session complete)
export function tracker(key, amt=1){ hit(key, amt); }

// Background sweep: ensure awards if thresholds already met
setInterval(()=>{
  const s=state();
  for(const r of rules){
    if(!s.ach[r.id] && (s.progress[r.key]||0) >= r.need){
      award(r.id, r.token);
    }
  }
}, 3000);
