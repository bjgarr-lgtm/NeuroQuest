
import {load, save} from '../util/storage.js';
import {addGold, addXP} from '../util/game.js';

export default function renderToddler(root){
  const s=load();
  if(!s.toddler){ root.innerHTML='<div class="panel">Toddler Mode is OFF (enable in Settings)</div>'; return; }
  s.toddlerCoins ??= 0;
  s.pet ??= {species:'birb', owned:['Bow','Hat','Scarf'], acc:[]};
  save(s);
  const ACCESSORIES=['Bow','Hat','Scarf','Glasses','Cape','Bandana','Star Pin','Bell','Flower','Backpack','Crown','Boots','Monocle','Wristbands','Tail Ribbon'];
  const species=['birb','slime','cat'];
  root.innerHTML = `
    <section class="grid two">
      <div class="panel">
        <h3>Pick Your Pet</h3>
        <div class="row">
          ${species.map(sp=>`<button class="secondary petPick" data-sp="${sp}">${sp}</button>`).join('')}
        </div>
        <div>Coins: <b id="tcoins">${s.toddlerCoins}</b></div>
        <h4>Accessories</h4>
        <div id="accGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"></div>
      </div>
      <div class="panel">
        <h3>Toddler Quests</h3>
        <div class="row"><button class="primary tQuest">Help pick up toys</button></div>
        <div class="row"><button class="primary tQuest">Bring mom the mail</button></div>
        <div class="row"><button class="primary tQuest">Put dishes in sink</button></div>
      </div>
    </section>
    <section class="panel">
      <h3>Mini Games</h3>
      <div id="games" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>
      <div id="game" style="height:220px;margin-top:8px;position:relative"></div>
    </section>
  `;
  function drawAcc(){
    const g=document.getElementById('accGrid'); g.innerHTML='';
    ACCESSORIES.forEach(name=>{
      const owned = (s.pet.owned||[]).includes(name);
      const btn=document.createElement('button'); btn.className=owned?'secondary':'primary';
      btn.textContent = owned? `Equip ${name}`:`Buy ${name} (5)`;
      btn.onclick=()=>{
        if(owned){ if(!s.pet.acc.includes(name)) s.pet.acc.push(name); save(s); }
        else {
          if(s.toddlerCoins>=5){ s.toddlerCoins-=5; s.pet.owned.push(name); save(s); drawAcc(); document.getElementById('tcoins').textContent=s.toddlerCoins; }
          else alert('Earn coins in games!');
        }
      };
      g.appendChild(btn);
    });
  }
  drawAcc();

  document.querySelectorAll('.petPick').forEach(b=> b.onclick=()=>{ s.pet.species=b.dataset.sp; save(s); });
  document.querySelectorAll('.tQuest').forEach(b=> b.onclick=()=>{ addGold(1); s.toddlerCoins+=2; save(s); document.getElementById('tcoins').textContent=s.toddlerCoins; });

  // Games grid
  const games=[
    {id:'bubbles', label:'Pop Bubbles'},
    {id:'stars', label:'Catch Stars'},
    {id:'colors', label:'Color Tap'},
    {id:'maze', label:'Tiny Maze'},
    {id:'memory', label:'Mini Memory'},
    {id:'balloon', label:'Balloon Tap'},
    {id:'shape', label:'Shape Match'},
    {id:'rain', label:'Coin Rain'},
    {id:'drum', label:'Drum Pads'},
  ];
  const grid=document.getElementById('games');
  games.forEach(g=>{
    const card=document.createElement('button'); card.className='secondary'; card.textContent=g.label;
    card.onclick=()=> launch(g.id);
    grid.appendChild(card);
  });

  function launch(id){
    const host=document.getElementById('game'); host.innerHTML='';
    let score=0,time=15;
    const hud=document.createElement('div'); hud.textContent='Score 0 | Time 15'; host.appendChild(hud);
    const end=()=>{ addGold(1); s.toddlerCoins+=Math.max(1, Math.floor(score/5)); save(s); document.getElementById('tcoins').textContent=s.toddlerCoins; host.innerHTML='<h3>Score '+score+'</h3>'; };
    const ti=setInterval(()=>{ time--; hud.textContent='Score '+score+' | Time '+time; if(time<=0){ clearInterval(ti); clearInterval(sp); end(); } },1000);
    let sp;
    if(id==='bubbles'){
      sp=setInterval(()=>{
        const b=document.createElement('div'); b.style.position='absolute'; b.style.width='30px'; b.style.height='30px'; b.style.borderRadius='50%'; b.style.background='radial-gradient(#9ff,#37a)';
        b.style.left=(Math.random()*(host.clientWidth-40))+'px'; b.style.top=(Math.random()*(host.clientHeight-40))+'px';
        b.onclick=()=>{ score++; b.remove(); }; host.appendChild(b); setTimeout(()=>b.remove(),1400);
      },420);
    } else if(id==='stars'){
      sp=setInterval(()=>{
        const sEl=document.createElement('div'); sEl.textContent='★'; sEl.style.position='absolute'; sEl.style.fontSize='24px';
        sEl.style.left=(Math.random()*(host.clientWidth-30))+'px'; sEl.style.top=(Math.random()*(host.clientHeight-30))+'px';
        sEl.onclick=()=>{ score++; sEl.remove(); }; host.appendChild(sEl); setTimeout(()=>sEl.remove(),900);
      },300);
    } else if(id==='drum'){
      host.innerHTML='';
      const keys=['🥁','🪘','🎶','🔔']; keys.forEach(k=>{ const b=document.createElement('button'); b.textContent=k; b.style.margin='6px'; b.onclick=()=>{ score++; }; host.appendChild(b); });
    } else {
      // simple fallback tap game
      sp=setInterval(()=>{
        const sEl=document.createElement('button'); sEl.textContent='Tap!'; sEl.style.position='absolute';
        sEl.style.left=(Math.random()*(host.clientWidth-60))+'px'; sEl.style.top=(Math.random()*(host.clientHeight-30))+'px';
        sEl.onclick=()=>{ score++; sEl.remove(); }; host.appendChild(sEl); setTimeout(()=>sEl.remove(),1100);
      },500);
    }
  }
}
