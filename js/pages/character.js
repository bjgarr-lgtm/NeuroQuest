// js/pages/character.js
// SootheBirb v2.6 – Character & Companions (accessory editor)
// Drop-in replacement

const LS_KEY = 'sb_v26_state';
const getState = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? {}; }
  catch { return {}; }
};
const setState = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));

// Utility: clamp
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Utility: downscale a DataURL to keep localStorage small
async function downscaleDataURL(dataUrl, longest = 512) {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const r = Math.min(1, longest / Math.max(img.width, img.height));
  if (r === 1) return dataUrl;
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * r);
  c.height = Math.round(img.height * r);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png', 0.92);
}

// DOM helpers
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export default function renderCharacter(viewEl) {
  const state = getState();
  state.hero ||= {};
  state.hero.portrait ||= state.hero.portrait || 'assets/hero-default.png';
  state.hero.acc ||= []; // {id,data,x,y,scale,rot,z}
  state.companions ||= []; // data URLs

  // ===== Left column: Your Hero =====
  const wrap = el('section', 'cardish character-page');

  wrap.innerHTML = `
    <h2 class="dash">Character & Companions</h2>
    <div class="character-grid">
      <div class="hero-side">
        <h3>Your Hero</h3>
        <div class="portrait-wrap" id="portraitWrap" aria-label="Character preview">
          <img id="heroBase" class="hero-base" alt="Hero portrait"/>
          <div id="accLayer" class="acc-layer"></div>
        </div>

        <!-- HERO PORTRAIT FIRST -->
        <div class="row hero-file file-row">
          <label class="field">
            <span>Change Hero Portrait</span>
            <input id="heroFile" type="file" accept="image/*"/>
          </label>
        </div>

        <!-- ACCESSORY UPLOAD SECOND -->
        <div class="row file-row">
          <label class="field">
            <span>Upload Accessory PNG</span>
            <input id="accFile" type="file" accept="image/png,image/webp,image/*"/>
          </label>
          <button id="addAccBtn" class="primary">Add Accessory</button>
        </div>

        <div id="accEditor" class="acc-editor cardish">
          <h4>Accessory Editor</h4>
          <p class="hint muted">Tip: drag to move • wheel = resize • Shift+wheel = rotate</p>
          <div class="toolbar">
            <button data-nudge="-10,0">←</button>
            <button data-nudge="10,0">→</button>
            <button data-nudge="0,-10">↑</button>
            <button data-nudge="0,10">↓</button>
            <button data-scale="0.9">− size</button>
            <button data-scale="1.1">+ size</button>
            <button data-rot="-10">↶</button>
            <button data-rot="10">↷</button>
            <button data-z="front">Bring Front</button>
            <button data-z="back">Send Back</button>
            <button id="saveAcc" class="primary">Save</button>
            <button id="removeAcc" class="danger">Remove</button>
          </div>
          <small id="accStatus"></small>
        </div>
      </div>

      <div class="companions-side">
        <h3>Companions</h3>
        <div class="row file-row">
          <label class="field">
            <span>Add Companion PNG</span>
            <input id="cmpFile" type="file" accept="image/png,image/webp,image/*"/>
          </label>
          <button id="addCmpBtn" class="primary">Add Companion</button>
        </div>
        <div id="cmpList" class="comp-list"></div>
      </div>
    </div>
`;

  viewEl.innerHTML = '';
  viewEl.appendChild(wrap);

  // ===== Elements
  const portraitWrap = $('#portraitWrap', wrap);
  const heroBase = $('#heroBase', wrap);
  const accLayer = $('#accLayer', wrap);
  const accFile = $('#accFile', wrap);
  const addAccBtn = $('#addAccBtn', wrap);
  const accEditor = $('#accEditor', wrap);
  const accStatus = $('#accStatus', wrap);
  const heroFile = $('#heroFile', wrap);

  // Bigger preview (2x-ish) handled via CSS (see section 2)
  heroBase.src = state.hero.portrait;

  // Keep editor visible even when base loads
  heroBase.onload = () => {
    // ensure accessories re-render at the current canvas size
    renderAccessories();
  };

  // ===== Accessory RENDERING
  let activeId = null; // currently editing
  function renderAccessories() {
    accLayer.innerHTML = '';
    const sorted = [...state.hero.acc].sort((a,b)=> (a.z ?? 0) - (b.z ?? 0));
    for (const a of sorted) {
      const img = el('img', 'acc-img');
      img.src = a.data;
      img.dataset.id = a.id;
      applyTransform(img, a);
      accLayer.appendChild(img);

      // pick to edit
      img.addEventListener('pointerdown', (ev) => {
        setActive(a.id);
        startDrag(ev, img, a);
      });
    }
  }

  function setActive(id) {
    activeId = id;
    accLayer.querySelectorAll('.acc-img').forEach(n=>{
      n.classList.toggle('active', n.dataset.id === String(id));
    });
    updateEditorStatus();
  }

  function updateEditorStatus() {
    const a = state.hero.acc.find(x => x.id === activeId);
    if (!a) {
      accStatus.textContent = 'No accessory selected.';
      return;
    }
    accStatus.textContent = `x:${a.x|0} y:${a.y|0} scale:${a.scale.toFixed(2)} rot:${(a.rot|0)}°`;
  }

  function applyTransform(img, a) {
    img.style.transform = `translate(${a.x}px, ${a.y}px) rotate(${a.rot}deg) scale(${a.scale})`;
  }

  // ===== Drag & wheel interactions
  function startDrag(ev, node, data) {
    ev.preventDefault();
    node.setPointerCapture(ev.pointerId);
    const start = { x: ev.clientX, y: ev.clientY, dx: data.x, dy: data.y };
    const move = (e) => {
      const nx = start.dx + (e.clientX - start.x);
      const ny = start.dy + (e.clientY - start.y);
      data.x = clamp(nx, -400, 400);
      data.y = clamp(ny, -400, 400);
      applyTransform(node, data);
      updateEditorStatus();
    };
    const up = () => {
      node.releasePointerCapture(ev.pointerId);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
  }

  // Wheel: resize; Shift+wheel: rotate
  accLayer.addEventListener('wheel', (e) => {
    const a = state.hero.acc.find(x => x.id === activeId);
    if (!a) return;
    e.preventDefault();
    if (e.shiftKey) {
      a.rot = (a.rot + (e.deltaY > 0 ? 4 : -4)) % 360;
    } else {
      const f = e.deltaY > 0 ? 0.95 : 1.05;
      a.scale = clamp(a.scale * f, 0.2, 4);
    }
    const node = accLayer.querySelector(`.acc-img[data-id="${activeId}"]`);
    if (node) applyTransform(node, a);
    updateEditorStatus();
  }, { passive: false });

  // Toolbar controls
  accEditor.addEventListener('click', (e) => {
    const t = e.target;
    const a = state.hero.acc.find(x => x.id === activeId);
    if (!a) return;

    if (t.dataset.nudge) {
      const [dx,dy] = t.dataset.nudge.split(',').map(Number);
      a.x += dx; a.y += dy;
    }
    if (t.dataset.scale) {
      a.scale = clamp(a.scale * Number(t.dataset.scale), 0.2, 4);
    }
    if (t.dataset.rot) {
      a.rot = (a.rot + Number(t.dataset.rot)) % 360;
    }
    if (t.id === 'bringFront') {
      a.z = Math.max(...state.hero.acc.map(v=>v.z||0), 0) + 1;
    }
    if (t.id === 'sendBack') {
      a.z = Math.min(...state.hero.acc.map(v=>v.z||0), 0) - 1;
    }
    if (t.id === 'removeAcc') {
      const idx = state.hero.acc.findIndex(v => v.id === activeId);
      if (idx >= 0) {
        state.hero.acc.splice(idx,1);
        setState(state);
        activeId = null;
        renderAccessories();
        updateEditorStatus();
      }
      return;
    }
    if (t.id === 'saveAcc') {
      setState(state);
    }
    // update transforms live
    const node = activeId && accLayer.querySelector(`.acc-img[data-id="${activeId}"]`);
    if (node && a) applyTransform(node, a);
    updateEditorStatus();
  });

  // ===== Add Accessory flow
  addAccBtn.addEventListener('click', async () => {
    const file = accFile.files?.[0];
    if (!file) return;
    // Read as DataURL then downscale
    const dataUrl = await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(file);
    });

    const small = await downscaleDataURL(String(dataUrl), 512);

    // new accessory default in center
    const a = {
      id: crypto.randomUUID(),
      data: small,
      x: 0, y: 0,
      scale: 1, rot: 0, z: (Math.max(0, ...(state.hero.acc.map(v=>v.z||0))) + 1)
    };
    state.hero.acc.push(a);
    setState(state);
    renderAccessories();
    setActive(a.id);
    accStatus.textContent = 'Accessory added. Drag to move, wheel to resize, Shift+wheel to rotate.';
  });

  
  // ===== SAVE: composite hero + accessories and write to party (DOM-synced) =====
  (function(){
    const saveBtn = $('#saveAcc', wrap);
    if(!saveBtn) return;
    function parseTransform(str){
      // expecting: translate(Xpx, Ypx) rotate(Rdeg) scale(S)
      const out = {x:0,y:0,rot:0,scale:1};
      const mT = /translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/.exec(str||'');
      if(mT){ out.x=parseFloat(mT[1]); out.y=parseFloat(mT[2]); }
      const mR = /rotate\(([-0-9.]+)deg\)/.exec(str||'');
      if(mR){ out.rot=parseFloat(mR[1]); }
      const mS = /scale\(([-0-9.]+)\)/.exec(str||'');
      if(mS){ out.scale=parseFloat(mS[1]); }
      return out;
    }
    saveBtn.addEventListener('click', async ()=>{
      try{
        // sync from DOM so we capture EXACT on-screen alignment
        accLayer.querySelectorAll('.acc-img').forEach(node=>{
          const id = node.dataset.id;
          const a = state.hero.acc.find(x=> String(x.id)===String(id));
          if(a){
            const tf = node.style.transform || '';
            const v = parseTransform(tf);
            a.x = v.x; a.y = v.y; a.rot = v.rot; a.scale = v.scale;
          }
        });

        // composite
        const rect = portraitWrap.getBoundingClientRect();
        const W = Math.max(360, Math.round(rect.width || 360));
        const H = Math.max(460, Math.round(rect.height || 460));
        const can = document.createElement('canvas'); can.width = W; can.height = H;
        const ctx = can.getContext('2d');

        const base = new Image(); base.src = heroBase.src; await base.decode();
        ctx.drawImage(base, 0, 0, W, H);

        const sorted = [...state.hero.acc].sort((a,b)=> (a.z ?? 0) - (b.z ?? 0));
        for(const a of sorted){
          const img = new Image(); img.src = a.data; await img.decode();
          ctx.save();
          ctx.translate(W/2, H/2);
          ctx.translate(a.x||0, a.y||0);
          ctx.rotate(((a.rot||0) * Math.PI) / 180);
          const s = a.scale || 1;
          ctx.scale(s, s);
          ctx.drawImage(img, -img.width/2, -img.height/2);
          ctx.restore();
        }

        const merged = can.toDataURL('image/png', 0.95);
        const st = getState(); st.party ||= { hero:null, companions:[] };
        st.party.hero = { src: merged };
        setState(st);

        accStatus.textContent = 'Saved to party!';
        setTimeout(()=> accStatus.textContent = '', 1500);
      }catch(err){
        console.warn('Save failed', err);
        accStatus.textContent = 'Save failed.';
        setTimeout(()=> accStatus.textContent = '', 1800);
      }
    });
  })();

