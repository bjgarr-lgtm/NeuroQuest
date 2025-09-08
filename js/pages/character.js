// pages/character.js
import {load, save} from '../util/storage.js';

export default function renderCharacter(root){
  const state = load();
  if(!state.party) state.party = {};
  if(!state.party.hero) state.party.hero = { src: state.party.hero?.src || 'assets/bambi.png' };
  if(!state.party.acc) state.party.acc = []; // [{src,x,y,scale,rot,z}]

  root.innerHTML = `
  <section class="panel">
    <h2>Character & Companions</h2>

    <div class="character-grid">
      <!-- Left: hero + editor -->
      <div class="hero-side">
        <h3>Your Hero</h3>

        <div class="portrait-wrap" id="portrait">
          <img class="hero-base" id="heroImg" alt="hero">
          <div class="acc-layer" id="accLayer" aria-live="polite"></div>
        </div>

        <div class="file-row">
          <label>Upload Accessory PNG</label>
          <input id="accFile" type="file" accept="image/png,image/webp,image/*">
          <button class="btn primary" id="addAccBtn">Add Accessory</button>
        </div>

        <div class="acc-editor">
          <div class="hint">Tip: <b>drag</b> to move • <b>mouse wheel</b> to resize • <b>Shift + wheel</b> to rotate.
            Click an accessory to select it.</div>
          <div class="toolbar">
            <button class="btn" id="bringFront">Bring Front</button>
            <button class="btn" id="sendBack">Send Back</button>
            <button class="btn primary" id="saveAcc">Save</button>
            <button class="btn danger" id="removeAcc">Remove</button>
            <span id="accStatus" style="opacity:.8"></span>
          </div>
        </div>

        <div class="file-row">
          <label>Change Hero Portrait</label>
          <input id="heroFile" type="file" accept="image/*">
        </div>
      </div>

      <!-- Right: companions -->
      <div class="companions-side">
        <h3>Companions</h3>
        <p class="companions-blurb">Unchanged here — this panel keeps your current companions flow.</p>
        <div id="companionsList"></div>
      </div>
    </div>
  </section>
  `;

  // --- wiring
  const heroImg = root.querySelector('#heroImg');
  const accLayer = root.querySelector('#accLayer');
  const status = root.querySelector('#accStatus');

  // load hero
  heroImg.src = state.party.hero?.src || 'assets/bambi.png';

  // render accessories
  function renderAcc(){
    accLayer.innerHTML = '';
    state.party.acc
      .sort((a,b)=> (a.z??0) - (b.z??0))
      .forEach((a, idx)=>{
        const img = new Image();
        img.src = a.src;
        img.className = 'acc-img';
        img.style.transform =
          `translate(${a.x||0}px, ${a.y||0}px) scale(${a.scale||1}) rotate(${a.rot||0}deg)`;
        img.dataset.index = idx;
        accLayer.appendChild(img);
      });
  }
  renderAcc();

  // selection + drag/scale/rotate
  let sel = -1, dragging = false, lastY=0;
  const select = (i)=>{
    sel = i;
    [...accLayer.children].forEach((n,ix)=> n.classList.toggle('active', ix===sel));
    status.textContent = sel>=0 ? `Accessory ${sel+1} selected` : `No accessory selected.`;
  };

  accLayer.addEventListener('mousedown', e=>{
    const target = e.target.closest('.acc-img');
    if(!target){ select(-1); return; }
    select(+target.dataset.index);
    dragging = true;
    lastY = e.clientY;
  });
  window.addEventListener('mouseup', ()=> dragging=false);
  window.addEventListener('mousemove', e=>{
    if(sel<0 || !dragging) return;
    const a = state.party.acc[sel];
    a.x = (a.x||0) + e.movementX;
    a.y = (a.y||0) + e.movementY;
    renderAcc(); select(sel);
  });

  accLayer.addEventListener('wheel', e=>{
    if(sel<0) return;
    e.preventDefault();
    const a = state.party.acc[sel];
    if(e.shiftKey){
      // rotate
      a.rot = (a.rot||0) + (e.deltaY>0 ? 2 : -2);
    }else{
      // scale
      const s = Math.max(0.2, Math.min(4, (a.scale||1) * (e.deltaY>0 ? 0.95 : 1.05)));
      a.scale = +s.toFixed(3);
    }
    renderAcc(); select(sel);
  }, {passive:false});

  // add accessory
  root.querySelector('#addAccBtn').onclick = ()=>{
    const f = root.querySelector('#accFile').files?.[0];
    if(!f){ alert('Choose a PNG/WebP first'); return; }
    const r = new FileReader();
    r.onload = ()=>{
      state.party.acc.push({ src:r.result, x:0, y:0, scale:1, rot:0, z:(state.party.acc.length? Math.max(...state.party.acc.map(a=>a.z||0))+1 : 1)});
      renderAcc(); select(state.party.acc.length-1);
    };
    r.readAsDataURL(f);
  };

  // hero portrait change
  root.querySelector('#heroFile').onchange = e=>{
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{ state.party.hero.src = r.result; heroImg.src = r.result; save(state); };
    r.readAsDataURL(f);
  };

  // z-order + save/remove
  root.querySelector('#bringFront').onclick = ()=>{
    if(sel<0) return;
    const maxZ = state.party.acc.reduce((m,a)=> Math.max(m, a.z||0), 0);
    state.party.acc[sel].z = maxZ + 1;
    renderAcc(); select(sel);
  };
  root.querySelector('#sendBack').onclick = ()=>{
    if(sel<0) return;
    const minZ = state.party.acc.reduce((m,a)=> Math.min(m, a.z||0), 0);
    state.party.acc[sel].z = minZ - 1;
    renderAcc(); select(sel);
  };
  root.querySelector('#saveAcc').onclick = ()=>{
    save(state);
    status.textContent = 'Saved.';
    setTimeout(()=> status.textContent='', 1200);
  };
  root.querySelector('#removeAcc').onclick = ()=>{
    if(sel<0) return;
    state.party.acc.splice(sel,1);
    save(state);
    renderAcc(); select(-1);
  };
}
