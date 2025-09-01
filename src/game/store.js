import React, { createContext, useContext, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initial = {
  hero: null,
  companion: null,
  xp: 0,
  coins: 50,
  streak: 0,
  today: { xpGain: 0, coinGain: 0, done: [] },
  cosmetics: { owned: [] },
  daily: [], // rolled quests for the day
};

function rollDaily() {
  // simple deterministic roll (could seed by date later)
  return [
    { id:'main-1', kind:'main',  title:'Main Quest', reward:{ xp:20, coins:10 } },
    { id:'side-1', kind:'side',  title:'Side Quest', reward:{ xp:10, coins:5 } },
    { id:'small-1',kind:'small', title:'Tiny Quest', reward:{ xp:5,  coins:2 } },
  ];
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARTY':
      return { ...state, hero: action.hero ?? state.hero, companion: action.companion ?? state.companion };

    case 'START_DAY':
      return { ...state, daily: rollDaily(), today: { xpGain:0, coinGain:0, done: [] } };

    case 'COMPLETE_QUEST': {
      const q = action.quest;
      if (!q) return state;
      if (state.today.done.includes(q.id)) return state;
      return {
        ...state,
        xp: state.xp + (q.reward?.xp || 0),
        coins: state.coins + (q.reward?.coins || 0),
        today: {
          ...state.today,
          xpGain: state.today.xpGain + (q.reward?.xp || 0),
          coinGain: state.today.coinGain + (q.reward?.coins || 0),
          done: [...state.today.done, q.id],
        },
      };
    }

    case 'PURCHASE': {
      const { id, cost } = action.item || {};
      if (!id || (state.coins || 0) < (cost || 0)) return state;
      const owned = new Set(state.cosmetics.owned);
      owned.add(id);
      return { ...state, coins: state.coins - cost, cosmetics: { owned: Array.from(owned) } };
    }

    case 'END_DAY':
      return { ...state, streak: state.streak + 1 };

    default: return state;
  }
}

const Ctx = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // (optional) persistence stub (no-op if it fails on web)
  React.useEffect(() => { AsyncStorage.setItem('NQ_STATE', JSON.stringify(state)).catch(()=>{}); }, [state]);
  React.useEffect(() => { (async() => {
    const raw = await AsyncStorage.getItem('NQ_STATE'); if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      dispatch({ type:'HYDRATE', ...saved }); // ignored by reducer; kept minimal to avoid complexity
    } catch {}
  })(); }, []);

  const actions = useMemo(() => ({
    setParty: (hero, companion) => dispatch({ type:'SET_PARTY', hero, companion }),
    startDay: () => dispatch({ type:'START_DAY' }),
    completeQuest: (quest) => dispatch({ type:'COMPLETE_QUEST', quest }),
    purchase: (item) => { dispatch({ type:'PURCHASE', item }); return true; },
    endDay: () => dispatch({ type:'END_DAY' }),
  }), []);

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame must be used inside GameProvider');
  return v;
}
