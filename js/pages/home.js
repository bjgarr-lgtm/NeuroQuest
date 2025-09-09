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
    const frame=document.createElement('div');
    frame.style.width='360px'; frame.style.height='460px'; frame.style.borderRadius='12px';
    frame.style.overflow='hidden'; frame.style.display='inline-flex';
    frame.style.alignItems='center'; frame.style.justifyContent='center';
    frame.style.background='rgba(255,255,255,0.04)';
    const img=new Image(); img.src=src||'assets/icon.svg'; img.alt=name||'Member';
    img.style.width='100%'; img.style.height='100%'; img.style.objectFit='contain';
    frame.appendChild(img);
    const cap=document.createElement('div'); cap.className='name'; cap.textContent=name||'Companion';
    d.appendChild(frame); d.appendChild(cap); return d;
  }
  if(s.party?.hero?.src) row.appendChild(card(s.party.hero.src,'You'));
  (s.party?.companions||[]).forEach(c=> row.appendChild(card(c.src, c.name||'Companion')));

  // Breathe ring
  const ring = document.querySelector('.ring');
  const phase = document.getElementById('phase');

  // Build an SVG progress ring inside .ring
  ring.innerHTML = `<svg viewBox="0 0 100 100" width="180" height="180" style="display:block;margin:auto">
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"></circle>
    <circle id="progArc" cx="50" cy="50" r="46" fill="none" stroke="white" stroke-linecap="round" stroke-width="6" transform="rotate(-90 50 50)" stroke-dasharray="289" stroke-dashoffset="289"></circle>
  </svg>
  <div class="core" style="position:absolute;inset:0;margin:auto;width:120px;height:120px;border-radius:999px;background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), rgba(255,255,255,0) 70%);"></div>`;
  ring.style.position='relative';
  ring.style.width='180px'; ring.style.height='180px';

  const arc = document.getElementById('progArc');
  let timer=null, raf=null, running=false, step=0, startT=0;
  const CIRC = 2*Math.PI*46; // dasharray length
  const seq=[{t:4000,txt:'Inhale', scale:1.0},
             {t:2000,txt:'Hold',  scale:1.0},
             {t:4000,txt:'Exhale', scale:0.6},
             {t:2000,txt:'Hold',  scale:0.6}];

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
    raf = requestAnimationFrame(loop);
  }

  function tick(){ animatePhase(); }

  ring.onclick=()=>{ if(running){ running=false; cancelAnimationFrame(raf); clearTimeout(timer); phase.textContent='Paused'; return; } running=true; step=0; tick(); };

  // HUD update
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  const xpEl=document.getElementById('hudXp'); const lvl=document.getElementById('hudLevel');
  const xpInLevel=(s.xp||0)%100; xpEl.style.width=xpInLevel+'%'; lvl.textContent='Lv '+(s.level||1);
}
