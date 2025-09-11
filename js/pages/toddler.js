// pages/toddler.js
import {load, save} from '../util/storage.js';
import {confetti, crownDrop} from '../ui/fx.js';

export default function renderToddler(root){
  const s = load();
  // enable toddler mode in global settings so the rest of the app can check it
  s.settings ??= {};
  s.settings.toddler = true;

  // state buckets
  s.toddlerCoins ??= 0;
  s.pet ??= { owned:[], acc:[], equipped: {} }; // owned: ["cap"], acc: reserved, equipped: {cap:true}
  save(s);

  root.innerHTML = `
    <h2>Toddler Hub</h2>
    <section class="panel grid two">
      <div class="card">
        <h3>Pet</h3>
        <div class="row"><span>🧒 Toddler Coins: <b id="coins">${s.toddlerCoins}</b></span></div>

        <div class="row" style="align-items:center; gap:12px">
          <div class="pet-wrap" style="position:relative; width:140px; height:140px">
            <img id="birb" src="assets/icon.svg" style="height:140px; width:140px; object-fit:contain; border-radius:10px">
            <img id="hatCap"   alt="" style="position:absolute; left:46px; top:6px;  width:48px; display:none" src="assets/toddler/cap.png">
            <img id="bowTie"   alt="" style="position:absolute; left:56px; top:70px; width:30px; display:none" src="assets/toddler/bow.png">
            <img id="scarfImg" alt="" style="position:absolute; left:34px; top:86px; width:72px; display:none" src="assets/toddler/scarf.png">
          </div>
          <div id="owned" class="hint"></div>
        </div>

        <div class="row" style="gap:8px; flex-wrap:wrap">
          <button class="secondary buy" data-id="cap"   data-cost="1">Buy Cap (1)</button>
          <button class="secondary buy" data-id="bow"   data-cost="1">Buy Bow (1)</button>
          <button class="secondary buy" data-id="scarf" data-cost="2">Buy Scarf (2)</button>
        </div>

        <div class="row" style="gap:8px; flex-wrap:wrap">
          <button class="tiny equip" data-id="cap">Equip Cap</button>
          <button class="tiny equip" data-id="bow">Equip Bow</button>
          <button class="tiny equip" data-id="scarf">Equip Scarf</button>
          <button class="tiny" id="unequipAll">Unequip All</button>
        </div>
      </div>

      <div class="card">
        <h3>Minigames</h3>
        <div class="row"><button id="playPop" class="primary">Pop Bubbles</button></div>
        <div id="game" class="panel" style="height:320px; overflow:hidden; position:relative"></div>
        <div class="hint">Pop as many as you can in 15s. Rewards: <b>1 coin</b> + <b>1 coin per 5 pops</b>.</div>
      </div>
    </section>
  `;

  // ------- helpers -------
  function saveAndRefresh(){
    save(s);
    drawCoins();
    drawOwned();
    drawEquip();
    updateButtons();
  }
  function drawCoins(){ const c=document.getElementById('coins'); if(c) c.textContent = s.toddlerCoins||0; }
  function drawOwned(){
    const o=document.getElementById('owned');
    const list=(s.pet.owned||[]);
    o.innerHTML = list.length ? `<b>Owned:</b> ${list.join(', ')}` : `<b>Owned:</b> none yet`;
  }
  function drawEquip(){
    const on = (id)=>!!s.pet.equipped?.[id];
    const cap  = document.getElementById('hatCap');
    const bow  = document.getElementById('bowTie');
    const scarf= document.getElementById('scarfImg');
    if(cap)  cap.style.display   = on('cap')   ? 'block' : 'none';
    if(bow)  bow.style.display   = on('bow')   ? 'block' : 'none';
    if(scarf)scarf.style.display = on('scarf') ? 'block' : 'none';
  }
  function updateButtons(){
    // disable buy if owned or not enough coins
    document.querySelectorAll('.buy').forEach(btn=>{
      const id=btn.dataset.id, cost=+btn.dataset.cost;
      const owned = s.pet.owned?.includes(id);
      btn.disabled = owned || (s.toddlerCoins||0) < cost;
      btn.textContent = owned ? `Owned: ${id}` : `Buy ${id[0].toUpperCase()+id.slice(1)} (${cost})`;
    });
    // disable equip if not owned
    document.querySelectorAll('.equip').forEach(btn=>{
      const id=btn.dataset.id;
      btn.disabled = !s.pet.owned?.includes(id);
      btn.textContent = (s.pet.equipped?.[id] ? 'Unequip ' : 'Equip ') + id[0].toUpperCase()+id.slice(1);
    });
  }

  drawCoins(); drawOwned(); drawEquip(); updateButtons();

  // ------- shop actions -------
  document.querySelectorAll('.buy').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.id; const cost=+btn.dataset.cost;
      if(s.pet.owned?.includes(id)) return;
      if((s.toddlerCoins||0) < cost) return;
      s.pet.owned.push(id);
      s.toddlerCoins -= cost;
      try{ crownDrop(); confetti(); }catch(_){}
      saveAndRefresh();
    };
  });

  document.querySelectorAll('.equip').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.id;
      if(!s.pet.owned?.includes(id)) return;
      s.pet.equipped ||= {};
      s.pet.equipped[id] = !s.pet.equipped[id];
      saveAndRefresh();
    };
  });

  document.getElementById('unequipAll').onclick=()=>{
    s.pet.equipped = {};
    saveAndRefresh();
  };

  // ------- minigame: bubbles -------
  const host = document.getElementById('game');
  let timers = [];
  function clearTimers(){ timers.forEach(t=>clearInterval(t)); timers=[]; }
  function popBubbles(){
    host.innerHTML='';
    clearTimers();
    const box=document.createElement('div');
    box.style.cssText='position:relative; inset:0; width:100%; height:100%';
    host.appendChild(box);

    let score=0, time=15;

    const hud=document.createElement('div');
    hud.style.cssText='position:absolute; top:8px; left:8px; background:#0006; padding:4px 8px; border-radius:8px; font-size:12px';
    hud.textContent=`⏱ ${time}s — 🫧 ${score}`;
    box.appendChild(hud);

    const t1 = setInterval(()=>{
      time--;
      hud.textContent=`⏱ ${time}s — 🫧 ${score}`;
      if(time<=0){
        clearTimers();
        box.innerHTML = `<h3 style="text-align:center;margin-top:24px">Score ${score}</h3>`;
        // reward coins
        const gain = 1 + Math.floor(score/5);
        s.toddlerCoins = (s.toddlerCoins||0) + gain;
        try{ crownDrop(); confetti(); }catch(_){}
        saveAndRefresh();
      }
    }, 1000);

    const t2 = setInterval(()=>{
      // spawn 1–2 bubbles
      const n = 1 + (Math.random()<0.35 ? 1 : 0);
      for(let i=0;i<n;i++){
        const size = 30 + Math.round(Math.random()*26); // 30–56
        const b=document.createElement('div');
        b.style.cssText = `
          position:absolute; width:${size}px; height:${size}px; border-radius:50%;
          background: radial-gradient(circle at 30% 30%, #cfffff, #7ecbff 60%, #3a86ff);
          box-shadow: 0 0 10px #7ecbff70;
          cursor:pointer; transition: transform .08s;
        `;
        const maxX = Math.max(0, box.clientWidth - size);
        const maxY = Math.max(0, box.clientHeight - size);
        b.style.left = (Math.random()*maxX) + 'px';
        b.style.top  = (Math.random()*maxY) + 'px';
        b.onpointerdown = ()=>{
          score++;
          b.style.transform='scale(0.85)';
          setTimeout(()=>b.remove(), 60);
          hud.textContent=`⏱ ${time}s — 🫧 ${score}`;
        };
        box.appendChild(b);
        setTimeout(()=> b.remove(), 1700);
      }
    }, 420);

    timers.push(t1, t2);
  }

  document.getElementById('playPop').onclick = popBubbles;

  // clean up timers if user navigates away
  const stopAll = ()=>clearTimers();
  window.addEventListener('hashchange', stopAll, {once:true});
  root.addEventListener('cleanup', stopAll, {once:true}); // in case your router dispatches a custom cleanup
}
