// character.js — character & party view + overlay editor (v2.6 modular)
import { load, save } from './storage.js';
import { applyOverlaysTo, addOverlayFromFile, overlayKeyForImage, clearOverlaysForKey } from './overlays.js';

const defaults = {
  user: { name: 'Hero' },
  xp: 0, gold: 0, streak: 0,
  settings: { theme: 'retro' },
  party: { leader: null, members: [] },
  overlays: {}
};

let S = load(defaults);

export async function init(root) {
  root.innerHTML = `
    <section class="cardish">
      <h2 class="dash">Choose Your Hero</h2>
      <div class="char-grid" id="charGrid"></div>
      <div class="row">
        <button id="uploadChar" class="secondary">Upload custom portrait</button>
        <input id="charFile" type="file" accept="image/*" style="display:none"/>
      </div>
    </section>
    <section class="cardish">
      <h3 class="dash">Portrait</h3>
      <div class="char-portrait"><img id="charPortrait" alt="portrait"/></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <input type="file" id="accFile" accept="image/*"/>
        <button id="accAdd" class="primary">Add Accessory</button>
        <button id="accClear" class="danger">Clear Accessories</button>
      </div>
      <small>Tip: pair this with the Accessory Align editor for pixel‑perfect placement.</small>
    </section>
  `;

  const portrait = root.querySelector('#charPortrait');
  if (!S.party.leader) { S.party.leader = 'bambi'; save(S); }
  portrait.src = leaderSrc(S.party.leader);
  portrait.setAttribute('data-char-id', S.party.leader);

  const grid = root.querySelector('#charGrid');
  const presets = ['bambi','ash','odin','fox','molly'];
  grid.innerHTML = presets.map(id => `
    <button class="card" data-char="${id}">
      <img src="${leaderSrc(id)}" alt="${id}" style="height:120px;border-radius:12px"/>
      <div style="text-transform:capitalize">${id}</div>
    </button>
  `).join('');
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-char]');
    if (!btn) return;
    const id = btn.dataset.char;
    S.party.leader = id; save(S);
    portrait.src = leaderSrc(id);
    portrait.setAttribute('data-char-id', id);
    applyOverlaysTo(portrait);
  });

  const upBtn = root.querySelector('#uploadChar');
  const upFile = root.querySelector('#charFile');
  upBtn.addEventListener('click', ()=> upFile.click());
  upFile.addEventListener('change', () => {
    const f = upFile.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    S.party.leader = `custom_${Date.now()}`; save(S);
    portrait.src = url; portrait.setAttribute('data-char-id', S.party.leader);
    applyOverlaysTo(portrait);
  });

  const accF = root.querySelector('#accFile');
  const accAdd = root.querySelector('#accAdd');
  const accClear = root.querySelector('#accClear');

  accAdd.addEventListener('click', async () => {
    const file = accF.files?.[0];
    if (!file) { alert('Pick a PNG/SVG first'); return; }
    await addOverlayFromFile(portrait, file);
    await applyOverlaysTo(portrait);
    accF.value = '';
  });

  accClear.addEventListener('click', () => {
    const key = overlayKeyForImage(portrait);
    clearOverlaysForKey(key);
    applyOverlaysTo(portrait);
  });

  applyOverlaysTo(portrait);
}

function leaderSrc(id){
  const map = {
    bambi: 'assets/characters/hero-bambi.png',
    ash:   'assets/characters/hero-ash.png',
    odin:  'assets/characters/hero-odin.png',
    fox:   'assets/characters/hero-fox.png',
    molly: 'assets/characters/comp-molly.png'
  };
  return map[id] || map['bambi'];
}
