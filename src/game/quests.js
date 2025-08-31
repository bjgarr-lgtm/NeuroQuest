export const QUEST_LIBRARY = [
  { id:'pay-bill', title:'Pay a bill', cat:'main',  reward:{ xp:50, coins:10, mood:2 } },
  { id:'pickup-rx', title:'Pick up prescription', cat:'main', reward:{ xp:40, coins:8,  mood:2 } },
  { id:'journal', title:'Journal 5 lines', cat:'side',  reward:{ xp:20, coins:4,  mood:3 } },
  { id:'clean-bath', title:'Clean bathroom', cat:'side', reward:{ xp:30, coins:6 } },
  { id:'organize', title:'Organize one drawer', cat:'bonus', reward:{ xp:25, coins:5 } },
  { id:'dishes', title:'Do the dishes', cat:'small', reward:{ xp:10, coins:2 } },
  { id:'trash', title:'Take out trash', cat:'small', reward:{ xp:8,  coins:1 } },
  { id:'quick-tidy', title:'Quick tidy (5m)', cat:'small', reward:{ xp:12, coins:2 } },
];

function pick(arr, n) {
  const bag = [...arr];
  const out = [];
  while (out.length < n && bag.length) {
    out.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]);
  }
  return out;
}

export function rollDailyQuests() {
  const main  = pick(QUEST_LIBRARY.filter(q => q.cat === 'main'), 1);
  const side  = pick(QUEST_LIBRARY.filter(q => q.cat === 'side'), 2);
  const bonus = pick(QUEST_LIBRARY.filter(q => q.cat === 'bonus'), 1);
  const small = pick(QUEST_LIBRARY.filter(q => q.cat === 'small'), 3);
  return [...main, ...side, ...bonus, ...small];
}
