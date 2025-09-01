// Simple localStorage data layer
const KEY = "soothebirb.v1";

const defaultState = () => ({
  user: { name: "", theme: "forest", font: "system-ui" },
  pet: { name: "Pebble", species: "birb", level: 1, xp: 0, acc: [], discovered: ["cap","bow","glasses"] },
  streak: { current: 0, best: 0, lastCheck: "" },
  log: {
    moods: [], // {ts, mood, tags, notes, score}
    tasks: [], // {id, title, done, ts}
    journal: [], // {id, ts, prompt, text}
    breath: []  // {ts, secs}
  }
});

export function loadState(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || defaultState(); }
  catch(e){ return defaultState(); }
}

export function saveState(s){
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(){
  localStorage.removeItem(KEY);
}

export function dayKey(ts=new Date()){
  const d = new Date(ts);
  d.setHours(0,0,0,0);
  return d.toISOString();
}

export function touchStreak(state){
  const today = dayKey();
  if(state.streak.lastCheck !== today){
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const yKey = dayKey(yesterday);
    if(state.streak.lastCheck === yKey){
      state.streak.current += 1;
    } else {
      state.streak.current = 1;
    }
    state.streak.best = Math.max(state.streak.best, state.streak.current);
    state.streak.lastCheck = today;
  }
}

export function addXP(state, amount){
  state.pet.xp += amount;
  while(state.pet.xp >= xpForLevel(state.pet.level+1)){
    state.pet.level += 1;
  }
}

export function xpForLevel(level){
  return level*level*10; // quadratic
}
