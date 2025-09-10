export const DEF = {
  user:{name:'You'},
  xp:0, level:1, gold:0, streak:0, best:0,
  toddler:false, toddlerCoins:0,
  party:{ hero:null, companions:[] },
  wardrobe:{ items:[], equipped:[] }, // adult accessories (images as data URLs)
  pet:{ owned:[], acc:[] },
  \1 1\2 },
  meals:{}, shop:[], budget:{ tx:[], goal:100, income:0, expense:0 },
  journal:{ prompt:'', entries:[], moods:[] },
  tokens:[], ach:{},
  gcal:'https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles'
};

const K='sb_v26_state';
export function load(){ try{ return JSON.parse(localStorage.getItem(K)) || structuredClone(DEF) }catch(e){ return structuredClone(DEF) } }
export function save(s){
  const prev = load(); const prevLvl=Math.floor((prev.xp||0)/100); const newLvl=Math.floor((s.xp||0)/100);
  localStorage.setItem(K, JSON.stringify(s));
  if(newLvl>prevLvl){ s.level=(s.level||1)+(newLvl-prevLvl); s.gold=(s.gold||0)+10; localStorage.setItem(K, JSON.stringify(s));
    document.dispatchEvent(new CustomEvent('nq:levelup'));
  }
}
export function reset(){ localStorage.removeItem(K); }
