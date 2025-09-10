import {load, save} from '../util/storage.js';

export default function renderSettings(root){
  const s=load();
  s.settings ??= { theme: 'default', font: 'Press Start 2P', toddler:false };
  root.innerHTML = `
    <h2>Settings</h2>
    <section class="grid two">
      <div class="panel">
        <h3>Theme</h3>
        <select id="themeSel">
          <option value="default">Default</option>
          <option value="midnight">Midnight</option>
          <option value="forest">Forest</option>
          <option value="sunset">Sunset</option>
          <option value="ocean">Ocean</option>
          <option value="pastel">Pastel</option>
          <option value="mono">Mono</option>
        </select>
      </div>
      <div class="panel">
        <h3>Font</h3>
        <input id="fontSel" placeholder="Font name" value="${s.settings.font||'Press Start 2P'}"/>
      </div>
      <div class="panel">
        <h3>Display Name</h3>
        <input id="nameSel" placeholder="Your name" value="${s.user?.name||'You'}"/>
      </div>
      <div class="panel">
        <h3>Music</h3>
        <button id="uploadSong" class="secondary">Upload Song</button>
      </div>
    </section>
  `;
  document.getElementById('themeSel').onchange=(e)=>{ s.settings.theme=e.target.value; save(s); };
  document.getElementById('fontSel').oninput=(e)=>{ s.settings.font=e.target.value; save(s); };
  document.getElementById('nameSel').oninput=(e)=>{ s.user=s.user||{}; s.user.name=e.target.value; save(s); document.getElementById('hud').querySelector('#hudLevel').previousSibling && 0; };
  
  document.getElementById('uploadSong').onclick=()=> document.getElementById('musicFile').click();
}