// ui/hud.js — updates top HUD from the shared state
export function renderHUD(s){
  const goldEl = document.getElementById('hudGold');
  if (goldEl) goldEl.textContent = '🪙 ' + (s.gold|0);

  const levelEl = document.getElementById('hudLevel');
  if (levelEl) levelEl.textContent = 'Lv ' + (s.level||1);

  const xpBar = document.getElementById('hudXp');
  if (xpBar) xpBar.style.width = ((s.xp||0)%100) + '%';
}
