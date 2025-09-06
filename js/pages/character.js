import {load, save} from '../util/storage.js';

export default function renderCharacter(root){
  const s=load();
  s.party ??= {hero:null, companions:[]};
  s.wardrobe ??= {items:[],equipped:[]};

  root.innerHTML = `
    <h2>Character & Companions</h2>
    <section class="panel grid two">
      <div class="card">
        <h3>Your Hero</h3>
        <div class="party">
          <div class="hero">
            <div style="position:relative">
              <img id="heroImg" src="${s.party.hero?.src||'assets/icon.svg'}" alt="You" style="height:160px; border-radius:12px">
              <img id="overlay" style="position:absolute; left:8px; top:8px; height:60px; display:${s.wardrobe.equipped[0]?'block':'none'}">
            </div>
            <div class="row" style="margin-top:6px">
              <input type="file" id="heroFile" accept="image/*">
            </div>
          </div>
        </div>
        <div class="panel">
          <h4>Wardrobe</h4>
          <div id="wardList"></div>
          <div class="row"><input type="file" id="accFile" accept="image/*"><button id="addAcc" class="secondary">Add Accessory</button></div>
        </div>
      </div>
      <div class="card">
        <h3>Companions</h3>
        <div id="compList" class="grid two"></div>
        <div class="row"><input type="file" id="compFile" accept="image/*"><input id="compName" placeholder="Name"><button id="addComp" class="secondary">Add Companion</button></div>
      </div>
    </section>
  `;

  // hero image
  document.getElementById('heroFile').onchange=(e)=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ s.party.hero={src:r.result}; save(s); renderCharacter(root); }; r.readAsDataURL(f);
  };

  // accessories
  function drawWard(){
    const list=document.getElementById('wardList'); list.innerHTML='';
    (s.wardrobe.items||[]).forEach((it,i)=>{
      const row=document.createElement('div'); row.className='row';
      const img=document.createElement('img'); img.src=it.src; img.style.height='30px'; img.style.borderRadius='6px';
      const eq=document.createElement('button'); eq.textContent=s.wardrobe.equipped.includes(it.src)?'Unequip':'Equip'; eq.onclick=()=>{
        const on=s.wardrobe.equipped.includes(it.src);
        if(on) s.wardrobe.equipped=s.wardrobe.equipped.filter(x=>x!==it.src);
        else s.wardrobe.equipped=[it.src]; save(s); updateOverlay(); drawWard();
      };
      row.append(img, eq); list.appendChild(row);
    });
  }
  function updateOverlay(){
    const ov=document.getElementById('overlay');
    const eq=s.wardrobe.equipped[0]; if(eq){ ov.src=eq; ov.style.display='block'; } else { ov.style.display='none'; }
  }
  drawWard(); updateOverlay();

  document.getElementById('accFile').onchange=(e)=>{ /* hook to read file only */ };
  document.getElementById('addAcc').onclick=()=>{
    const inp=document.getElementById('accFile'); const f=inp.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ s.wardrobe.items.push({src:r.result}); save(s); drawWard(); }; r.readAsDataURL(f);
  };

  // companions
  function drawComp(){
    const list=document.getElementById('compList'); list.innerHTML='';
    (s.party.companions||[]).forEach((c,i)=>{
      const card=document.createElement('div'); card.className='card'; card.innerHTML=`<div class="hero"><img src="${c.src}" style="height:120px;border-radius:10px"><div class="name" style="background:#fff;color:#000;margin-top:6px">${c.name||'Friend'}</div></div>`;
      const rm=document.createElement('button'); rm.className='danger'; rm.textContent='Remove'; rm.onclick=()=>{ s.party.companions.splice(i,1); save(s); drawComp(); };
      card.appendChild(rm); list.appendChild(card);
    });
  }
  drawComp();
  document.getElementById('addComp').onclick=()=>{
    const f=document.getElementById('compFile').files?.[0]; if(!f) return; const name=document.getElementById('compName').value||'Friend';
    const r=new FileReader(); r.onload=()=>{ s.party.companions.push({src:r.result,name}); save(s); drawComp(); }; r.readAsDataURL(f);
  };
}
