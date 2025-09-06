
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.budget = function(){
  const pouch=document.querySelector("#goldPouch");
  const spend=document.querySelector("#thisSpend");
  const bar=document.querySelector("#budgetBar");
  const txn=document.querySelector("#txnList");
  const incBtn=document.querySelector("#addIncome");
  const expBtn=document.querySelector("#addExpense");
  const incLabel=document.querySelector("#incLabel");
  const incAmt=document.querySelector("#incAmt");
  const expLabel=document.querySelector("#expLabel");
  const expAmt=document.querySelector("#expAmt");
  if(!pouch || !SB_HOTFIX._bind(pouch,"budget")) return;

  const key="sb.v2.budget";
  const data=Object.assign({income:[],expenses:[],goal:500}, JSON.parse(localStorage.getItem(key)||"{}"));
  function fmt(n){return (n<0?"-":"") + "$" + Math.abs(n).toLocaleString();}
  function sum(a){return a.reduce((s,x)=>s+(+x.amt||0),0);}
  function render(){
    const inc=sum(data.income), exp=sum(data.expenses);
    const net = inc - exp;
    pouch.textContent = "$"+net.toLocaleString();
    spend.textContent = "$"+exp.toLocaleString();
    const pct = Math.min(100, Math.round((exp / (data.goal||1))*100));
    bar && (bar.style.width = pct+"%");
    txn && (txn.innerHTML = [...data.income.map(x=>({type:"income",...x})), ...data.expenses.map(x=>({type:"expense",...x}))]
      .sort((a,b)=>a.ts-b.ts)
      .reverse()
      .map(x=>`<div class="row"><span>${new Date(x.ts).toLocaleDateString()}</span><span style="flex:1">${x.label}</span><b style="color:${x.type==="income"?"#7df":"#ff8"}">${x.type==="income"?"+":"-"}$${(+x.amt).toLocaleString()}</b></div>`).join(""));
    localStorage.setItem(key, JSON.stringify(data));
  }
  incBtn?.addEventListener("click",()=>{
    if(!incAmt?.value) return; data.income.push({ts:Date.now(),label:(incLabel?.value||"Income"),amt:+incAmt.value}); render();
    if(incLabel) incLabel.value=""; if(incAmt) incAmt.value="";
  });
  expBtn?.addEventListener("click",()=>{
    if(!expAmt?.value) return; data.expenses.push({ts:Date.now(),label:(expLabel?.value||"Expense"),amt:+expAmt.value}); render();
    if(expLabel) expLabel.value=""; if(expAmt) expAmt.value="";
  });
  render();
};
