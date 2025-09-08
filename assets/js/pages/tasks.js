export async function init(root,S,update){
  S.tasks = S.tasks||{main:[],side:[],bonus:[]};
  root.innerHTML=`<section class="cardish">
    <h2 class="dash">Daily Quest Board</h2>
    <div class="grid2">
      ${panel('Main','main')}${panel('Side','side')}
    </div>
    ${panel('Bonus Loot','bonus')}
    <div class="cardish">
      <div class="row"><input id="tTitle" placeholder="Add a quest…">
      <select id="tTier"><option value="main">Main</option><option value="side">Side</option><option value="bonus">Bonus</option></select>
      <button id="tAdd" class="primary">Add</button></div>
    </div>
  </section>`;
  function panelize(){ ['main','side','bonus'].forEach(t=>{
    const el=root.querySelector('#list-'+t);
    el.innerHTML=(S.tasks[t]||[]).map((q,i)=>`<label class="row"><input data-tier="${t}" data-i="${i}" type="checkbox" ${q.done?'checked':''}> ${q.title}</label>`).join('')||'<i>Nothing yet</i>';
  }); }
  function panel(title,tier){ return `<div class="cardish"><div class="dash">${title}</div><div id="list-${tier}"></div></div>`; }
  panelize();
  root.addEventListener('change',e=>{
    const c=e.target.closest('input[type=checkbox][data-tier]'); if(!c) return;
    const {tier,i}=c.dataset; S.tasks[tier][i].done=c.checked;
    if(c.checked){ S.xp+=5; S.gold+=1; }
    update({tasks:S.tasks, xp:S.xp, gold:S.gold});
  });
  root.querySelector('#tAdd').onclick=()=>{
    const title = root.querySelector('#tTitle').value.trim(); const tier=root.querySelector('#tTier').value;
    if(!title) return;
    S.tasks[tier].push({title,done:false}); update({tasks:S.tasks}); root.querySelector('#tTitle').value=''; panelize();
  };
}
