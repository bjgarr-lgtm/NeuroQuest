// app.bootstrap.js — subscribe once; re-render current view whenever state changes
import { load, onChange } from './util/storage.js';
import { renderHUD } from './ui/hud.js';
// import { renderQuests } from './pages/quests.js';    // if you have per-page renderers
// import { renderJournal } from './pages/journal.js';
// import { renderLife } from './pages/life.js';

function renderAll(s){
  try { renderHUD(s); } catch(_) {}
}

let state = load();
renderAll(state);

onChange(next => { state = next; renderAll(state); });

window.__NQ_STATE__ = () => state;
