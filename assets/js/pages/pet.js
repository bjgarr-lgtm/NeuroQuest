export async function init(root,S,update){
  S.toddler=S.toddler||{coins:0, owned:[], eq:[]};
  root.innerHTML=`<section class="cardish"><h2 class="dash">Toddler Pet</h2>
    <div class="row"><span>Coins: <b id="coins">${S.toddler.coins}</b></span></div>
    <div class="row"><img id="birb" src="assets/icons/calendar.svg" alt="birb" style="height:120px;border-radius:12px;border:1px solid #3a4f80"></div>
    <div class="grid"><button data-buy="cap">Cap (1)</button><button data-buy="bow">Bow (1)</button><button data-buy="glasses">Glasses (2)</button></div>
  </section>`;
  root.onclick=(e)=>{const b=e.target.closest('[data-buy]'); if(!b) return; const id=b.dataset.buy; const cost={cap:1,bow:1,glasses:2}[id];
    if(S.toddler.coins<cost) { alert('Not enough coins'); return; }
    S.toddler.coins-=cost; if(!S.toddler.owned.includes(id)) S.toddler.owned.push(id); update({toddler:S.toddler}); root.querySelector('#coins').textContent=S.toddler.coins;
  };
}
