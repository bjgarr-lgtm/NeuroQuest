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

  const row=document.getElementById('partyRow');
  function heroCard(imgSrc, name){
    const d=document.createElement('div'); d.className='hero';
    const img=document.createElement('img'); img.src=imgSrc||'assets/icon.svg'; img.alt=name;
    const cap=document.createElement('div'); cap.className='name'; cap.textContent=name;
    d.appendChild(img); d.appendChild(cap); return d;
  }
  if(s.party.hero) row.appendChild(heroCard(s.party.hero.src, 'You'));
  (s.party.companions||[]).forEach(c=> row.appendChild(heroCard(c.src, c.name||'Companion')));

  // Breathe logic (simple phase timer)
  const ring=document.querySelector('.ring');
  const phase=document.getElementById('phase');
  let timer=null, step=0, running=false;
  const seq=[{t:4000,txt:'Inhale'}, {t:2000,txt:'Hold'}, {t:4000,txt:'Exhale'}, {t:2000,txt:'Hold'}];
  function tick(){
    const p=seq[step%seq.length]; phase.textContent=p.txt;
    timer=setTimeout(()=>{ step++; tick(); }, p.t);
  }
  ring.onclick=()=>{ if(running){ clearTimeout(timer); running=false; phase.textContent='Paused'; return; } running=true; tick(); };

  // HUD update
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  const xpEl=document.getElementById('hudXp'); const lvl=document.getElementById('hudLevel');
  const xpInLevel=(s.xp||0)%100; xpEl.style.width=xpInLevel+'%'; lvl.textContent='Lv '+(s.level||1);
}
