// storage.js — quota-safe localStorage
const KEY='sb_v3_state'; const MAX=2_600_000;
function plen(s){return s.length*2}
function prune(s){
  if(!s) return s; const drop=[['wardrobe','images'],['wardrobe','uploads'],['pet','images'],['overlays','images']];
  for(const p of drop){ let o=s; for(let i=0;i<p.length-1;i++){ o=o?.[p[i]]; if(!o) break; } if(o&&o[p.at(-1)]) o[p.at(-1)]=undefined; }
  return s;
}
export function load(def){ try{ const raw=localStorage.getItem(KEY); if(!raw) return structuredClone(def);
  const parsed=JSON.parse(raw); return Object.assign(structuredClone(def||{}), parsed||{}); }catch{ return structuredClone(def); } }
export function save(state){ try{ let st=prune(structuredClone(state||{})); let json=JSON.stringify(st); if(plen(json)>MAX){
    st=prune(st); json=JSON.stringify(st); if(plen(json)>MAX){ const min={user:st.user||null,xp:st.xp||0,gold:st.gold||0,streak:st.streak||0,settings:st.settings||{},party:st.party||{}}; json=JSON.stringify(min); }
  } localStorage.setItem(KEY,json); }catch(e){ console.warn('save quota issue',e);} }
