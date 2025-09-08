// storage.js — safe, quota-aware localStorage helpers for SootheBirb v2.6
export const SB_STATE_KEY = 'sb_v26_state';
const MAX_JSON_BYTES = 2_600_000; // ~2.5MB safety budget

function byteLen(str){ return str.length * 2; }

function pruneState(state){
  if(!state) return state;
  const maybeLarge = [
    ['wardrobe','uploads'],['wardrobe','images'],['wardrobe','preview'],
    ['pet','images'],['overlays','images'],['overlays','raw']
  ];
  for(const path of maybeLarge){
    let obj = state;
    for(let i=0;i<path.length-1;i++){ obj = obj?.[path[i]]; if(!obj) break; }
    const last = path[path.length-1];
    if(obj && obj[last]) obj[last] = undefined;
  }
  function sweep(o,d=0){
    if(!o || d>5) return;
    if(Array.isArray(o)){
      for(let i=0;i<o.length;i++){
        const v=o[i];
        if(typeof v==='string' && v.length>100_000 && v.startsWith('data:')) o[i]=undefined;
        else if(typeof v==='object') sweep(v,d+1);
      }
    }else if(typeof o==='object'){
      for(const k of Object.keys(o)){
        const v=o[k];
        if(typeof v==='string' && v.length>100_000 && v.startsWith('data:')) o[k]=undefined;
        else if(typeof v==='object') sweep(v,d+1);
      }
    }
  }
  sweep(state);
  return state;
}

export function load(defaults){
  try{
    const raw = localStorage.getItem(SB_STATE_KEY);
    if(!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return Object.assign(structuredClone(defaults||{}), parsed||{});
  }catch{
    return structuredClone(defaults);
  }
}

export function save(nextState){
  try{
    let st = pruneState(structuredClone(nextState||{}));
    let json = JSON.stringify(st);
    if(byteLen(json)>MAX_JSON_BYTES){
      st = pruneState(st);
      json = JSON.stringify(st);
      if(byteLen(json)>MAX_JSON_BYTES){
        const minimal = {
          user: st.user||null, xp: st.xp||0, gold: st.gold||0, streak: st.streak||0,
          settings: st.settings||{}, party: st.party||{}, overlays: st.overlays||{}
        };
        json = JSON.stringify(minimal);
      }
    }
    localStorage.setItem(SB_STATE_KEY, json);
  }catch(err){
    try{
      const minimal = {
        user: nextState?.user||null, xp: nextState?.xp||0, gold: nextState?.gold||0, streak: nextState?.streak||0,
        settings: nextState?.settings||{}, party: nextState?.party||{}, overlays: nextState?.overlays||{}
      };
      localStorage.setItem(SB_STATE_KEY, JSON.stringify(minimal));
      console.warn('SootheBirb: state pruned due to quota; saved minimal progress.');
    }catch(e2){
      console.error('SootheBirb: unable to save state (quota).', e2);
    }
  }
}

export function getRaw(key,fallback){ try{ const v=localStorage.getItem(key); return v===null?fallback:v; }catch{ return fallback; } }
export function setRaw(key,value){ try{ localStorage.setItem(key,value); }catch{ console.warn('SootheBirb: setRaw quota hit, skipping key:', key); } }
