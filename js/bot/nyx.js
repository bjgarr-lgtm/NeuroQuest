// NYX Assistant — syntaxfix2
console.log('[NYX] build syntaxfix2 loaded');
import { load, save } from '../util/storage.js';
import { nyxAskLLM } from './nyx-llm.js';
import { Actions } from './nyx-actions.js';
import { planActionsFromText } from './nyx-planner.js';

const VOICE_NAME = 'Google US English';

class Nyx {
  constructor(){
    this.name = 'NYX';
    this.version = '1.0.2';
    this.voice = null;
    this.state = load();
    window.NQ = window.NQ || {};
    window.NQ.track = this.track.bind(this);
    window.NQ.ask = (q)=>this.reply(q);
    window.NQ.nyx = this;
  }

  init(){
    this.mountUI();
    this.wireAutoHooks();
    this.speak("hey, i'm nyx. i'll track your wins and keep the gold flowing.");
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
    const panel = document.createElement('div');
    panel.id='nyx-panel';
    panel.innerHTML = [
      '<div id="nyx-head">',
      '  <div id="nyx-title"><b>NYX</b><br/><small>quest sprite & economy keeper</small></div>',
      '</div>',
      '<div id="nyx-body"></div>',
      '<div id="nyx-input">',
      '  <input id="nyx-text" placeholder="ask for help, type /tips, /stats, /quests"/>',
      '  <button id="nyx-send">send</button>',
      '</div>'
    ].join('');
    document.body.appendChild(panel);

    // behavior
    btn.addEventListener('click', ()=>{
      panel.style.display = panel.style.display==='block' ? 'none' : 'block';
      if(panel.style.display==='block'){ this.pushBot("what's up? need a nudge, a quest, or a hug?"); }
    });
    panel.querySelector('#nyx-send')?.addEventListener('click', ()=>this.onSend());
    panel.querySelector('#nyx-text')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') this.onSend(); });
  }

  speak(text){
    try{
      if(!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(String(text||''));
      const voices = window.speechSynthesis.getVoices();
      const pick = voices.find(v=>v.name.includes('English')) || voices[0];
      if(pick) u.voice = pick;
      window.speechSynthesis.speak(u);
    }catch(_){}
  }

  pushBot(text){
    const box = document.getElementById('nyx-body'); if(!box) return;
    const div = document.createElement('div'); div.className='nyx-msg nyx-bot'; div.textContent=String(text||'');
    box.appendChild(div); box.scrollTop = box.scrollHeight;
  }
  pushUser(text){
    const box = document.getElementById('nyx-body'); if(!box) return;
    const div = document.createElement('div'); div.className='nyx-msg nyx-user'; div.textContent=String(text||'');
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
    const lc = (q||'').toLowerCase();

    // commands
    if(lc.startsWith('/stats')){
      const msg = `lvl ${s.level||1} • xp ${s.xp||0} • gold ${s.gold||0} • streak ${s.streak||0}`;
      this.pushBot(msg); this.speak(msg); return msg;
    }
    if(lc.startsWith('/tips')){
      const tips = [
        'tiny quests > huge promises. pick a 5-minute win.',
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
    if(lc.startsWith('/llm off')){ this._llmOff = true; const m='llm disabled; using local hints only.'; this.pushBot(m); return m; }
    if(lc.startsWith('/llm on')){ this._llmOff = false; const m='llm enabled.'; this.pushBot(m); return m; }
    if(lc.startsWith('/llm test')){
      const ep = localStorage.getItem('nyx_llm_endpoint') || window.NYX_LLM_ENDPOINT || '';
      if(!ep){ const m='no endpoint set. run: localStorage.setItem("nyx_llm_endpoint","https://<worker>.workers.dev")'; this.pushBot(m); return m; }
      this.pushBot('pinging llm…');
      return fetch(ep, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages:[{role:'user', content:'ping'}] })
      }).then(r=>r.json()).then(j=>{
        if(j && j.text){ const m='llm ok • reply: '+String(j.text).slice(0,60)+'…'; this.pushBot(m); return m; }
        const m='llm replied but no text field: '+JSON.stringify(j).slice(0,80); this.pushBot(m); return m;
      }).catch(e=>{
        const m='llm error: '+e; this.pushBot(m); return m;
      });
    }
    if(lc.startsWith('/help') || lc.includes('help')){
        const msg = 'commands: /stats /tips /quests /llm on|off /llm test /run <json> /undo /actions';
        this.pushBot(msg); return msg;
      }
      if(lc.startsWith('/actions')){ const m = 'available: '+Actions.list().join(', '); this.pushBot(m); return m; }
      if(lc.startsWith('/undo')){ const ok = await Actions.undoLast(); const m = ok?'undid last change.':'nothing to undo.'; this.pushBot(m); return m; }
      if(lc.startsWith('/run ')){
        try{ const plan = JSON.parse(q.slice(5)); const res = await Actions.runMany(plan.steps||[]); const m='ok • '+res.length+' step(s)'; this.pushBot(m); return m; }
        catch(e){ const m='bad json: '+e; this.pushBot(m); return m; }
      }

    // LLM fallback (or local supportive)
    const planTry = await planActionsFromText(q);
    if(planTry.steps && planTry.steps.length){
      if(planTry.confirm){ this.pushBot('i can run '+planTry.steps.length+' change(s). say "/run {\"steps\":[...]}" to confirm, or type /undo after.'); return 'pending'; }
      const res = await Actions.runMany(planTry.steps);
      const m = 'done • '+res.length+' change(s)'; this.pushBot(m); return m;
    }

    const sys = [
      'You are NYX, a supportive ADHD-friendly guide inside the NeuroQuest app.',
      'Tone: warm, brief, non-judgmental, practical; prefer bullet points and a single tiny next step.',
      `Player: level ${s.level||1}, xp ${s.xp||0}, gold ${s.gold||0}, streak ${s.streak||0}.`,
      'If the user asks for app help, reference in-app features (quests, journal, breathe ring). Keep replies under 100 words.'
    ].join(' ');

    if(this._llmOff){
      const msg = 'llm is off. try /llm on to enable, or ask me for /tips.';
      this.pushBot(msg); return msg;
    }

    const box = document.getElementById('nyx-body');
    const stub = document.createElement('div'); stub.className='nyx-msg nyx-bot'; stub.textContent='typing…';
    if(box){ box.appendChild(stub); box.scrollTop = box.scrollHeight; }

    return nyxAskLLM(q, { system: sys }).then(text=>{
      const t = String(text||'').trim() || '(no reply)';
      if(box && stub){ stub.textContent = t; } else { this.pushBot(t); }
      this.speak(t);
      return t;
    }).catch(err=>{
      const m = 'connection hiccup—try /tips or ask again in a sec.';
      if(box && stub){ stub.textContent = m; } else { this.pushBot(m); }
      console.error('[NYX LLM]', err);
      return m;
    });
  }

