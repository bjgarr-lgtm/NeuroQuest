import {load, save} from '../util/storage.js';

export default function renderToddler(root){
  const s=load();
  s.toddler=true; // visiting this hub enables toddler mode
  s.pet ??= {owned:[], acc:[]};
  save(s);

  root.innerHTML = `
    <h2>Toddler Hub</h2>
    <section class="panel grid two">
      <div class="card">
        <h3>Pet</h3>
        <div class="row"><span>🧒 Toddler Coins: <b id="coins">${s.toddlerCoins||0}</b></span></div>
        <div class="row" style="align-items:center; gap:8px">
          <img id="birb" src="assets/icon.svg" style="height:90px; border-radius:10px">
          <div id="owned"></div>
        </div>
        <div class="row">
          <button class="secondary buy" data-id="cap" data-cost="1">Buy Cap (1)</button>
          <button class="secondary buy" data-id="bow" data-cost="1">Buy Bow (1)</button>
          <button class="secondary buy" data-id="scarf" data-cost="2">Buy Scarf (2)</button>
        </div>
      </div>
      <div class="card">
        <h3>Minigames</h3>
        <div class="row"><button id="playPop" class="primary">Pop Bubbles</button></div>
        <div id="game" class="panel" style="height:300px"></div>
      </div>
    </section>
  `;

  function drawOwned(){
    const o=document.getElementById('owned'); o.innerHTML='<b>Owned:</b> '+(s.pet.owned||[]).join(', ');
    document.getElementById('coins').textContent=s.toddlerCoins||0;
  }
  drawOwned();

  document.querySelectorAll('.buy').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.id; const cost=+btn.dataset.cost;
      if((s.toddlerCoins||0)<cost) return alert('Not enough coins');
      if(!s.pet.owned.includes(id)) s.pet.owned.push(id);
      s.toddlerCoins-=cost; save(s); drawOwned();
    };
  });

  document.getElementById('playPop').onclick=()=>{
    const host=document.getElementById('game'); host.innerHTML='';
    const box=document.createElement('div'); box.style.position='relative'; box.style.height='100%'; host.appendChild(box);
    let score=0,time=15;
    const timer=setInterval(()=>{ if(--time<=0){ clearInterval(timer); clearInterval(spawn); s.toddlerCoins+=(1+Math.floor(score/5)); save(s); drawOwned(); host.innerHTML='<h3>Score '+score+'</h3>'; } },1000);
    const spawn=setInterval(()=>{
      const b=document.createElement('div'); b.style.position='absolute'; b.style.width='40px'; b.style.height='40px'; b.style.borderRadius='50%'; b.style.background='radial-gradient(#9ff,#37a)';
      b.style.left=(Math.random()*(box.clientWidth-40))+'px'; b.style.top=(Math.random()*(box.clientHeight-40))+'px'; b.onclick=()=>{ score++; b.remove(); };
      box.appendChild(b); setTimeout(()=>b.remove(),1600);
    },440);
  };
}
