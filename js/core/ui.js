
import {S, save} from './state.js';
import {routeTo} from './router.js';
import {crownDrop, confetti, cursorTrail} from './fx.js';

export function initMenu(){
  const btn = document.getElementById('hambtn');
  const drawer = document.getElementById('drawer');
  btn.addEventListener('click', ()=>{
    drawer.style.display = drawer.style.display==='flex' ? 'none':'flex';
    if(drawer.style.display!=='flex'){ drawer.style.display='flex'; drawer.style.flexDirection='column'; }
  });
  drawer.addEventListener('click', (e)=>{
    const a = e.target.closest('[data-route]');
    if(a){ e.preventDefault(); drawer.style.display='none'; routeTo(a.dataset.route); }
  });
}

export function drawHUD(){
  const avatars = document.getElementById('partyAvatars'); avatars.innerHTML='';
  const mk = (name, label)=>{
    const card = document.createElement('div'); card.className='card';
    const img = document.createElement('img'); img.alt=label; img.src='assets/'+name; img.className='base'; card.appendChild(img);
    const cap = document.createElement('div'); cap.className='avatar-name'; cap.textContent=label; card.appendChild(cap);
    return card;
  };
  avatars.appendChild(mk(S.party.you, 'You'));
  S.party.companions.forEach(n=>avatars.appendChild(mk(n.replace('YOU:',''), n.replace('YOU:',''))));
  document.getElementById('hudGold').textContent = '🪙 '+S.gold;
  document.getElementById('hudLvl').textContent = 'Lv '+S.level+' 🔥';
  document.getElementById('hudXp').style.width = (S.xp%100)+'%';
}

export function initGlobal(){
  cursorTrail();
  // Export/import
  document.getElementById('exportBtn').onclick=()=>{
    const blob = new Blob([JSON.stringify(S,null,2)], {type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='soothebirb.json'; a.click();
  };
  document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
  document.getElementById('importFile').onchange=(e)=>{
    const f=e.target.files[0]; if(!f) return;
    f.text().then(t=>{ try{ const o=JSON.parse(t); Object.assign(S,o); save(); location.reload(); }catch{} });
  };
}
