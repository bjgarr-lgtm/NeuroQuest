export async function init(root,S,update){
  S.meals=S.meals||{days:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], items:{} };
  root.innerHTML=`<section class="cardish"><h2 class="dash">Meal Planner</h2>
    <div class="grid" id="grid"></div>
    <div class="row"><input id="mealTxt" placeholder="Add meal for today"><button id="mealAdd">Add</button></div>
  </section>`;
  function draw(){ const g=root.querySelector('#grid'); g.innerHTML=S.meals.days.map((d,i)=>`<div class="cardish"><b>${d}</b><div>${(S.meals.items[i]||[]).map(m=>`<div>• ${m}</div>`).join('')||'<i>None</i>'}</div></div>`).join(''); }
  draw();
  root.querySelector('#mealAdd').onclick=()=>{ const v=root.querySelector('#mealTxt').value.trim(); if(!v) return; const i=(new Date()).getDay(); (S.meals.items[i]||(S.meals.items[i]=[])).push(v); update({meals:S.meals}); draw(); }
}
