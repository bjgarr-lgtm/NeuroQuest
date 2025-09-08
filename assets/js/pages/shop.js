export async function init(root,S,update){
  S.shop=S.shop||[];
  root.innerHTML=`<section class="cardish"><h2 class="dash">Shopping List</h2>
    <div id="list"></div>
    <div class="row"><input id="txt" placeholder="Add item…"><button id="add" class="primary">Add</button></div>
  </section>`;
  function draw(){ const L=root.querySelector('#list'); L.innerHTML=S.shop.map((t,i)=>`<label class="row"><input data-i="${i}" type="checkbox" ${t.done?'checked':''}> ${t.title}</label>`).join('')||'<i>Empty</i>'; }
  draw();
  root.querySelector('#add').onclick=()=>{ const v=root.querySelector('#txt').value.trim(); if(!v) return; S.shop.push({title:v,done:false}); update({shop:S.shop}); draw(); }
  root.addEventListener('change',e=>{const c=e.target.closest('input[data-i]'); if(!c) return; const i=+c.dataset.i; S.shop[i].done=c.checked; update({shop:S.shop}); });
}
