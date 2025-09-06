
export const LS = {
  get(k, d){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

export const DEF = {
  user:{name:""},
  xp:0, level:1, gold:0, streak:0, best:0,
  toddler:false, toddlerCoins:0,
  party:{ you:"hero-ash.png", companions:[] },
  wardrobe:{ owned:[], equipped:[] },
  pet:{ owned:[], acc:[] },
  tasks:{ main:[], side:[], bonus:[] },
  clean:{ boss:{name:"Bathroom", progress:0}, raid:{name:"Deep clean", week:2}, small:[] },
  budget:{ income:[], expenses:[], goal:100 },
  shop:[],
  journal:{ entries:[], prompts:["What felt good today?","One tiny win","A note to future you"] },
  moods:[],
  meals:{ grid: Array.from({length:7},()=>({breakfast:"",lunch:"",dinner:""})) },
  calendar:{ src:"https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles" }
};

export let S = LS.get("sb_state", DEF);
export function save(){ LS.set("sb_state", S); }

export function addXP(n){ S.xp+=n; while(S.xp>=100){ S.xp-=100; S.level++; } save(); }
export function addGold(n){ S.gold+=n; if(S.gold<0) S.gold=0; save(); }
