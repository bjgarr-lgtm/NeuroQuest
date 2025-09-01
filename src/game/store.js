// src/game/store.js
// React Context store with AsyncStorage persistence, deterministic daily rolls,
// Finch-like systems, and a Zustand-like getState shim for convenience.

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rollDailyQuests } from './quests';

/* ---------------- utils ---------------- */
const todayISO = () => {
  const d = new Date();
  // use local date (not UTC) so "today" feels right for the player
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function nextLevel(level) { return level * 100; }  // xp needed per level
function applyXP(state, add) {
  let xp = state.xp + add;
  let level = state.level;
  let xpTo = nextLevel(level);
  while (xp >= xpTo) {
    xp -= xpTo;
    level += 1;
    xpTo = nextLevel(level);
  }
  return { xp, level };
}

/* ---------------- initial state ---------------- */
const BASE = {
  date: todayISO(),

  hero: 'bambi',
  companion: 'molly',

  xp: 0,
  level: 1,
  coins: 0,

  hearts: 5,
  mood: 70,            // 0..100
  affection: 20,       // pet affection 0..100
  petLevel: 1,

  quests: [],
  completed: {},

  // today roll tallies
  xpToday: 0,
  coinsToday: 0,
  completedToday: 0,
  focusMinToday: 0,

  // long-term
  focusMin: 0,
  completedCount: 0,
  streak: 0,
  lastDayEnded: null,  // 'YYYY-MM-DD'

  history: [],         // entries: {date, completed, total, focusMin, catHits, hourHits}

  // cosmetics
  skins: [],           // ['hoodie','cloak',...]
};

const STORAGE_KEY = '@neuroquest_v2';

/* ---------------- reducer ---------------- */
function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      const s = action.payload || {};
      return { ...state, ...s, date: s.date || todayISO() };
    }

    case 'SET_HERO':     return { ...state, hero: action.id };
    case 'SET_COMPANION':return { ...state, companion: action.id };

    case 'START_DAY': {
      const date = todayISO();
      const { mainId, sideId } = action;
      const quests = rollDailyQuests(date, state.hero, { mainId, sideId });
      return {
        ...state,
        date,
        quests,
        completed: {},
        // reset today's tallies (do NOT wipe totals)
        xpToday: 0,
        coinsToday: 0,
        completedToday: 0,
        focusMinToday: 0,
      };
    }

    case 'ROLL_NEW_QUESTS': {
      const date = todayISO();
      const quests = rollDailyQuests(date, state.hero, {});
      return {
        ...state,
        date,
        quests,
        completed: {},
        xpToday: 0,
        coinsToday: 0,
        completedToday: 0,
        focusMinToday: 0,
      };
    }

    case 'COMPLETE_QUEST': {
      const q = action.q;
      if (!q || state.completed[q.id]) return state;

      // rewards
      const addXP = q.reward?.xp ?? 5;
      const addCoins = q.reward?.coins ?? 1;
      const mood = clamp((state.mood + (q.reward?.mood ?? 1)), 0, 100);
      const aff  = clamp(state.affection + 1, 0, 100);

      const { xp, level } = applyXP(state, addXP);

      return {
        ...state,
        completed: { ...state.completed, [q.id]: true },
        completedToday: state.completedToday + 1,
        completedCount: state.completedCount + 1,
        xp, level,
        xpToday: state.xpToday + addXP,
        coins: state.coins + addCoins,
        coinsToday: state.coinsToday + addCoins,
        mood,
        affection: aff,
      };
    }

    case 'ADD_FOCUS': {
      const mins = action.mins || 0;
      return {
        ...state,
        focusMin: state.focusMin + mins,
        focusMinToday: state.focusMinToday + mins,
        mood: clamp(state.mood + 1, 0, 100),
      };
    }

    case 'REWARD': {
      const addXP = action.payload?.xp ?? 0;
      const addCoins = action.payload?.coins ?? 0;
      const moodUp = action.payload?.mood ?? 0;
      const { xp, level } = applyXP(state, addXP);
      return {
        ...state,
        xp, level,
        xpToday: state.xpToday + addXP,
        coins: state.coins + addCoins,
        coinsToday: state.coinsToday + addCoins,
        mood: clamp(state.mood + moodUp, 0, 100),
      };
    }

    case 'PET_INTERACT': {
      const bump = action.kind === 'treat' ? 4 : 2;
      const aff = clamp(state.affection + bump, 0, 100);
      const petLevel = 1 + Math.floor(aff / 30);
      return { ...state, affection: aff, petLevel };
    }

    case 'END_DAY': {
      // compute soft streak
      const today = state.date || todayISO();
      let streak = state.streak;
      if (state.completedToday > 0 || state.focusMinToday >= 5) {
        if (!state.lastDayEnded) streak = 1;
        else {
          const prev = new Date(state.lastDayEnded);
          const cur = new Date(today);
          const diff = Math.round((cur - prev) / 86400000);
          if (diff === 1) streak += 1;
          else if (diff > 1) streak = Math.max(1, Math.round(streak * 0.6)); // soft decay
        }
      }

      // aggregate categories
      const catHits = {};
      for (const q of state.quests) {
        const done = !!state.completed[q.id];
        if (!done) continue;
        catHits[q.cat] = (catHits[q.cat] || 0) + 1;
      }
      // crude time-of-day heuristic: more afternoon by default
      const hourHits = { morning: 2, afternoon: 4, evening: 3 };

      const histEntry = {
        date: today,
        completed: state.completedToday,
        total: state.quests.length,
        focusMin: state.focusMinToday,
        catHits, hourHits,
      };
      const history = [...state.history, histEntry].slice(-60);

      return {
        ...state,
        streak,
        lastDayEnded: today,
        history,
        // keep today tallies so EndDay screen can show them; clear on next START/ROLL
      };
    }

    case 'SPEND_COINS': {
      const amt = Math.max(0, action.amount | 0);
      if (state.coins < amt) return state;
      return { ...state, coins: state.coins - amt };
    }

    case 'BUY_SKIN': {
      const { id, price } = action;
      if (!id || state.skins.includes(id) || state.coins < price) return state;
      return { ...state, skins: [...state.skins, id], coins: state.coins - price };
    }

    default:
      return state;
  }
}

