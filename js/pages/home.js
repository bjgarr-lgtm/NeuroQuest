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
    const img=document.createElement('img'); img.src=src||'assets/icon.svg'; img.alt=name||'Member';
    const cap=document.createElement('div'); cap.className='name'; cap.textContent=name||'Companion';
    d.appendChild(img); d.appendChild(cap); return d;
  }
  if(s.party?.hero?.src) row.appendChild(card(s.party.hero.src,'You'));
  (s.party?.companions||[]).forEach(c=> row.appendChild(card(c.src, c.name||'Companion')));

  // Breathe ring
  const ring = document.querySelector('.ring');
  const core = document.querySelector('.ring .core');
  const phase = document.getElementById('phase');
  let timer=null, step=0, running=false;
  const seq=[{t:4000,txt:'Inhale', scale:1.0},{t:2000,txt:'Hold',scale:1.0},{t:4000,txt:'Exhale',scale:0.6},{t:2000,txt:'Hold',scale:0.6}];

  core.style.transformOrigin='center center';
  core.style.transition='transform 4s linear';

  function tick(){
    const p=seq[step%seq.length];
    phase.textContent=p.txt;
    // adjust transition for holds vs breaths
    const next = seq[(step+1)%seq.length];
    core.style.transition = (p.txt==='Hold') ? 'transform 0s linear' :
                            (p.txt==='Inhale' || p.txt==='Exhale') ? `transform ${p.t/1000}s ease-in-out` : core.style.transition;
    core.style.transform = `scale(${p.scale})`;
    timer=setTimeout(()=>{ step++; tick(); }, p.t);
  }
  ring.onclick=()=>{
    if(running){ clearTimeout(timer); running=false; phase.textContent='Paused'; return; }
    running=true; step=0; tick();
  };

  // HUD update
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  const xpEl=document.getElementById('hudXp'); const lvl=document.getElementById('hudLevel');
  const xpInLevel=(s.xp||0)%100; xpEl.style.width=xpInLevel+'%'; lvl.textContent='Lv '+(s.level||1);
}
