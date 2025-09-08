export async function init(root,S,update){
  S.moods=S.moods||[];
  root.innerHTML=`<section class="cardish"><h2 class="dash">Mood Check‑In</h2>
    <div class="row" id="moods"><button data-m="awful">😖</button><button data-m="bad">☹️</button><button data-m="ok">😐</button><button data-m="good">🙂</button><button data-m="great">🤩</button></div>
    <div class="row"><input id="tags" placeholder="tags…"><input id="notes" placeholder="notes…"><button id="save" class="primary">Save</button></div>
    <div id="list" class="cardish"></div>
  </section>`;
  function draw(){ root.querySelector('#list').innerHTML=S.moods.slice(-20).reverse().map(m=>`<div>${new Date(m.ts).toLocaleString()} — ${m.mood} — ${m.tags||''} ${m.notes||''}</div>`).join('')||'<i>No moods yet</i>'; }
  draw();
  let current=null; root.querySelector('#moods').onclick=(e)=>{const b=e.target.closest('button[data-m]'); if(!b) return; current=b.dataset.m; [...e.currentTarget.children].forEach(x=>x.style.opacity=''); b.style.opacity='1'; }
  root.querySelector('#save').onclick=()=>{ if(!current) return alert('Pick a mood'); S.moods.push({ts:Date.now(), mood:current, tags:root.querySelector('#tags').value, notes:root.querySelector('#notes').value}); update({moods:S.moods}); draw(); };
}
