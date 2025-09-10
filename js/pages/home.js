
import {load, save} from '../util/storage.js';
import {confetti} from '../ui/fx.js';
import {addGold, logAction} from '../util/game.js';

export default function renderHome(root){
  const s=load();

  root.innerHTML = `
    <section class="party-banner">
      <div class="party-title">Your Party</div>
      <div class="party" id="partyRow"></div>
    </section>

    <section class="home-breath">
      <div class="panel breathe">
        <div class="ring" id="breathRing">
          <svg viewBox="0 0 100 100" width="200" height="200" style="display:block;margin:auto;overflow:visible">
            <g id="scaleGroup" transform-origin="50 50">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"></circle>
              <circle id="progArc" cx="50" cy="50" r="46" fill="none" stroke="#89f" stroke-width="6"
                stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="289"></circle>
            </g>
          </svg>
          <div class="core"></div>
        </div>
        <div id="phase">Tap the ring</div>
      </div>
      <div class="panel">
        <h3>Rewards</h3>
        <div id="rew"></div>
      </div>
    </section>
  `;

  // Rewards rendering (list first five available)
  const REWARDS_DEF = [
    {id:'first-quest', name:'Finish your first quest', token:'⭐'},
    {id:'streak-3', name:'Maintain a 3‑day streak', token:'🔥'},
    {id:'level-2', name:'Reach Level 2', token:'🛡️'},
    {id:'deep-clean', name:'Complete a Deep Clean raid', token:'🧽'},
    {id:'journal-3', name:'Journal 3 days this week', token:'📔'},
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
  if(!s.tokens) s.tokens=[];
  if(!s.ach) s.ach={};
  const rewHost = document.getElementById('rew');
  function renderRewards(){
    rewHost.innerHTML='';
    const earned = new Set(Object.keys(s.ach).filter(k=>s.ach[k]));
    const avail = REWARDS_DEF.filter(r=>!earned.has(r.id));
    const toShow = avail.slice(0,5);
    if(toShow.length===0){ rewHost.textContent='All clear! More rewards unlock as you play.'; return; }
    toShow.forEach(r=>{
      const row = document.createElement('div'); row.className='reward-row';
      row.innerHTML = `<span class="tok">${r.token}</span> <span class="nm">${r.name}</span>`;
      rewHost.appendChild(row);
    });
  }
  renderRewards();

  // ===== Breathe session =====
  const ringEl = document.getElementById('breathRing');
  const phase = document.getElementById('phase');
  const progArc = ringEl.querySelector('#progArc');
  const scaleGroup = ringEl.querySelector('#scaleGroup');
  const core = ringEl.querySelector('.core');

  const seq=[
    {t:4000,txt:'Inhale', coreScale:1.12, ringScale:1.18},
    {t:2000,txt:'Hold',   coreScale:1.12, ringScale:1.18},
    {t:4000,txt:'Exhale', coreScale:0.52, ringScale:0.82},
    {t:2000,txt:'Hold',   coreScale:0.52, ringScale:0.82},
  ];

  let running=false, step=0, rounds=0, timeoutId=null;

  function playStep(){
    const p = seq[step];
    const dur = p.t;
    phase.textContent = p.txt;
    // animate arc
    progArc.style.transition = `stroke-dashoffset ${dur/1000}s linear`;
    const dashTotal = 2*Math.PI*46;
    if(p.txt==='Inhale' || p.txt==='Exhale'){
      progArc.style.strokeDashoffset = (p.txt==='Inhale') ? 0 : dashTotal;
    }
    // scale both core & ring
    core.style.transition = `transform ${dur/1000}s ease-in-out`;
    core.style.transform = `scale(${p.coreScale})`;
    scaleGroup.style.transition = `transform ${dur/1000}s ease-in-out`;
    scaleGroup.setAttribute('transform', `scale(${p.ringScale})`);

    timeoutId = setTimeout(()=>{
      // step finished
      step = (step + 1) % seq.length;
      if(step===0){ // completed one full cycle
        rounds += 1;
        if(rounds>=3){
          running=false;
          phase.textContent='Nice work!';
          try{ logAction('breath_session'); }catch(e){}
          try{ addGold(1); }catch(e){}
          try{ confetti(); }catch(e){}
          return;
        }
      }
      if(running) playStep();
    }, dur);
  }

  ringEl.onclick = ()=>{
    if(running){
      running=false;
      clearTimeout(timeoutId);
      phase.textContent='Paused';
      return;
    }
    // start fresh
    running=true; step=0; rounds=0;
    // reset arc
    const dashTotal = 2*Math.PI*46; progArc.style.strokeDasharray = String(dashTotal); progArc.style.strokeDashoffset = dashTotal;
    playStep();
  };

  // HUD update — keep as-is
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  const xpEl=document.getElementById('hudXp'); const lvl=document.getElementById('hudLevel');
  const xpInLevel=(s.xp||0)%100; xpEl.style.width=xpInLevel+'%'; lvl.textContent='Lv '+(s.level||1);
}
