import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { rollDailyQuests } from './quests';

const initial = {
  day: null,
  heroKey: null,
  companionKey: null,
  xp: 0,
  coins: 0,
  hearts: 3,
  energy: 10,
  mood: 50, // 0-100
  level: 1,
  quests: [],
  completed: {},
  stats: { focusMinutes: 0, tasksDone: 0 },
};

const XP_PER_LEVEL = 200;
const levelForXP = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PARTY':
      return { ...state, heroKey: action.heroKey, companionKey: action.companionKey };
    case 'START_DAY': {
      const today = dayjs().format('YYYY-MM-DD');
      const quests = rollDailyQuests();
      return { ...state, day: today, energy: 10, hearts: 3, completed: {}, quests };
    }
    case 'COMPLETE_QUEST': {
      const q = action.quest;
      if (!q || state.completed[q.id]) return state;
      const xp = state.xp + (q.reward?.xp || 0);
      const coins = state.coins + (q.reward?.coins || 0);
      const mood = Math.min(100, state.mood + (q.reward?.mood || 0));
      return {
        ...state,
        xp,
        coins,
        mood,
        level: levelForXP(xp),
        completed: { ...state.completed, [q.id]: true },
        stats: { ...state.stats, tasksDone: state.stats.tasksDone + 1 },
      };
    }
    case 'ADD_FOCUS': {
      const minutes = action.minutes ?? 0;
      const xp = state.xp + minutes; // tiny drip per minute
      return { ...state, stats: { ...state.stats, focusMinutes: state.stats.focusMinutes + minutes }, xp, level: levelForXP(xp) };
    }
    case 'END_DAY':
      return state;
    case 'LOAD':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // load
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('nq_state_v1');
      if (saved) {
        try {
          dispatch({ type: 'LOAD', state: JSON.parse(saved) });
        } catch {}
      }
    })();
  }, []);

  // save
  useEffect(() => {
    AsyncStorage.setItem('nq_state_v1', JSON.stringify(state));
  }, [state]);

  const actions = useMemo(
    () => ({
      setParty: (heroKey, companionKey) => dispatch({ type: 'SET_PARTY', heroKey, companionKey }),
      startDay: () => dispatch({ type: 'START_DAY' }),
      completeQuest: (quest) => dispatch({ type: 'COMPLETE_QUEST', quest }),
      addFocus: (minutes) => dispatch({ type: 'ADD_FOCUS', minutes }),
      endDay: () => dispatch({ type: 'END_DAY' }),
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
