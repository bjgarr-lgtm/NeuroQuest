export async function init(root,S,update){
  S.clean=S.clean||{small:[],boss:{name:'Laundry Lich',p:0},raid:{name:'Garage Raid',notes:''}};
  root.innerHTML=`<section class="cardish">
    <h2 class="dash">Cleaning Dungeon</h2>
    <div class="grid2">
      <div class="cardish"><div class="dash">Small Quests</div><div id="small"></div><div class="row"><input id="newS" placeholder="Add..."><button id="addS">Add</button></div></div>
      <div class="cardish"><div class="dash">Weekly Boss</div>
        <div class="row"><input id="bossName" value="${S.clean.boss.name}"><button id="bossSet">Set</button><button id="bossTick">+10%</button></div>
        <div class="row"><div class="xp-bar" style="width:100%"><div id="bossBar" style="width:${S.clean.boss.p}%"></div></div><span>${S.clean.boss.p}%</span></div>
      </div>
    </div>
    <div class="cardish"><div class="dash">Monthly Raid</div>
      <div class="row"><input id="raidName" value="${S.clean.raid.name}"><button id="raidSet">Set</button></div>
      <textarea id="raidNotes" rows="4" placeholder="Plan...">${S.clean.raid.notes||''}</textarea>
    </div>
  </section>`;
  const small=root.querySelector('#small');
  function draw(){ small.innerHTML=(S.clean.small||[]).map((t,i)=>`<label class="row"><input data-i="${i}" type="checkbox" ${t.done?'checked':''}> ${t.title}</label>`).join('')||'<i>Nothing yet</i>'; root.querySelector('#bossBar').style.width=S.clean.boss.p+'%'; }
  draw();
  root.addEventListener('change',e=>{const c=e.target.closest('input[type=checkbox][data-i]'); if(!c) return; const i=+c.dataset.i; S.clean.small[i].done=c.checked; if(c.checked){S.xp+=3;S.gold+=1;} update({clean:S.clean,xp:S.xp,gold:S.gold});});
  root.querySelector('#addS').onclick=()=>{const v=root.querySelector('#newS').value.trim(); if(!v) return; (S.clean.small||[]).push({title:v,done:false}); root.querySelector('#newS').value=''; update({clean:S.clean}); draw();}
  root.querySelector('#bossSet').onclick=()=>{S.clean.boss.name=root.querySelector('#bossName').value; update({clean:S.clean});}
  root.querySelector('#bossTick').onclick=()=>{S.clean.boss.p=Math.min(100,(S.clean.boss.p||0)+10); if(S.clean.boss.p===100){S.gold+=10;S.xp+=25;} update({clean:S.clean,xp:S.xp,gold:S.gold}); draw();}
  root.querySelector('#raidSet').onclick=()=>{S.clean.raid.name=root.querySelector('#raidName').value; S.clean.raid.notes=root.querySelector('#raidNotes').value; update({clean:S.clean});}
}
