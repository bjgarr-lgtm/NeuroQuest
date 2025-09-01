// src/game/quests.js
// Deterministic daily quest roll (seeded by date + hero). Reward format: { xp, coins, mood }

const MAIN_POOL = [
  { id:'deep20', title:'Deep Work — 20m', cat:'main', reward:{ xp:15, coins:5, mood:2 } },
  { id:'deep10', title:'Deep Work — 10m', cat:'main', reward:{ xp:10, coins:4, mood:2 } },
  { id:'move10', title:'Move Body — 10m', cat:'main', reward:{ xp:10, coins:4, mood:3 } },
  { id:'admin',  title:'Admin Sweep — 10m', cat:'main', reward:{ xp:10, coins:4, mood:1 } },
];

const SIDE_POOL = [
  { id:'hydrate', title:'Hydrate + Meds', cat:'side', reward:{ xp:6, coins:2, mood:2 } },
  { id:'tidy',    title:'Tidy a Corner',  cat:'side', reward:{ xp:6, coins:2, mood:2 } },
  { id:'msg1',    title:'Send 1 Message', cat:'side', reward:{ xp:6, coins:2, mood:1 } },
  { id:'freshair',title:'Fresh Air — 5m', cat:'side', reward:{ xp:6, coins:2, mood:2 } },
];

const SMALL_POOL = [
  { id:'water',   title:'Big Glass of Water',  cat:'small', reward:{ xp:4, coins:1, mood:1 } },
  { id:'stretch', title:'Stretch — 2m',        cat:'small', reward:{ xp:4, coins:1, mood:1 } },
  { id:'desk',    title:'Clear Desk — 2m',     cat:'small', reward:{ xp:4, coins:1, mood:1 } },
  { id:'breath',  title:'3 Deep Breaths',      cat:'small', reward:{ xp:4, coins:1, mood:1 } },
  { id:'snack',   title:'Protein Snack',       cat:'small', reward:{ xp:4, coins:1, mood:1 } },
];

const BONUS_POOL = [
  { id:'journal', title:'Tiny Journal',  cat:'bonus', reward:{ xp:8, coins:3, mood:2 } },
  { id:'inbox10', title:'Inbox — 10 mails', cat:'bonus', reward:{ xp:8, coins:3, mood:1 } },
  { id:'read10',  title:'Read — 10m',    cat:'bonus', reward:{ xp:8, coins:3, mood:2 } },
];

export function seedFromString(s) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function makeRNG(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function pick(rng, arr, n, excludeIds = new Set()) {
  const out = [];
  const pool = arr.filter(a => !excludeIds.has(a.id));
  while (out.length < n && pool.length) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/**
 * rollDailyQuests(dateISO, heroId, choices?)
 * choices: { mainId?: string, sideId?: string }
 * Returns array of quests (4–5 items): chosen main + chosen side + 2 random small/bonus
 */
export function rollDailyQuests(dateISO, heroId = 'bambi', choices = {}) {
  const seed = seedFromString(`${dateISO}|${heroId}|v1`);
  const rng = makeRNG(seed);

  const chosenMain = choices.mainId
    ? MAIN_POOL.find(q => q.id === choices.mainId) || MAIN_POOL[0]
    : MAIN_POOL[Math.floor(rng() * MAIN_POOL.length)];

  const chosenSide = choices.sideId
    ? SIDE_POOL.find(q => q.id === choices.sideId) || SIDE_POOL[0]
    : SIDE_POOL[Math.floor(rng() * SIDE_POOL.length)];

  const used = new Set([chosenMain.id, chosenSide.id]);

  // two from small/bonus mixed
  const smalls = pick(rng, SMALL_POOL, 2, used);
  const bonus  = pick(rng, BONUS_POOL, 1, used);
  const extras = pick(rng, [...smalls, ...bonus], 2, used); // ensure exactly two extras

  return [chosenMain, chosenSide, ...extras];
}

export const POOLS = { MAIN_POOL, SIDE_POOL, SMALL_POOL, BONUS_POOL };
