export async function init(root,S,update){
  S.journal=S.journal||[];
  root.innerHTML=`<section class="cardish"><h2 class="dash">Journal</h2>
    <div class="row"><textarea id="text" rows="5" style="flex:1" placeholder="Let it out…"></textarea></div>
    <div class="row"><button id="save" class="primary">Save</button></div>
    <div id="list" class="cardish"></div>
  </section>`;
  function draw(){ root.querySelector('#list').innerHTML=S.journal.slice(-20).reverse().map(e=>`<div>${new Date(e.ts).toLocaleString()} — ${e.text}</div>`).join('')||'<i>No entries</i>'; }
  draw();
  root.querySelector('#save').onclick=()=>{ const text=root.querySelector('#text').value.trim(); if(!text) return; S.journal.push({ts:Date.now(),text}); update({journal:S.journal}); draw(); root.querySelector('#text').value=''; };
}
