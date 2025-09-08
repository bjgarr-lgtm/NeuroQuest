export async function init(root,S,update){
  S.coop=S.coop||{ toddler:false, week:'solo', sidekick:[], collect:[] };
  root.innerHTML=`<section class="cardish">
    <h2 class="dash">Co‑Op / Toddler Hub</h2>
    <div class="row"><button id="togWeek">${S.coop.week==='toddler'?'Toddler Week':'Solo Week'}</button><button id="openGames">Open Toddler Games</button></div>
    <div class="grid2">
      <div class="cardish"><div class="dash">Sidekick Quests</div><div id="sk"></div><div class="row"><input id="skTxt" placeholder="Add..."><button id="skAdd">Add</button></div></div>
      <div class="cardish"><div class="dash">Collectibles</div><div id="col"></div><div class="row"><input id="coTxt" placeholder="Add..."><button id="coAdd">Add</button></div></div>
    </div>
  </section>`;
  function draw(){
    const sk=root.querySelector('#sk'); sk.innerHTML=(S.coop.sidekick||[]).map((t,i)=>`<label class="row"><input data-i="${i}" type="checkbox" ${t.done?'checked':''}> ${t.title}</label>`).join('')||'<i>None</i>';
    const col=root.querySelector('#col'); col.innerHTML=(S.coop.collect||[]).map((t,i)=>`<label class="row"><input data-ci="${i}" type="checkbox" ${t.done?'checked':''}> ${t.title}</label>`).join('')||'<i>None</i>';
  }
  draw();
  root.onclick=(e)=>{
    const c=e.target.closest('input[data-i]'); if(c){const i=+c.dataset.i; S.coop.sidekick[i].done=c.checked; update({coop:S.coop}); return;}
    const d=e.target.closest('input[data-ci]'); if(d){const i=+d.dataset.ci; S.coop.collect[i].done=d.checked; update({coop:S.coop}); return;}
  };
  root.querySelector('#skAdd').onclick=()=>{const v=root.querySelector('#skTxt').value.trim(); if(!v) return; (S.coop.sidekick||[]).push({title:v,done:false}); update({coop:S.coop}); draw();}
  root.querySelector('#coAdd').onclick=()=>{const v=root.querySelector('#coTxt').value.trim(); if(!v) return; (S.coop.collect||[]).push({title:v,done:false}); update({coop:S.coop}); draw();}
  root.querySelector('#togWeek').onclick=()=>{ S.coop.week = S.coop.week==='toddler'?'solo':'toddler'; update({coop:S.coop}); location.hash='#minigames'; }
  root.querySelector('#openGames').onclick=()=>location.hash='#minigames';
}
