export async function init(root,S,update){
  S.budget=S.budget||{tx:[],goal:500};
  function totals(){ const inc=S.budget.tx.filter(t=>t.type==='inc').reduce((a,b)=>a+b.amt,0); const exp=S.budget.tx.filter(t=>t.type==='exp').reduce((a,b)=>a+b.amt,0); return {inc,exp,bal:inc-exp}; }
  const T=totals();
  root.innerHTML=`<section class="cardish"><h2 class="dash">Budget</h2>
    <div class="grid2">
      <div class="cardish"><div class="dash">Gold Pouch</div><div><b>$${T.bal.toFixed(2)}</b></div></div>
      <div class="cardish"><div class="dash">This Week</div><div>+ $${T.inc.toFixed(2)} / − $${T.exp.toFixed(2)}</div></div>
    </div>
    <div class="cardish"><div class="dash">Budget Goal</div><div class="xp-bar" style="width:100%"><div id="bBar" style="width:${Math.min(100,(T.bal/S.budget.goal*100)||0)}%"></div></div></div>
    <div class="grid2">
      <div class="cardish"><h3>New Income</h3><div class="row"><input id="incLbl" placeholder="Label"><input id="incAmt" type="number" placeholder="Amount"></div><button id="incAdd" class="primary">+ Add Income</button></div>
      <div class="cardish"><h3>New Expense</h3><div class="row"><input id="expLbl" placeholder="Label"><input id="expAmt" type="number" placeholder="Amount"></div><button id="expAdd" class="danger">− Add Expense</button></div>
    </div>
    <div class="cardish"><h3>Recent</h3><div id="list"></div></div>
  </section>`;
  function drawList(){ const L=root.querySelector('#list'); L.innerHTML=S.budget.tx.slice(-20).reverse().map(t=>`<div>${t.type==='inc'?'+':'−'} $${t.amt.toFixed(2)} • ${t.label}</div>`).join('')||'<i>None</i>'; }
  drawList();
  root.querySelector('#incAdd').onclick=()=>{ const label=root.querySelector('#incLbl').value.trim(); const amt=parseFloat(root.querySelector('#incAmt').value); if(!label||!amt) return;
    S.budget.tx.push({type:'inc',label,amt}); S.gold+=Math.round(amt/10); update({budget:S.budget,gold:S.gold}); init(root,S,update); }
  root.querySelector('#expAdd').onclick=()=>{ const label=root.querySelector('#expLbl').value.trim(); const amt=parseFloat(root.querySelector('#expAmt').value); if(!label||!amt) return;
    S.budget.tx.push({type:'exp',label,amt}); update({budget:S.budget}); init(root,S,update); }
}
