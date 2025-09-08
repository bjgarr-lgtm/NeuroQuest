export async function init(root,S,update){
  root.innerHTML=`<section class="cardish"><h2 class="dash">Toddler Minigames</h2>
    <div class="grid" id="games"></div>
    <div id="host" class="cardish"></div>
  </section>`;
  const G=[['pop','Pop Bubbles'],['colors','Color Match'],['float','Balloon Float'],['simon','Simon Pads']];
  const grid=root.querySelector('#games'); grid.innerHTML=G.map(([id,l])=>`<button class="tile" data-id="${id}">${l}</button>`).join('');
  const host=root.querySelector('#host');
  grid.onclick=(e)=>{const b=e.target.closest('[data-id]'); if(!b) return; host.textContent='(demo host) game: '+b.dataset.id; S.toddler=S.toddler||{coins:0}; S.toddler.coins+=1; update({toddler:S.toddler}); };
}
