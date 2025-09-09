
import {load, save} from '../util/storage.js';

const THEMES=[
  {id:'default', name:'Neon Night'},
  {id:'forest', name:'Forest'},
  {id:'rose', name:'Rose'},
  {id:'ocean', name:'Ocean'},
  {id:'amber', name:'Amber'},
  {id:'mono', name:'Mono CRT'},
  {id:'punk', name:'Anarch Punk'}
];
const FONTS=['Press Start 2P','Inter','Atkinson Hyperlegible','Nunito','VT323','IBM Plex Mono','Courier New'];

export default function renderSettings(root){
  const s=load(); s.user ??= {name:'You'}; s.theme ??= 'default'; s.font ??= 'Press Start 2P'; save(s);
  root.innerHTML=`
    <h2>Settings</h2>
    <div class="panel">
      <label>Display Name <input id="name" value="${s.user.name||''}" /></label>
      <label>Theme
        <select id="theme">${THEMES.map(t=>`<option value="${t.id}" ${s.theme===t.id?'selected':''}>${t.name}</option>`).join('')}</select>
      </label>
      <label>Font
        <select id="font">${FONTS.map(f=>`<option value="${f}" ${s.font===f?'selected':''}>${f}</option>`).join('')}</select>
      </label>
      <label><input type="checkbox" id="toddlermode" ${s.toddler?'checked':''}/> Toddler Mode (toggle Toddler Hub)</label>
      <div class="row"><button id="chooseSong" class="secondary">Upload Music</button><span id="songName">${s.music?.name||''}</span></div>
    </div>
  `;
  document.getElementById('name').oninput=e=>{ s.user.name=e.target.value; save(s); };
  document.getElementById('theme').onchange=e=>{ s.theme=e.target.value; save(s); document.body.dataset.theme=s.theme; };
  document.getElementById('font').onchange=e=>{ s.font=e.target.value; save(s);
    document.documentElement.style.setProperty('--pix', s.font+', system-ui, sans-serif'); };
  document.getElementById('toddlermode').onchange=e=>{ s.toddler=e.target.checked; save(s); };
  document.getElementById('chooseSong').onclick=()=> document.getElementById('musicFile').click();
}
