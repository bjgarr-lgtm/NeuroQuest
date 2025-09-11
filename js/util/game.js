// /util/game.js
// Core game helpers (gold / XP) with progress + achievements delegated to /util/rewards.js

import {load, save} from './storage.js';
import {confetti, crownDrop} from '../ui/fx.js';
import {rewardChime, partyHorn} from '../ui/sfx.js';
import {logProgress} from './rewards.js';   // ← use your rewards logger

function hudTick(){ try{ window.NQ_updateHud && window.NQ_updateHud(); }catch{} }
function emit(type, detail){ try{ document.dispatchEvent(new CustomEvent(`nq:${type}`, {detail})); }catch{} }

export function addGold(n=1, {sparkle=true, sound=true} = {}){
  const s = load();
  const amt = Number(n)||0;
  if(!amt) return s.gold||0;

  s.gold = (Number(s.gold)||0) + amt;
  save(s);

  if(sound) rewardChime();
  if(sparkle){ try{ crownDrop(); confetti(); }catch{} }

  emit('gold', {gold:s.gold, delta:amt});
  hudTick();
  return s.gold;
}

export function addXP(n=5){
  const s = load();
  const gain = Number(n)||0;
  if(!gain) return {xp:s.xp||0, level:s.level||1};

  const beforeXP = Number(s.xp)||0;
  const beforeLv = Number(s.level)||1;

  s.xp = beforeXP + gain;

  // handle multi-levels
  const ups = Math.floor(s.xp / 100);
  if(ups > 0){
    s.level = beforeLv + ups;
    s.xp = s.xp % 100;
    s.gold = (Number(s.gold)||0) + 10*ups;   // 10g / level
    save(s);
    try{ confetti(); confetti(); confetti(); partyHorn(); }catch{}
    emit('level', {level:s.level, bonusGold:10*ups});
  }else{
    save(s);
  }

  emit('xp', {xp:s.xp, added:gain});
  hudTick();
  return {xp:s.xp, level:s.level||1};
}

/**
 * Semantic activity log. 
 * IMPORTANT: Progress + achievements are delegated to rewards.logProgress
 * so pages won’t double-award.
 */
export function logAction(kind, amount=1){
  const k = String(kind||'').trim();
  if(!k) return;

  const s = load();
  s.log ||= [];
  s.log.push({kind:k, t:Date.now(), n:Number(amount)||0});
  if(s.log.length > 500) s.log.splice(0, s.log.length-500);
  save(s);

  // Delegate all progress counting + auto-claim to rewards.js
  try{ logProgress(k, Number(amount)||1); }catch{}

  emit('action', {kind:k, n:amount});
}

/**
 * Kept for API compatibility but now a no-op so we don’t double-infer;
 * rewards.js already installs the click/change/keydown observers.
 */
export function installAutolog(){ /* no-op: rewards.js handles inference */ }

/**
 * Optional heartbeat; harmless if you still call it.
 */
export function ensureAutoClaim(){
  if(window.__nq_claim_timer) return;
  window.__nq_claim_timer = setInterval(()=>{ try{ logProgress('__tick', 0); }catch{} }, 3000);
}

// Expose a minimal console API (handy for debugging)
try{
  window.NQ = Object.assign(window.NQ||{}, { addGold, addXP, logAction });
}catch{}