  // ECONOMY
  grant(xp=5, gold=1, reason=''){
    const s = this.state = load();
    s.xp = (s.xp||0) + Number(xp||0);
    s.gold = (s.gold||0) + Number(gold||0);
    save(s);
    this.pushBot(`+${Number(xp||0)}xp +${Number(gold||0)}g ${reason?('— '+reason):''}`);
    this.sparkCelebrate();
  }
  sparkCelebrate(){ document.dispatchEvent(new CustomEvent('nq:reward')); }

  track(event, payload={}){
    const e = String(event||'').toLowerCase();
    const d = payload || {};
    if(e==='quest:complete'){
      const tier = d.tier || d.type || 'main';
      const bonus = tier==='main'? {xp:30,gold:8} : tier==='side'? {xp:15,gold:4} : {xp:8,gold:2};
      this.grant(bonus.xp, bonus.gold, `quest complete: ${d.title||d.id||tier}`); return;
    }
    if(e==='journal:entry'){ this.grant(6,2,'journaled'); return; }
    if(e==='hydrate:log'){ this.grant(2,1,'hydrated'); return; }
    if(e==='breathe:ring'){ this.grant(3,1,'breathing done'); return; }
    if(e==='streak:day'){ this.grant(12,4,'daily streak'); return; }
    const xp = Number(d.xp||3), gold = Number(d.gold||1);
    this.grant(xp, gold, d.reason||e);
  }

  wireAutoHooks(){
    document.addEventListener('nq:quest-complete', (ev)=>{ const dt = ev.detail||{}; this.track('quest:complete', dt); });
    document.addEventListener('nq:journal-saved', ()=>this.track('journal:entry',{}));
    document.addEventListener('nq:hydrate',      ()=>this.track('hydrate:log',{}));
    document.addEventListener('nq:breathe',      ()=>this.track('breathe:ring',{}));
    document.addEventListener('nq:levelup',      ()=>{ this.pushBot('level up! +10 gold bonus. keep rolling.'); this.speak('level up'); });

    // attribute-based auto-claim
    document.body.addEventListener('click', (e)=>{
      const el = e.target.closest('[data-quest-complete],[data-journal-save],[data-hydrate]');
      if(!el) return;
      if(el.hasAttribute('data-quest-complete')) this.track('quest:complete', { title: el.getAttribute('data-quest-complete') });
      if(el.hasAttribute('data-journal-save'))   this.track('journal:entry', {});
      if(el.hasAttribute('data-hydrate'))        this.track('hydrate:log', {});
    });

    // checkbox auto-claim
    const mo = new MutationObserver((muts)=>{
      muts.forEach(m=>{
        m.addedNodes && m.addedNodes.forEach(node=>{
          if(node && node.querySelectorAll){
            node.querySelectorAll('input[type="checkbox"][data-quest-id]').forEach(cb=>{
              if(cb._nyx) return; cb._nyx=true;
              cb.addEventListener('change', ()=>{ if(cb.checked){ this.track('quest:complete', { id: cb.getAttribute('data-quest-id') }); } });
            });
          }
        });
      });
    });
    mo.observe(document.body, {childList:true, subtree:true});
  }
}

(function bootstrap(){
  if(window.__nyx_bootstrapped) return; window.__nyx_bootstrapped=true;
  const nyx = new Nyx();
  window.addEventListener('DOMContentLoaded', ()=> nyx.init());
})();
