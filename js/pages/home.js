
import {S, save, addXP, addGold} from '../core/state.js';
import {confetti, crownDrop} from '../core/fx.js';

function heroWithOverlays(src){
  const wrap=document.createElement('div'); wrap.className='hero';
  const img=new Image(); img.src='assets/'+src; img.className='base'; wrap.appendChild(img);
  // overlays only for your hero
  if(src===S.party.you){
    const map={ 'copper-crown':['crown.svg',{top:'-6px',left:'22px',width:'120px'}],
               'adventure-cap':['cap.svg',{top:'10px',left:'14px',width:'120px'}],
               'adventurer-cloak':['cloak.svg',{bottom:'-10px',left:'0',width:'180px'}],
               'torch':['torch.svg',{right:'-10px',bottom:'10px',width:'60px'}] };
    (S.wardrobe.equipped||[]).forEach(id=>{
      const [file,style]=map[id]||[]; if(!file) return; const o=new Image(); o.src='assets/'+file; o.className='overlay';
      Object.assign(o.style, style); wrap.appendChild(o);
    });
  }
  return wrap;
}

export function home(){
  const s=document.createElement('section'); s.className='section banner';
  const row=document.createElement('div'); row.className='row';
  const label=document.createElement('div'); label.innerHTML='<div style="font-size:20px;opacity:.8">Your Party</div>';
  row.appendChild(label);
  row.appendChild(heroWithOverlays(S.party.you));
  S.party.companions.forEach(c=>row.appendChild(heroWithOverlays(c)));
  s.appendChild(row);

  // Tiles
  const tiles=document.createElement('div'); tiles.className='tile-grid';
  const links=[['tasks','Daily Planner'],['rewards','Rewards'],['clean','Cleaning'],['coop','Co‑Op'],['calendar','Calendar'],
               ['shop','Shopping'],['budget','Budget'],['meals','Meals'],['character','Character'],['companion','Companion']];
  if(S.toddler){ links.push(['pet','Toddler Pet']); links.push(['minigames','Minigames']); }
  for(const [r,label] of links){
    const a=document.createElement('a'); a.className='tile'; a.textContent=label; a.onclick=()=>{location.hash='#'+r}; tiles.appendChild(a);
  }
  s.appendChild(tiles);
  return s;
}
