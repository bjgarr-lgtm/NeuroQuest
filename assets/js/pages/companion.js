export async function init(root,S,update){
  root.innerHTML=`<section class="cardish">
    <h2 class="dash">Choose Companions</h2>
    <div class="grid" id="grid"></div>
    <div class="row"><button id="clear" class="danger">Clear Party</button></div>
  </section>`;
  const grid=root.querySelector('#grid');
  const list=['ash','odin','fox','molly'];
  function render(){
    grid.innerHTML=list.map(id=>{
      const on=(S.party.members||[]).includes(id);
      return `<button class="card" data-id="${id}" style="display:flex;gap:8px;align-items:center">
        <img src="${src(id)}" style="height:64px;width:64px;border-radius:12px;border:1px solid #3a4f80"> <div>${id} ${on?'✓':''}</div>
      </button>`;
    }).join('');
  }
  render();
  grid.onclick=(e)=>{const b=e.target.closest('[data-id]'); if(!b) return; const id=b.dataset.id;
    const set=new Set(S.party.members||[]); if(set.has(id)) set.delete(id); else set.add(id);
    S.party.members=[...set]; update({party:S.party}); render();
  };
  root.querySelector('#clear').onclick=()=>{ S.party.members=[]; update({party:S.party}); render(); };
}
function src(id){ const m={bambi:'assets/characters/hero-bambi.png',ash:'assets/characters/hero-ash.png',odin:'assets/characters/hero-odin.png',fox:'assets/characters/hero-fox.png',molly:'assets/characters/comp-molly.png'}; return m[id]||m['bambi']; }
