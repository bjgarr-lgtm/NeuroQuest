// pages/quests.patched.js — awards 2g main / 1g side+bonus and +10xp; saves via NQ
import { load, save } from '../util/storage.js';

function awardComplete(bucket, index){
  const s = load();
  const arr = s.quests?.[bucket] || [];
  if (index < 0 || index >= arr.length) return;
  arr.splice(index, 1);
  s.quests[bucket] = arr;

  if (bucket === 'main') { NQ.addGold(2); } else { NQ.addGold(1); }
  NQ.addXP(10);
  save(s); // broadcast change so HUD/pages update
}

export function wireQuestButtons(container=document){
  // expects buttons annotated: data-bucket="main|side|bonus" data-index="i"
  container.querySelectorAll('[data-quest-complete]')?.forEach(btn=>{
    btn.onclick = (e)=>{
      const bucket = btn.getAttribute('data-bucket')||'main';
      const index = parseInt(btn.getAttribute('data-index')||'-1',10);
      try{ awardComplete(bucket, index); }catch(_){}
    };
  });
}
