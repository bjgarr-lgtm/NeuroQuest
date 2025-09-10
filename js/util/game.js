
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
  if(kind==='kindness' && s.progress[kind]>=3){ earn('kindness','🌈'); }
  if(kind==='sleep' && s.progress[kind]>=5){ earn('sleep-5','😴'); }
  if(kind==='meditate' && s.progress[kind]>=5){ earn('meditate-5','🧘'); }
  if(kind==='social' && s.progress[kind]>=2){ earn('social-2','💬'); }
  if(kind==='laundry' && s.progress[kind]>=1){ earn('laundry-week','🧺'); }
  if(kind==='dishes' && s.progress[kind]>=4){ earn('dish-streak','🍽️'); }
  if(kind==='inbox_zero' && s.progress[kind]>=1){ earn('inbox-zero','📬'); }
  if(kind==='garden' && s.progress[kind]>=3){ earn('garden','🪴'); }
  if(kind==='book' && s.progress[kind]>=1){ earn('book','📚'); }
  if(kind==='skill' && s.progress[kind]>=5){ earn('skill','🎯'); }
  if(kind==='pet_care' && s.progress[kind]>=7){ earn('pet-care','🐾'); }
  if(kind==='screen_down' && s.progress[kind]>=3){ earn('screen-down','📵'); }
  if(kind==='hydrate' && s.progress[kind]>=30){ earn('hydrate-30','💦'); }

  save(s);
}


export function installAutolog(){
  const MAP=[
    ['hydrate','hydrate'],['water','hydrate'],
    ['walk','walk'],['run','walk'],
    ['cook','cook'],['meal','cook'],
    ['journal','journal_entry'],['save entry','journal_entry'],
    ['budget','budget_setup'],['income','budget_setup'],
    ['kind','kindness'],['kindness','kindness'],
    ['sleep','sleep'],['meditate','meditate'],
    ['social','social'],['laundry','laundry'],['dishes','dishes'],
    ['inbox','inbox_zero'],['garden','garden'],['plant','garden'],
    ['book','book'],['skill','skill'],['pet','pet_care'],
    ['screen','screen_down']
  ];
  document.addEventListener('click', (e)=>{
    try{
      const t=e.target.closest('button, a, .btn, .primary, .secondary, .danger, [role="button"]');
      if(!t) return;
      const txt=(t.innerText||t.textContent||'').toLowerCase();
      for(const [k,kind] of MAP){
        if(txt.includes(k)){ logAction(kind,1); break; }
      }
    }catch(_){}
  }, {capture:true});
}

export function ensureAutoClaim(){
  setInterval(()=>{ try{ logAction('__tick',0); }catch(_){ } }, 2500);
}
