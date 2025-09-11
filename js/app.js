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
  { id: 'shop',      label: 'Wardrobe / Shop',    view: renderShop },
  { id: 'rewards',   label: 'Rewards',            view: renderRewards },
  { id: 'toddler',   label: 'Toddler Hub',        view: renderToddler },
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
  mount(currentRoute().view);
  updateHud();
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#home';
  render();
});

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