// ===== Change hero portrait (keeps editor visible)
  heroFile.addEventListener('change', async () => {
    const f = heroFile.files?.[0];
    if (!f) return;
    const dataUrl = await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.readAsDataURL(f);
    });
    const small = await downscaleDataURL(String(dataUrl), 1024);
    state.hero.portrait = small;
    setState(state);
    heroBase.src = state.hero.portrait;
  });

  
  // ===== Companions (simple list persisted in LS) =====
  const cmpFile = $('#cmpFile', wrap);
  const addCmpBtn = $('#addCmpBtn', wrap);
  const cmpList = $('#cmpList', wrap);

  function renderCompanions(){
    if(!cmpList) return;
    cmpList.innerHTML = '';
    for(const src of state.companions){
      const item = el('div','comp-item');
      item.innerHTML = `<img src="${src}" alt="Companion"><button class="tiny danger">✕</button>`;
      item.querySelector('button').addEventListener('click', ()=>{
        const i = state.companions.indexOf(src);
        if(i>-1){ state.companions.splice(i,1); setState(state); renderCompanions(); }
      });
      cmpList.appendChild(item);
    }
  }

  if(addCmpBtn){
    addCmpBtn.addEventListener('click', async ()=>{
      const f = cmpFile?.files?.[0];
      if(!f) return;
      const dataUrl = await new Promise((res)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(f); });
      const img = new Image(); img.src = dataUrl; await img.decode();
      const maxSide = Math.max(img.width, img.height);
      const can = document.createElement('canvas'); const r = Math.min(1, 512/maxSide);
      can.width = Math.round(img.width*r); can.height = Math.round(img.height*r);
      const ctx = can.getContext('2d'); ctx.drawImage(img,0,0,can.width,can.height);
      const small = can.toDataURL('image/png', 0.9);
      state.companions.push(small);
      setState(state);
      cmpFile.value = '';
      renderCompanions();
    });
  }

  // Initial render
  renderAccessories();
  updateEditorStatus();
}
