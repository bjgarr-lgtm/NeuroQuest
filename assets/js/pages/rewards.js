export async function init(root,S,update){
  S.rewards=S.rewards||{badges:[]};
  // Earn a badge when XP crosses multiples of 100
  const lvl = Math.floor((S.xp||0)/100);
  while((S.rewards.badges||[]).length<lvl){ (S.rewards.badges||[]).push({ts:Date.now(),label:'Level '+(S.rewards.badges.length+1)}); }
  root.innerHTML=`<section class="cardish"><h2 class="dash">Rewards</h2>
    <div class="badges">${(S.rewards.badges||[]).map(b=>`<span class="badge">🏅 ${b.label}</span>`).join('')||'<i>No rewards yet</i>'}</div>
  </section>`;
  update({rewards:S.rewards});
}
