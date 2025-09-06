
import {S, save} from '../core/state.js';
export function pet(){
  const el=document.createElement('section'); el.className='section';
  if(!S.toddler){ el.innerHTML='<h2>Toddler Pet</h2><p>Enable Toddler Week in Co‑Op or Settings to play.</p>'; return el; }
  el.innerHTML='<h2>Your Companion Birb</h2><div class="section"><b>Toddler Coins:</b> <span id="coins">'+(S.toddlerCoins||0)+'</span></div>';
  const stage=document.createElement('div'); stage.className='section'; stage.style.display='flex'; stage.style.alignItems='end'; stage.style.gap='12px'; el.appendChild(stage);
  const img=new Image(); img.src='assets/birb.svg'; img.style.height='120px'; stage.appendChild(img);
  const owned=document.createElement('div'); owned.innerHTML='<h3>Accessories (owned)</h3>'; el.appendChild(owned);
  const shop=document.createElement('div'); shop.className='grid three'; el.appendChild(shop);
  const ACC=[['cap',1],['bow',1],['glasses',2],['scarf',2],['boots',3]];
  const draw=()=>{ owned.innerHTML='<h3>Accessories (owned)</h3>'+ (S.pet.owned||[]).map(id=>'<div>'+id+'</div>').join(''); };
  ACC.forEach(([id,cost])=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=(S.pet.owned||[]).includes(id)?'Owned '+id:`Buy ${id} ($${cost})`; b.onclick=()=>{ if((S.toddlerCoins||0)<cost) return; S.toddlerCoins-=cost; (S.pet.owned||=[]).push(id); save(); el.querySelector('#coins').textContent=S.toddlerCoins; draw(); }; shop.appendChild(b); });
  draw(); return el;
}
