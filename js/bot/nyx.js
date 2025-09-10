
import {load, save} from '../util/storage.js';

const VOICE_NAME = 'Google US English';

/** Global tracker + assistant **/
class Nyx {
  constructor(){
    this.name = 'NYX';
    this.version = '1.0';
    this.voice = null;
    this.ctx = new (window.AudioContext || window.webkitAudioContext || function(){})();
    this.state = load();
    window.NQ = window.NQ || {};
    window.NQ.track = this.track.bind(this);
    window.NQ.ask = (q)=>this.reply(q);
    window.NQ.nyx = this;
  }
  init(){
    this.mountUI();
    this.wireAutoHooks();
    this.speak('hey, i\'m nyx. i\'ll track your wins and keep the gold flowing.');
    console.log('[NYX] initialized');
  }
  mountUI(){
    // css
    const link = document.createElement('link');
    link.rel='stylesheet'; link.href='js/bot/nyx.css'; document.head.appendChild(link);

    // launcher
    const btn = document.createElement('button');
    btn.id='nyx-launcher'; btn.textContent='✦ chat';
    document.body.appendChild(btn);

    // panel
    const panel = document.createElement("div");
    panel.id='nyx-panel';
    panel.innerHTML = `
      <div id="nyx-head">
        <img src="assets/neuroquest-shield.svg" alt="nyx"/>
        <div id="nyx-title"><b>NYX</b><br/><small>quest sprite & economy keeper</small></div>
      </div>
      <div id="nyx-body"></div>
      <div id="nyx-input">
        <input id="nyx-text" placeholder="ask for help, type /tips, /stats, /quests"/>
        <button id="nyx-send">send</button>
      </div>`;
    document.body.appendChild(panel);

    // behavior
    btn.addEventListener('click', ()=>{
      panel.style.display = panel.style.display==='block' ? 'none' : 'block';
      if(panel.style.display==='block'){ this.pushBot('what\'s up? need a nudge, a quest, or a hug?'); }
    });
    panel.querySelector('#nyx-send').addEventListener('click', ()=>this.onSend());
    panel.querySelector('#nyx-text').addEventListener('keydown', e=>{
      if(e.key==='Enter') this.onSend();
    });
  }
  speak(text){
    try{
      if(!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      const pick = window.speechSynthesis.getVoices().find(v=>v.name.includes('English')) || window.speechSynthesis.getVoices()[0];
      if(pick) u.voice = pick;
      window.speechSynthesis.speak(u);
    }catch(e){/*no-op*/}
  }
  pushBot(text){
    const box = document.getElementById('nyx-body'); if(!box) return;
    const div = document.createElement('div'); div.className='nyx-msg nyx-bot'; div.textContent=text;
    box.appendChild(div); box.scrollTop = box.scrollHeight;
  }
  pushUser(text){
    const box = document.getElementById('nyx-body'); if(!box) return;
    const div = document.createElement('div'); div.className='nyx-msg nyx-user'; div.textContent=text;
    box.appendChild(div); box.scrollTop = box.scrollHeight;
  }
  onSend(){
    const input = document.getElementById('nyx-text'); if(!input) return;
    const q = input.value.trim(); if(!q) return;
    input.value=''; this.pushUser(q);
    this.reply(q);
  }
  reply(q){
    const s = this.state = load();
    const lc = q.toLowerCase();
    if(lc.startsWith('/stats')){
      const msg = `lvl ${s.level||1} • xp ${s.xp||0} • gold ${s.gold||0} • streak ${s.streak||0}`;
      this.pushBot(msg); this.speak(msg); return msg;
    }
    if(lc.startsWith('/tips')){
      const tips = [
        'tiny quests > huge promises. pick a 5‑minute win.',
        'hydrate, move, breathe. i’ll track and reward it.',
        'open your journal and vent. you\'ll get xp for honesty.'
      ];
      const t = tips[Math.floor(Math.random()*tips.length)];
      this.pushBot(t); this.speak(t); return t;
    }
    if(lc.startsWith('/quests')){
      const main = (s.quests?.main||[]).map(q=>q.title||q.name||'quest').slice(0,3).join(' • ') || 'none yet'; 
      const msg = 'top quests: ' + main;
      this.pushBot(msg); return msg;
    }
    if(lc.startsWith('/help') || lc.includes('help')){
      const msg = 'try /stats /tips /quests. ask me to add a micro‑quest like “drink water” or “3min stretch”.';
      this.pushBot(msg); return msg;
    }
    // fallback supportive
    const msg = 'i\'m here. what\'s one small action we can do in the next 2 minutes? i\'ll turn it into a quest and reward you.';
    this.pushBot(msg); return msg;
  }

  // ECONOMY
  grant(xp=5, gold=1, reason=''){
    const s = this.state = load();
    s.xp = (s.xp||0) + xp;
    s.gold = (s.gold||0) + gold;
    save(s);
    this.pushBot(`+${xp}xp +${gold}g ${reason?('— '+reason):''}`);
    this.sparkCelebrate();
  }
  sparkCelebrate(){
    document.dispatchEvent(new CustomEvent('nq:reward'));
  }

  // TRACKER: unified events
  track(event, payload={}){
    const e = (event||'').toLowerCase();
    if(e==='quest:complete'){
      const tier = payload.tier || payload.type || 'main';
      const bonus = tier==='main'? {xp:30,gold:8} : tier==='side'? {xp:15,gold:4} : {xp:8,gold:2};
      this.grant(bonus.xp, bonus.gold, `quest complete: ${payload.title||payload.id||tier}`);
      return;
    }
    if(e==='journal:entry'){
      this.grant(6,2,'journaled');
      return;
    }
    if(e==='hydrate:log'){ this.grant(2,1,'hydrated'); return; }
    if(e==='breathe:ring'){ this.grant(3,1,'breathing done'); return; }
    if(e==='streak:day'){ this.grant(12,4,'daily streak'); return; }

    // generic fallback
    const xp = Number(payload.xp||3), gold = Number(payload.gold||1);
    this.grant(xp,gold, payload.reason||e);
  }

  // AUTO HOOKS: try to listen to app
  wireAutoHooks(){
    // listen to custom app events if they exist
    document.addEventListener('nq:quest-complete', (ev)=>{
      const d = ev.detail || {}; this.track('quest:complete', d);
    });
    document.addEventListener('nq:journal-saved', ()=>this.track('journal:entry',{}));
    document.addEventListener('nq:hydrate', ()=>this.track('hydrate:log',{}));
    document.addEventListener('nq:breathe', ()=>this.track('breathe:ring',{}));
    document.addEventListener('nq:levelup', ()=>{ this.pushBot('level up! +10 gold bonus. keep rolling.'); this.speak('level up'); });

    // auto-claim buttons by attribute hints
    document.body.addEventListener('click', (e)=>{
      const el = e.target.closest('[data-quest-complete],[data-journal-save],[data-hydrate]');
      if(!el) return;
      if(el.hasAttribute('data-quest-complete')) this.track('quest:complete', {title: el.getAttribute('data-quest-complete')});
      if(el.hasAttribute('data-journal-save')) this.track('journal:entry', {});
      if(el.hasAttribute('data-hydrate')) this.track('hydrate:log', {});
    });

    // observe DOM for quest lists; clicking checkboxes rewards
    const mo = new MutationObserver((muts)=>{
      muts.forEach(m=>{
        m.addedNodes && m.addedNodes.forEach(node=>{
          if(node.querySelectorAll){
            node.querySelectorAll('input[type="checkbox"][data-quest-id]').forEach(cb=>{
              if(cb._nyx) return; cb._nyx=true;
              cb.addEventListener('change', ()=>{
                if(cb.checked){ this.track('quest:complete', { id: cb.getAttribute('data-quest-id') }); }
              });
            });
          }
        });
      });
    });
    mo.observe(document.body, {childList:true, subtree:true});
  }
}

(function bootstrap(){
  const nyx = new Nyx();
  // Wait a tick so app pages mount first
  window.addEventListener('DOMContentLoaded', ()=> nyx.init());
  setTimeout(()=>nyx.init(), 400);
})();