/* ---------------- context provider ---------------- */
const Ctx = createContext({ state: BASE, actions: {} });

let lastSnapshot = { state: BASE, actions: {} }; // for useGame.getState()

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, BASE);
  const ready = useRef(false);

  // actions (stable)
  const actions = useMemo(() => ({
    setHero:        (id) => dispatch({ type:'SET_HERO', id }),
    setCompanion:   (id) => dispatch({ type:'SET_COMPANION', id }),
    setParty:       ({ hero, companion }) => { if (hero) dispatch({ type:'SET_HERO', id:hero }); if (companion) dispatch({ type:'SET_COMPANION', id:companion }); },

    startDay:       ({ main, side } = {}) => dispatch({ type:'START_DAY', mainId: main?.id, sideId: side?.id }),
    rollNewQuests:  () => dispatch({ type:'ROLL_NEW_QUESTS' }),
    completeQuest:  (q) => dispatch({ type:'COMPLETE_QUEST', q }),
    addFocus:       (mins) => dispatch({ type:'ADD_FOCUS', mins }),
    reward:         (payload) => dispatch({ type:'REWARD', payload }),

    petInteract:    (kind) => dispatch({ type:'PET_INTERACT', kind }),

    endDay:         () => dispatch({ type:'END_DAY' }),
    lockInDay:      () => dispatch({ type:'END_DAY' }), // alias to satisfy older calls

    buySkin:        (id, price) => dispatch({ type:'BUY_SKIN', id, price }),
    spendCoins:     (amount) => dispatch({ type:'SPEND_COINS', amount }),
  }), []);

  // hydrate once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type:'HYDRATE', payload: parsed });
        } else {
          // First run → roll quests so the app isn't empty
          dispatch({ type:'ROLL_NEW_QUESTS' });
        }
      } catch {}
      ready.current = true;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist on change (after ready)
  useEffect(() => {
    lastSnapshot = { state, actions };
    if (!ready.current) return;
    const save = async () => {
      try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    };
    // debounce a bit
    const id = setTimeout(save, 120);
    return () => clearTimeout(id);
  }, [state, actions]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  lastSnapshot = value;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ---------------- hook + shim ---------------- */
export function useGame() {
  return useContext(Ctx);
}
// Zustand-like shim so code can call: useGame.getState()?.state / actions
useGame.getState = () => lastSnapshot;
