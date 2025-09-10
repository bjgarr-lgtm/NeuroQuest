
import {load, save} from './storage.js';
import {confetti} from '../ui/fx.js';
import {rewardChime, partyHorn} from '../ui/sfx.js';

export function addGold(n=1,{sparkle=true, sound=true}={}){
  const s=load();
  s.gold=(s.gold||0)+n;
  save(s);
  if(sound) rewardChime();
  if(sparkle) confetti();
  if(window.NQ_updateHud) window.NQ_updateHud();
  return s.gold;
}

export function addXP(n=5){
  const s=load();
  const before = s.xp||0;
  const beforeLv = s.level||1;
  const beforeBuckets = Math.floor((before)/100);
  s.xp = before + n;
  const afterBuckets = Math.floor((s.xp)/100);
  if(afterBuckets>beforeBuckets){
    // level up
    s.level = (s.level||1) + (afterBuckets-beforeBuckets);
    s.gold = (s.gold||0)+10; // +10 gold on level-up
    save(s);
    confetti(); confetti(); confetti(); // bigger feel
    partyHorn();
  } else {
    save(s);
  }
  if(window.NQ_updateHud) window.NQ_updateHud();
  return {xp:s.xp, level:s.level||1};
}


export function logAction(kind, amount=1){
  // Generic action tracker for auto-claim rewards
  const s=load();
  s.progress = s.progress||{};
  s.progress[kind]=(s.progress[kind]||0)+amount;
  // examples of auto-claim hooks
  const Ach = s.ach||(s.ach={});
  function earn(id, token){ if(!Ach[id]){ Ach[id]=true; s.tokens=(s.tokens||[]); s.tokens.push(token); save(s); confetti(); if(window.NQ_updateHud) window.NQ_updateHud(); } }
  // map some sample actions to achievements
  if(kind==='breath_session' && s.progress[kind]>=1){ earn('breathe-3rounds','🌬️'); addGold(1); } // also award coin
  if(kind==='walk' && s.progress[kind]>=5){ earn('walk-5','👟'); }
  if(kind==='cook' && s.progress[kind]>=3){ earn('cook-3','🍳'); }
  if(kind==='hydrate' && s.progress[kind]>=7){ earn('hydrate-7','💧'); }
  if(kind==='budget_setup' && s.progress[kind]>=1){ earn('budget-setup','💰'); }
  if(kind==='journal_entry' && s.progress[kind]>=3){ earn('journal-3','📔'); }
  save(s);
}
