export async function init(root,S,update){
  root.innerHTML=`
  <section class="cardish">
    <div class="party-banner">
      <div class="party-members" id="partyBanner"></div>
      <div class="row"><button data-go="characters">Change Character</button><button data-go="companion">Choose Companions</button></div>
    </div>
    <div class="grid">
      <a class="tile" data-go="tasks">Daily Planner</a>
      <a class="tile" data-go="rewards">Rewards</a>
      <a class="tile" data-go="clean">Cleaning</a>
      <a class="tile" data-go="coop">Co‑Op</a>
      <a class="tile" data-go="calendar">Calendar</a>
      <a class="tile" data-go="shop">Shopping</a>
      <a class="tile" data-go="budget">Budget</a>
      <a class="tile" data-go="meals">Meals</a>
      <a class="tile" data-go="breathe">Breathe</a>
      <a class="tile" data-go="journal">Journal</a>
      <a class="tile" data-go="checkin">Check‑In</a>
      <a class="tile" data-go="minigames">Toddler Hub</a>
    </div>
  </section>`;
  const banner=root.querySelector('#partyBanner');
  const ids=[S.party.leader, ...(S.party.members||[])].filter(Boolean);
  banner.innerHTML = ids.map(id=>`<img src="${imgSrc(id)}" alt="${id}">`).join('');
  root.querySelectorAll('[data-go]').forEach(n=>n.onclick=()=>location.hash='#'+n.dataset.go);
}
function imgSrc(id){ const m={bambi:'assets/characters/hero-bambi.png',ash:'assets/characters/hero-ash.png',odin:'assets/characters/hero-odin.png',fox:'assets/characters/hero-fox.png',molly:'assets/characters/comp-molly.png'}; return m[id]||m['bambi']; }
