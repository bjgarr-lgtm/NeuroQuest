import React, { createContext, useContext, useReducer, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initial = {
  hero: 'bambi',
  companion: 'molly',
  coins: 50,
  xp: 0,
  streak: 0,
  today: { xpGain: 0, coinGain: 0 },
  cosmetics: { owned: [] },
  // …anything else you already track
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARTY':
      return { ...state, hero: action.hero ?? state.hero, companion: action.companion ?? state.companion };

    case 'GAIN':
      return {
        ...state,
        xp: state.xp + (action.xp || 0),
        coins: state.coins + (action.coins || 0),
        today: {
          xpGain: (state.today?.xpGain || 0) + (action.xp || 0),
          coinGain: (state.today?.coinGain || 0) + (action.coins || 0),
        },
      };

    case 'PURCHASE': {
      const item = action.item;
      if (!item) return state;
      if ((state.coins || 0) < item.cost) return state;
      const owned = new Set(state.cosmetics?.owned || []);
      owned.add(item.id);
      return {
        ...state,
        coins: state.coins - item.cost,
        cosmetics: { ...state.cosmetics, owned: Array.from(owned) },
      };
    }

    case 'START_DAY':
      return { ...state, today: { xpGain: 0, coinGain: 0 } };

    default:
      return state;
  }
}

const Ctx = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const actions = useMemo(() => ({
    setParty: (hero, companion) => dispatch({ type:'SET_PARTY', hero, companion }),
    gain: (xp=0, coins=0) => dispatch({ type:'GAIN', xp, coins }),
    purchase: (item) => { dispatch({ type:'PURCHASE', item }); return true; },
    startDay: () => dispatch({ type:'START_DAY' }),
    petInteract: (kind) => { // tiny feel-good coin
      if (kind === 'treat') dispatch({ type:'GAIN', xp:0, coins:1 });
    },
  }), []);

  // (optional) persist state here with AsyncStorage…

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame must be used inside GameProvider');
  return v;
}
