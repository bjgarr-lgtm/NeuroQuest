import {load, save} from '../util/storage.js';
import {confetti} from '../ui/fx.js';

export default function renderHome(root){
  const s=load();
  root.innerHTML = `
    <section class="party-banner">
      <div class="party-title">Your Party</div>
      <div class="party" id="partyRow"></div>
    </section>
    <section class="grid two">
      <div class="panel breathe">
        <div class="ring"><div class="core"></div></div>
        <div id="phase">Tap the ring</div>
      </div>
      <div class="panel card">
        <h3>Rewards</h3>
        <div id="rew">Complete quests to unlock!</div>
      </div>
    </section>
  `;

  // Party render
  const row=document.getElementById('partyRow');
  function card(src, name){
    const d=document.createElement('div'); d.className='hero';
    const frame=document.createElement('div'); frame.style.width='360px'; frame.style.height='460px'; frame.style.borderRadius='12px'; frame.style.overflow='hidden';
    const img=new Image(); img.src=src||'assets/neuroquest-shield.svg'; img.alt=name||'Member'; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='contain';
    frame.appendChild(img);
    const cap=document.createElement('div'); cap.className='name'; cap.textContent=name||'Companion';
    d.appendChild(frame); d.appendChild(cap); return d;
  }
  if(s.party?.hero?.src) row.appendChild(card(s.party.hero.src,'You'));
  (s.party?.companions||[]).forEach(c=> row.appendChild(card(c.src, c.name||'Companion')));

  
  // Rewards list (first 5 shown; more unlock later)
  const REWARDS_DEF = [
    {id:'first-quest', name:'Finish your first quest', token:'⭐'},
    {id:'streak-3', name:'Maintain a 3‑day streak', token:'🔥'},
    {id:'level-2', name:'Reach Level 2', token:'🛡️'},
    {id:'deep-clean', name:'Complete a Deep Clean raid', token:'🧽'},
    {id:'journal-3', name:'Journal 3 days this week', token:'📔'},
    // extra ideas (unlock after initial five)
    {id:'hydrate-7', name:'Log hydration 7 days', token:'💧'},
    {id:'walk-5', name:'Take 5 walks', token:'👟'},
    {id:'cook-3', name:'Cook 3 meals at home', token:'🍳'},
    {id:'budget-setup', name:'Set up a monthly budget', token:'💰'},
    {id:'sleep-5', name:'Sleep 8h five nights', token:'😴'},
    {id:'meditate-5', name:'Meditate 5 sessions', token:'🧘'},
    {id:'social-2', name:'Plan 2 social check‑ins', token:'💬'},
    {id:'laundry-week', name:'Finish all laundry this week', token:'🧺'},
    {id:'dish-streak', name:'No sink pile for 4 days', token:'🍽️'},
    {id:'inbox-zero', name:'Hit inbox zero once', token:'📬'},
    {id:'garden', name:'Tend plants 3 days', token:'🪴'},
    {id:'book', name:'Finish a book', token:'📚'},
    {id:'skill', name:'Practice a skill 5 times', token:'🎯'},
    {id:'pet-care', name:'Pet care routine 7 days', token:'🐾'},
    {id:'kindness', name:'Do 3 kindness quests', token:'🌈'},
    {id:'coach', name:'Complete a Coach chat week', token:'🗣️'},
    {id:'screen-down', name:'3 nights screen‑free hour', token:'📵'},
    {id:'hydrate-30', name:'Hydration streak 30 days', token:'💦'},
    {id:'level-5', name:'Reach Level 5', token:'🏆'}
  ];
  // State ensure
  if(!s.tokens) s.tokens=[];
  if(!s.ach) s.ach={};
  const rewHost = document.getElementById('rew');
  function renderRewards(){
    rewHost.innerHTML='';
    const earned = new Set(Object.keys(s.ach).filter(k=>s.ach[k]));
    const avail = REWARDS_DEF.filter(r=>!earned.has(r.id));
    const toShow = avail.slice(0,5);
    if(toShow.length===0){ rewHost.textContent='All clear! More rewards unlocked as you play.'; return; }
    toShow.forEach(r=>{
      const row = document.createElement('div'); row.className='reward-row';
      row.innerHTML = `<span class="tok">${r.token}</span> <span class="nm">${r.name}</span>`;
      const btn = document.createElement('button'); btn.className='secondary'; btn.textContent='Claim';
      btn.onclick=()=>{
        s.ach[r.id]=true; s.tokens.push(r.token); save(s);
        if(window.NQ_updateHud) window.NQ_updateHud();
        row.classList.add('done'); btn.remove();
      };
      row.appendChild(btn); rewHost.appendChild(row);
    });
  }
  renderRewards();
// Breathe ring
  const ring = document.querySelector('.ring');
  const phase = document.getElementById('phase');

  // Build an SVG progress ring inside .ring
  ring.innerHTML = `<svg viewBox="0 0 100 100" width="180" height="180" style="display:block;margin:auto">
    <g id="scaleGroup" transform="scale(1)" transform-origin="50 50">
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"></circle>
      <circle id="progArc" cx="50" cy="50" r="46" fill="none" stroke="white" stroke-linecap="round" stroke-width="6" transform="rotate(-90 50 50)" stroke-dasharray="289" stroke-dashoffset="289"></circle>
    </g>
  </svg>
  <div class="core" style="position:absolute;inset:0;margin:auto;width:120px;height:120px;border-radius:999px;background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), rgba(255,255,255,0) 70%);"></div>`;
  ring.style.position='relative';
  ring.style.width='180px'; ring.style.height='180px';

  const arc = document.getElementById('progArc');
  let timer=null, raf=null, running=false, step=0, startT=0;
  const CIRC = 2*Math.PI*46; // dasharray length
  const seq=[{t:4000,txt:'Inhale', scale:1.0, ring:1.08},
             {t:2000,txt:'Hold',  scale:1.0, ring:1.08},
             {t:4000,txt:'Exhale', scale:0.6, ring:0.92},
             {t:2000,txt:'Hold',  scale:0.6, ring:0.92}];

  function animatePhase(){
    const p=seq[step%seq.length];
    phase.textContent=p.txt;
    const dur=p.t;
    const from = (p.txt==='Exhale'||p.txt==='Hold'&&seq[(step-1+seq.length)%seq.length].txt==='Exhale') ? 0 : CIRC;
    const to   = (p.txt==='Inhale')?0 : CIRC;
    const t0 = performance.now();
    cancelAnimationFrame(raf);
    function loop(now){
      const el = Math.min(1, (now - t0)/dur);
      // linear easing for progress arc
      const offset = from + (to-from)*el;
      arc.setAttribute('stroke-dashoffset', String(offset));
      raf = requestAnimationFrame(loop);
      if(el>=1){ cancelAnimationFrame(raf); step++; tick(); }
    }
    // scale the core smoothly
    const core = ring.querySelector('.core');
    core.style.transition = `transform ${dur/1000}s ease-in-out`;
    core.style.transform = `scale(${p.scale})`;
    const sg = ring.querySelector('#scaleGroup');
    if(sg){ sg.setAttribute('style', `transition: transform ${dur/1000}s ease-in-out; transform-origin:50px 50px; transform: scale(${p.ring})`); }
    raf = requestAnimationFrame(loop);
  }

  function tick(){ animatePhase(); }

  ring.onclick=()=>{ if(running){ running=false; cancelAnimationFrame(raf); clearTimeout(timer); phase.textContent='Paused'; return; } running=true; step=0; tick(); };

  // HUD update
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  const xpEl=document.getElementById('hudXp'); const lvl=document.getElementById('hudLevel');
  const xpInLevel=(s.xp||0)%100; xpEl.style.width=xpInLevel+'%'; lvl.textContent='Lv '+(s.level||1);
}
