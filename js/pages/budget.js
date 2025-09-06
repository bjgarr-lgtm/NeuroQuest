
import {S, save} from '../core/state.js';
export function budget(){
  const el=document.createElement('section'); el.className='section';
  const net = S.budget.income.reduce((a,b)=>a+b.amt,0) - S.budget.expenses.reduce((a,b)=>a+b.amt,0);
  const spend = S.budget.expenses.reduce((a,b)=>a+b.amt,0);
  el.innerHTML=`<h2>Budget Tracker</h2>
  <div class="grid two">
    <div class="section"><div class="k">Gold Pouch</div><div class="v" id="pouch">$${net.toFixed(2)}</div></div>
    <div class="section"><div class="k">This Week's Spend</div><div class="v">$${spend.toFixed(2)}</div></div>
  </div>
  <div class="section"><div class="k">Budget Goal</div><div class="xp"><div id="goalbar" style="width:${Math.min(100,Math.max(0,(net/S.budget.goal)*100))}%"></div></div></div>
  <div class="grid two">
    <div class="section"><h3>New Income</h3><input id="incL" placeholder="Label"/><input id="incA" type="number" placeholder="Amount"/><button id="addInc" class="btn">+ Add</button><div id="incList"></div></div>
    <div class="section"><h3>New Expense</h3><input id="expL" placeholder="Label"/><input id="expA" type="number" placeholder="Amount"/><button id="addExp" class="btn danger">− Add</button><div id="expList"></div></div>
  </div>`;
  const draw=()=>{
    el.querySelector('#incList').innerHTML=S.budget.income.map(i=>`<div>+ $${i.amt.toFixed(2)} — ${i.label}</div>`).join('');
    el.querySelector('#expList').innerHTML=S.budget.expenses.map(i=>`<div>− $${i.amt.toFixed(2)} — ${i.label}</div>`).join('');
  }; draw();
  el.querySelector('#addInc').onclick=()=>{ const l=el.querySelector('#incL').value; const a=parseFloat(el.querySelector('#incA').value); if(a){ S.budget.income.push({label:l,amt:a}); save(); location.hash='#budget'; } };
  el.querySelector('#addExp').onclick=()=>{ const l=el.querySelector('#expL').value; const a=parseFloat(el.querySelector('#expA').value); if(a){ S.budget.expenses.push({label:l,amt:a}); save(); location.hash='#budget'; } };
  return el;
}
