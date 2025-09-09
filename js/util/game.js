
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
