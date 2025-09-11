// js/app.js — stable router + HUD wire

import { load, save, onChange } from './util/storage.js';
import { initDrawer } from './ui/drawer.js';
import { cursorTrail } from './ui/fx.js';
import { renderHUD } from './ui/hud.js';

import renderHome from './pages/home.js';
import renderQuests from './pages/quests.js';
import renderLife from './pages/life.js';
import renderCharacter from './pages/character.js';
import renderJournal from './pages/journal.js';
import renderToddler from './pages/toddler.js';
import renderRewards from './pages/rewards.js';
import renderSettings from './pages/settings.js';
import renderShop from './pages/shop.js';

// ---- Routes shown in the hamburger drawer
const routes = [
  { id: 'home',      label: 'Dashboard',          view: renderHome },
  { id: 'quests',    label: 'Quests',             view: renderQuests },
  { id: 'life',      label: 'Life Hub',           view: renderLife },
  { id: 'character', label: 'Party',              view: renderCharacter },
  { id: 'journal',   label: 'Adventure Journal',  view: renderJournal },
  { id: 'settings',  label: 'Settings',           view: renderSettings },
];

initDrawer(routes);
cursorTrail();

// ---- HUD
function updateHud(){
  const s = load();

  const goldEl  = document.getElementById('hudGold');
  const xpEl    = document.getElementById('hudXp');
  const lvlEl   = document.getElementById('hudLevel');
  const mini    = document.getElementById('partyMini');
  const tokens  = document.getElementById('hudTokens');

  if (goldEl) goldEl.textContent = '🪙 ' + (s.gold || 0);
  if (xpEl)   xpEl.style.width   = ((s.xp || 0) % 100) + '%';
  if (lvlEl)  lvlEl.textContent  = 'Lv ' + (s.level || 1);

  if (tokens){
    tokens.innerHTML = '';
    (s.tokens || []).slice(-8).forEach(t => {
      const span = document.createElement('span');
      span.className = 'token';
      span.textContent = t;
      tokens.appendChild(span);
    });
  }

  if (mini){
    mini.innerHTML = '';
    if (s.party?.hero){
      const i = document.createElement('img');
      i.src = s.party.hero.src;
      mini.appendChild(i);
    }
    (s.party?.companions || []).forEach(c => {
      const i = document.createElement('img');
      i.src = c.src;
      mini.appendChild(i);
    });
  }

  // If you also have a separate HUD renderer, let it run:
  try { renderHUD(s); } catch(_) {}
}

// expose for NYX economy bumps
window.NQ_updateHud = updateHud;

// ---- Router
function mount(viewFn){
  const root = document.getElementById('view');
  if (!root) return;
  try {
    viewFn(root);
  } catch (e) {
    console.error('[render]', e);
    root.innerHTML = `<div class="panel"><h3>Render error</h3><pre>${String(e)}</pre></div>`;
  }
}

function currentRoute(){
  const id = (location.hash || '#home').slice(1);
  return routes.find(r => r.id === id) || routes[0];
}

function render(){
  const hash = (location.hash || '#home').slice(1);

  if (hash === 'game') {
    // hide your regular content
    const root = document.getElementById('view');
    if (root) root.innerHTML = '';         // or keep HUD if you prefer overlay
    mountGodot();                           // boot Godot
    return;
  } else {
    // going back to web pages: hide Godot and render normal views
    unmountGodot();
  }

  const r = routes.find(x=>x.id===hash) || routes[0];
  const root = document.getElementById('view');
  r.view(root);
  updateHud();
}
window.addEventListener('hashchange', render);

<iframe id="godot-frame" src="/game/index.html" style="
  position:relative; width:100%; height:70vh; border:0; border-radius:12px;">
</iframe>

// ---- Export / Import
document.getElementById('exportBtn')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(load(), null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neuroquest-state.json';
  a.click();
});

document.getElementById('importBtn')?.addEventListener('click', () =>
  document.getElementById('importFile')?.click()
);

document.getElementById('importFile')?.addEventListener('change', (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      localStorage.setItem('sb_v26_state', JSON.stringify(s));
      location.reload();
    } catch {
      alert('Invalid file');
    }
  };
  r.readAsText(f);
});

// ---- Reactive HUD
let state = load();
updateHud();
try { renderHUD(state); } catch(_) {}
onChange(next => { state = next; updateHud(); });

console.log('[APP] ready');

(function wireDrawer(){
  const drawer = document.getElementById('drawer');
  const scrim  = document.getElementById('scrim');
  const hamb   = document.getElementById('hamb');

  function open(){ drawer.classList.add('open'); document.body.classList.add('drawer-open'); }
  function close(){ drawer.classList.remove('open'); document.body.classList.remove('drawer-open'); }
  function toggle(){ drawer.classList.contains('open') ? close() : open(); }

  hamb?.addEventListener('click', toggle);
  scrim?.addEventListener('click', close);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });

  drawer.style.left = 'auto';
  drawer.style.right = '0';
  drawer.style.transform = drawer.classList.contains('open') ? 'translateX(0)' : 'translateX(100%)';

  // Close drawer when navigating
  window.addEventListener('hashchange', close);
})();

// ---- Godot boot / teardown ----
let __godot = { instance: null, booted: false };

async function mountGodot() {
  const root = document.getElementById('godot-root');
  if (!root) return;

  // Show the Godot container, hide the web dashboards if you want the game to “own” the view
  root.style.display = 'block';

  // If already booted once, do nothing (or implement a reload if you want)
  if (__godot.booted) return;

  // IMPORTANT: paths must match where you put the export
  const GODOT_BASE = 'assets/game/'; // or 'game/' depending on your choice
  const config = {
    // Godot 4 style loader opts:
    canvas: root,                             // mount inside #godot-root
    executable: GODOT_BASE + 'index.html',    // **some exports use 'index' as the executable id**
    // ^ if this doesn’t work, try omitting 'executable' and use the default the loader expects
    // Godot 3 style uses:
    // 'data' : GODOT_BASE + 'game.pck',
    // 'wasm' : GODOT_BASE + 'game.wasm'
  };

  // Godot 3 vs 4 loaders differ a bit:
  // If your loader exposes `Engine` (Godot 4):
  if (window.Engine) {
    __godot.instance = await Engine.startGame({
      canvas: root,
      // Files location:
      executable: GODOT_BASE + 'index',   // no extension in Godot 4
      enableThreads: true,
      onProgress: (c, t) => { /* optional progress */ },
    });
    __godot.booted = true;
    return;
  }

  // If your loader exposes `Godot` (Godot 3):
  if (window.Godot) {
    const godot = window.Godot;
    __godot.instance = godot({
      canvas: root,
      // Provide the exported file paths:
      'data': GODOT_BASE + 'game.pck',
      'wasm': GODOT_BASE + 'game.wasm',
      'onProgress': (c,t)=>{}
    });
    __godot.instance.then(()=>{ __godot.booted = true; });
  }
}

function unmountGodot() {
  const root = document.getElementById('godot-root');
  if (!root) return;
  root.style.display = 'none';
  // Optional: If you want to fully destroy and free memory, check your Godot loader API.
  // Many folks keep it booted for faster return.
}

