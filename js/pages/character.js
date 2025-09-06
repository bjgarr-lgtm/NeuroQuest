
import {S, save} from '../core/state.js';
import {confetti} from '../core/fx.js';

const heroes=['hero-ash.png','hero-odin.png','hero-bambi.png','hero-fox.png'];
const catalog=[
  {id:'copper-crown',label:'Copper Crown',file:'crown.svg'},
  {id:'adventure-cap',label:'Adventure Cap',file:'cap.svg'},
  {id:'adventurer-cloak',label:'Adventurer Cloak',file:'cloak.svg'},
  {id:'torch',label:'Torch',file:'torch.svg'},
];

export function character(){
  const el=document.createElement('section'); el.className='section';
  freebies();
  el.innerHTML='<h2>Your hero</h2>';
  const row=document.createElement('div'); row.className='grid two'; el.appendChild(row);

  const pick=document.createElement('div'); pick.className='section'; pick.innerHTML='<h3>Choose portrait</h3>';
  const grid=document.createElement('div'); grid.className='grid two'; pick.appendChild(grid);
  heroes.forEach(h=>{ const b=document.createElement('button'); b.className='btn'; b.innerHTML='<img src="assets/'+h+'" style="height:80px">'; b.onclick=()=>{ S.party.you=h; save(); confetti(); }; grid.appendChild(b); });
  row.appendChild(pick);

  const inv=document.createElement('div'); inv.className='section'; inv.innerHTML='<h3>Wardrobe</h3>';
  const owned=document.createElement('div'); owned.id='owned'; inv.appendChild(owned);
  const equip=document.createElement('div'); equip.id='equip'; equip.style.marginTop='8px'; inv.appendChild(equip);
  row.appendChild(inv);

  function draw(){
    owned.innerHTML='';
    catalog.forEach(it=>{
      const has=(S.wardrobe.owned||[]).includes(it.id);
      const b=document.createElement('button'); b.className='btn'; b.textContent=(has?'Owned: ':'Get ')+it.label;
      b.onclick=()=>{ if(!has){ (S.wardrobe.owned||=[]).push(it.id); save(); draw(); } };
      owned.appendChild(b);
    });
    equip.innerHTML='<h4>Equipped</h4>';
    (S.wardrobe.owned||[]).forEach(id=>{
      const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=(S.wardrobe.equipped||[]).includes(id);
      chk.onchange=()=>{ const i=(S.wardrobe.equipped||[]).indexOf(id); if(chk.checked&&i<0)(S.wardrobe.equipped||=[]).push(id); if(!chk.checked&&i>=0) S.wardrobe.equipped.splice(i,1); save(); };
      const lab=document.createElement('label'); lab.style.display='flex'; lab.style.gap='6px'; lab.append(chk,document.createTextNode(id)); equip.appendChild(lab);
    });
  }
  draw();
  return el;
}

function freebies(){ if(!S.wardrobe.owned) S.wardrobe.owned=[]; ['copper-crown','adventurer-cloak','torch'].forEach(i=>{ if(!S.wardrobe.owned.includes(i)) S.wardrobe.owned.push(i); }); save(); }
