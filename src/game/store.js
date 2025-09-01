import React, { createContext, useContext, useMemo, useReducer } from 'react';

const rand = (n) => Math.floor(Math.random() * n);
const todayStr = () => new Date().toISOString().slice(0,10);

const POOL = [
  { id:'dishes',     title:'Dishes',           cat:'clean',  xp:20, coins:3 },
  { id:'trash',      title:'Take out trash',   cat:'clean',  xp:18, coins:3 },
  { id:'quick-tidy', title:'Quick tidy',       cat:'clean',  xp:16, coins:2 },
  { id:'journal',    title:'Journal 5 min',    cat:'focus',  xp:22, coins:3 },
  { id:'walk',       title:'Short walk',       cat:'health', xp:24, coins:3 },
  { id:'hydrate',    title:'Drink water',      cat:'health', xp:10, coins:2 },
  { id:'email-3',    title:'Reply to 3 emails',cat:'focus',  xp:18, coins:2 },
  { id:'budget',     title:'Log spend',        cat:'money',  xp:14, coins:2 },
];

function dealQuests(count=6) {
  const seen = new Set(); const out = [];
  while (out.length < count && seen.size < POOL.length) {
    const q = POOL[rand(POOL.length)];
    if (!seen.has(q.id)) out.push({ id:q.id, title:q.title, cat:q.cat, reward:{ xp:q.xp, coins:q.coins } }), seen.add(q.id);
  }
  return out;
}

function levelForXP(xp){ return Math.floor(xp/200)+1; }

const initial = {
  hero:'bambi', companion:'molly',
  level:1, xp:0, coins:0, energy:5, mood:3,
  day:1, date:todayStr(),
  quests:[], completed:{},
  dayStartXP:0, dayStartCoins:0,
  summary:null, history:[],
};

const Ctx = createContext(null);

function reducer(state, action) {
  switch(action.type){
    case 'SET_PARTY': return { ...state, hero:action.hero, companion:action.companion };
    case 'START_DAY': {
      const quests = dealQuests(6);
      return {
        ...state,
        date: todayStr(),
        day: state.day + 1,
        quests,
        completed:{},
        dayStartXP: state.xp,
        dayStartCoins: state.coins,
        summary: null,
      };
    }
    case 'COMPLETE': {
      if (state.completed[action.q.id]) return state;
      const xp = state.xp + action.q.reward.xp;
      const coins = state.coins + action.q.reward.coins;
      return {
        ...state,
        xp, coins, level: levelForXP(xp),
        completed:{ ...state.completed, [action.q.id]: true },
        energy: Math.max(0, state.energy - 1),
        mood: Math.min(5, state.mood + 1),
      };
    }
    case 'LOCK_IN': {
      const total = state.quests.length;
      const doneIds = Object.keys(state.completed);
      const done = doneIds.length;
      const gainedXP = state.xp - state.dayStartXP;
      const gainedCoins = state.coins - state.dayStartCoins;
      const byCat = {};
      state.quests.forEach(q=>{
        const k=q.cat; byCat[k] ||= { total:0, done:0 };
        byCat[k].total++; if (state.completed[q.id]) byCat[k].done++;
      });
      const summary = { date:state.date, day:state.day, total, done, gainedXP, gainedCoins, byCat };
      return { ...state, summary };
    }
    case 'END_DAY': {
      const afterLock = reducer(state, { type:'LOCK_IN' });
      const history = [...afterLock.history, afterLock.summary];
      const cleared = { ...afterLock, history, completed:{}, quests:[], summary:null };
      return action.startNext ? reducer(cleared, { type:'START_DAY' }) : cleared;
    }
    default: return state;
  }
}

function insightsFrom(history){
  if (!history?.length) return [];
  const last = history[history.length-1];
  const avgDone = Math.round(history.reduce((a,h)=>a+(h.done/h.total||0),0)/history.length*100);
  let topCat=null, topPct=-1;
  Object.entries(last.byCat||{}).forEach(([k,v])=>{
    const pct = v.total ? Math.round((v.done/v.total)*100) : 0;
    if (pct>topPct) { topPct=pct; topCat=k; }
  });
  const tips = [];
  tips.push(`You finished ${last.done}/${last.total} quests (${Math.round(last.done/last.total*100)}%).`);
  tips.push(`Your average completion is ${avgDone}%.`);
  if (topCat) tips.push(`Best category today: ${topCat} (${topPct}%).`);
  if (last.gainedXP >= 100) tips.push('Big XP day! Consider a lighter day tomorrow.');
  if (last.gainedXP < 40) tips.push('Low XP day. Try 1–2 quick wins early tomorrow.');
  return tips;
}

export function GameProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initial);
  const actions = useMemo(()=>({
    setParty:(hero,companion)=>dispatch({ type:'SET_PARTY', hero, companion }),
    startDay:()=>dispatch({ type:'START_DAY' }),
    completeQuest:(q)=>dispatch({ type:'COMPLETE', q }),
    lockInDay:()=>dispatch({ type:'LOCK_IN' }),
    endDay:(opts={})=>dispatch({ type:'END_DAY', ...opts }),
    insights:()=>insightsFrom(state.history),
  }), [state.history]);
  const value = useMemo(()=>({ state, actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useGame(){ const c=useContext(Ctx); if(!c) throw new Error('useGame must be used inside GameProvider'); return c; }
