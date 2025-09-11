// storage.js — drop-in replacement wired to NQ
// Usage stays the same: import { load, save, onChange } from '../util/storage.js'

const KEY = 'nq_state';

function normalize(s={}){
  return {
    version: s.version ?? 1,
    gold: s.gold ?? 0,
    xp: s.xp ?? 0,
    level: s.level ?? 1,
    quests: {
      main: s.quests?.main ?? [],
      side: s.quests?.side ?? [],
      bonus: s.quests?.bonus ?? [],
      boss: s.quests?.boss ?? { name:'', progress:0 },
      raid: s.quests?.raid ?? { week:1, title:'', progress:0 }
    },
    journal: {
      entries: s.journal?.entries ?? [],
      moods: s.journal?.moods ?? []
    },
    life: {
      meals: s.life?.meals ?? { byDay:{} },
      grocery: s.life?.grocery ?? [],
      budget: s.life?.budget ?? []
    },
    settings: s.settings ?? { theme:'forest', font:'main', displayName:'Adventurer', music:{ library:[], currentUrl:'' } },
    ach: s.ach ?? {},
    tokens: s.tokens ?? []
  };
}

export function load(){
  try{
    if (window.NQ && typeof window.NQ.get === 'function'){
      return normalize(window.NQ.get());
    }
    return normalize(JSON.parse(localStorage.getItem(KEY)||'{}'));
  }catch(e){
    return normalize({});
  }
}

export function save(state){
  const s = normalize(state);
  try{
    if (window.NQ && typeof window.NQ.commit === 'function'){
      return window.NQ.commit(s);
    }
    localStorage.setItem(KEY, JSON.stringify(s));
    dispatchEvent(new CustomEvent('nq:state-changed', { detail: s }));
    return s;
  }catch(e){
    // last resort
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}

// Subscribe to changes anywhere (Godot or other tabs/pages)
export function onChange(fn){
  function handler(ev){
    try{
      const detail = ev.detail || JSON.parse(localStorage.getItem(KEY)||'{}');
      fn(normalize(detail));
    }catch(_){}
  }
  window.addEventListener('nq:state-changed', handler);
  window.addEventListener('storage', (e)=>{
    if (e.key === KEY) handler({ detail: JSON.parse(e.newValue||'{}') });
  });
  // return an unsubscribe
  return ()=>window.removeEventListener('nq:state-changed', handler);
}
