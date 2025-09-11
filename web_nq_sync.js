/*! web_nq_sync.js — one-liner save for both the planner and the Godot build */
window.NQ = window.NQ || {};

(function(NQ){
  const KEY = 'nq_state';
  const VERSION = 1;

  function normalize(s){
    // make sure all major buckets exist so Godot never chokes
    s = s || {};
    s.version = s.version || VERSION;
    s.gold = s.gold|0; s.xp = s.xp|0; s.level = s.level||1;
    s.quests = s.quests || { main:[], side:[], bonus:[] };
    s.quests.main = s.quests.main||[]; s.quests.side = s.quests.side||[]; s.quests.bonus = s.quests.bonus||[];
    s.journal = s.journal || { entries:[], moods:[] };
    s.life = s.life || { meals:{ byDay:{} }, grocery:[], budget:[] };
    s.settings = s.settings || { theme:'forest', font:'main', displayName:'Adventurer', music:{ library:[], currentUrl:'' } };
    s.ach = s.ach || {}; s.tokens = s.tokens || [];
    return s;
  }

  function broadcast(s){
    try{
      const ev = new CustomEvent('nq:state-changed', { detail: s });
      window.dispatchEvent(ev);
      // also trigger 'storage' for other tabs / Godot webview listeners
      window.NQ.commit(s);(KEY, JSON.stringify(s));
    }catch(_){}
  }

  NQ.get = function(){
    try{ return normalize(JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){ return normalize({}); }
  };

  NQ.commit = function(next){
    const s = normalize(next);
    NQ.commit(s);(KEY, JSON.stringify(s));
    broadcast(s);
    return s;
  };

  // helpers you can call from anywhere in the app:
  NQ.addGold = function(n){ const s=NQ.get(); s.gold = (s.gold|0)+ (n|0); return NQ.commit(s); };
  NQ.addXP = function(n){ const s=NQ.get(); s.xp = (s.xp|0)+ (n|0); return NQ.commit(s); };
  NQ.pushJournal = function(text, mood='', note=''){ const s=NQ.get(); s.journal.entries.push({ts:new Date().toISOString(), text, mood, note}); return NQ.commit(s); };
  NQ.pushMood = function(mood, note=''){ const s=NQ.get(); s.journal.moods.push({ts:new Date().toISOString(), mood, note}); return NQ.commit(s); };
  NQ.toggleGrocery = function(name, checked){ const s=NQ.get(); const it=(s.life.grocery.find(g=>g.name===name)||{name}); it.checked=!!checked; if(!s.life.grocery.find(g=>g.name===name)) s.life.grocery.push(it); return NQ.commit(s); };
  NQ.addBudget = function(label, amount){ const s=NQ.get(); s.life.budget.push({label, amount, ts:new Date().toISOString()}); return NQ.commit(s); };

})(window.NQ);