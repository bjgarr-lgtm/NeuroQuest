// js/pages/character.js
import { load, save as saveState } from '../util/storage.js';

export default function renderCharacter(root) {
  const s = load();
  s.party ||= {};
  s.party.hero ||= { src: s.party.hero?.src || '', acc: [] };
  s.party.hero.acc ||= [];
  s.party.companions ||= [];

  // --- DOM -------------------------------------------------------------------
  root.innerHTML = `
    <section class="panel">
      <h2>Character & Companions</h2>

      <div class="character-grid">

        <div class="hero-side">
          <h3>Your Hero</h3>

          <div class="portrait-wrap" id="heroStage">
            <img id="heroBase" class="hero-base" alt="hero"/>
            <div id="accLayer" class="acc-layer"></div>
          </div>

          <div class="file-row list row">
            <label class="secondary" style="display:inline-flex;align-items:center;gap:8px;">
              <span>Upload Accessory PNG</span>
              <input id="accFile" type="file" accept="image/png" />
            </label>
            <button id="addAcc" class="primary">Add Accessory</button>
          </div>

          <div class="acc-editor">
            <p class="hint">
              Tip: <b>drag</b> to move • <b>mouse wheel</b> to resize • <b>Shift + wheel</b> to rotate.
              Click an accessory to select it.
            </p>
            <div class="toolbar">
              <button id="bringFront" class="secondary btn tiny">Bring Front</button>
              <button id="sendBack" class="secondary btn tiny">Send Back</button>
              <button id="saveAcc" class="primary btn tiny">Save</button>
              <button id="removeAcc" class="danger btn tiny">Remove</button>
              <span id="accInfo" class="tooltip">No accessory selected.</span>
            </div>
            <div class="file-row list row" style="margin-top:8px">
              <label class="secondary" style="display:inline-flex;align-items:center;gap:8px;">
                <span>Change Hero Portrait</span>
                <input id="heroFile" type="file" accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <div class="companions-side">
          <h3>Companions</h3>
          <p class="tooltip">Unchanged here—this panel keeps your current companions flow.</p>
          <div id="compList" class="list"></div>
        </div>

      </div>
    </section>
  `;

  // --- Wire hero image --------------------------------------------------------
  const heroBase = root.querySelector('#heroBase');
  if (s.party.hero.src) heroBase.src = s.party.hero.src;
  else heroBase.src = 'assets/placeholder-hero.png'; // safe fallback in case

  // --- Render companions (unchanged behavior) --------------------------------
  const compList = root.querySelector('#compList');
  compList.innerHTML = '';
  (s.party.companions || []).forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
      <img src="${c.src}" alt="" style="height:44px;border-radius:8px"/>
      <span>${c.name || 'Companion ' + (i + 1)}</span>
    `;
    compList.appendChild(row);
  });

  // --- Accessory Layer + editor ----------------------------------------------
  const accLayer = root.querySelector('#accLayer');
  let selected = null;     // currently selected accessory node <img>
  let drag = null;         // {startX,startY, x,y}
  const stage = root.querySelector('#heroStage');

  // render all accessories saved on the hero
  function renderAccessories() {
    accLayer.innerHTML = '';
    s.party.hero.acc.forEach((a, idx) => {
      const img = document.createElement('img');
      img.className = 'acc-img';
      img.src = a.src;
      img.style.transform = `translate(${a.x||0}px, ${a.y||0}px) rotate(${a.r||0}deg) scale(${a.k||1})`;
      img.dataset.index = idx;
      accLayer.appendChild(img);
    });
  }
  renderAccessories();

  // select helper
  function selectNode(node) {
    accLayer.querySelectorAll('.acc-img').forEach(n => n.classList.remove('active'));
    selected = node || null;
    if (selected) {
      selected.classList.add('active');
      const i = +selected.dataset.index;
      const a = s.party.hero.acc[i];
      updateInfo(a);
    } else {
      accInfo.textContent = 'No accessory selected.';
    }
  }

  // pointer (drag) handlers on accessories
  accLayer.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.acc-img');
    if (!target) return;
    e.preventDefault();
    selectNode(target);

    const idx = +target.dataset.index;
    const a = s.party.hero.acc[idx];
    drag = {
      startX: e.clientX, startY: e.clientY,
      x: a.x || 0, y: a.y || 0
    };
    target.setPointerCapture(e.pointerId);
  });

  accLayer.addEventListener('pointermove', (e) => {
    if (!drag || !selected) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const idx = +selected.dataset.index;
    const a = s.party.hero.acc[idx];
    a.x = drag.x + dx;
    a.y = drag.y + dy;
    applyTransform(selected, a);
    updateInfo(a);
  });

  ['pointerup','pointercancel'].forEach(evt => {
    accLayer.addEventListener(evt, () => drag = null);
  });

  // wheel: scale; shift+wheel: rotate
  stage.addEventListener('wheel', (e) => {
    if (!selected) return;
    e.preventDefault();
    const idx = +selected.dataset.index;
    const a = s.party.hero.acc[idx];
    const delta = Math.sign(e.deltaY);
    if (e.shiftKey) {
      a.r = clamp((a.r || 0) - delta * 3, -180, 180);
    } else {
      const k = a.k || 1;
      a.k = clamp(k * (delta < 0 ? 1.06 : 0.94), 0.2, 4);
    }
    applyTransform(selected, a);
    updateInfo(a);
  }, { passive: false });

  // clicking empty stage clears selection
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.acc-img')) return;
    selectNode(null);
  });

  // apply transform helper
  function applyTransform(node, a) {
    node.style.transform = `translate(${a.x||0}px, ${a.y||0}px) rotate(${a.r||0}deg) scale(${a.k||1})`;
  }

  // info HUD
  const accInfo = root.querySelector('#accInfo');
  function updateInfo(a) {
    accInfo.textContent = `x:${Math.round(a.x||0)} y:${Math.round(a.y||0)} scale:${(a.k||1).toFixed(2)} rot:${Math.round(a.r||0)}°`;
  }

  // toolbar buttons
  root.querySelector('#bringFront').onclick = () => {
    if (!selected) return;
    accLayer.appendChild(selected);
    // reorder backing array to end
    const i = +selected.dataset.index;
    const item = s.party.hero.acc.splice(i, 1)[0];
    s.party.hero.acc.push(item);
    renderAccessories();
    selectNode(accLayer.lastElementChild);
  };

  root.querySelector('#sendBack').onclick = () => {
    if (!selected) return;
    const first = accLayer.firstElementChild;
    accLayer.insertBefore(selected, first);
    // reorder backing array to beginning
    const i = +selected.dataset.index;
    const item = s.party.hero.acc.splice(i, 1)[0];
    s.party.hero.acc.unshift(item);
    renderAccessories();
    selectNode(accLayer.firstElementChild);
  };

  root.querySelector('#saveAcc').onclick = () => {
    saveState(s);
    flash('Saved!');
  };

  root.querySelector('#removeAcc').onclick = () => {
    if (!selected) return;
    const i = +selected.dataset.index;
    s.party.hero.acc.splice(i, 1);
    renderAccessories();
    saveState(s);
    selectNode(null);
  };

  // add accessory
  root.querySelector('#addAcc').onclick = () => {
    const f = root.querySelector('#accFile').files?.[0];
    if (!f) return alert('Choose a PNG first.');
    const r = new FileReader();
    r.onload = () => {
      const a = { src: r.result, x: 0, y: 0, k: 1, r: 0 };
      s.party.hero.acc.push(a);
      saveState(s);
      renderAccessories();
      // select the newly spawned node
      selectNode(accLayer.lastElementChild);
    };
    r.readAsDataURL(f);
  };

  // change hero portrait
  root.querySelector('#heroFile').onchange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      s.party.hero.src = r.result;
      heroBase.src = r.result;
      saveState(s);
    };
    r.readAsDataURL(f);
  };

  // tiny feedback
  function flash(text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '66px';
    el.style.transform = 'translateX(-50%)';
    el.style.padding = '8px 12px';
    el.style.border = '1px solid #69c';
    el.style.background = 'rgba(15,22,40,.9)';
    el.style.borderRadius = '10px';
    el.style.zIndex = '60';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 900);
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
}
