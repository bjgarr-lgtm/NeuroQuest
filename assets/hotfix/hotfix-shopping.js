
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.shopping = function(){
  const list=document.querySelector("#shopList");
  const add=document.querySelector("#addShop");
  const input=document.querySelector("#shopItem");
  if(!list || !SB_HOTFIX._bind(list,"shop")) return;
  const key="sb.v2.shop"; const items=JSON.parse(localStorage.getItem(key)||"[]");
  function render(){
    list.innerHTML = items.map((it,i)=>`
      <label class="row"><input type="checkbox" ${it.done?"checked":""} data-i="${i}"/>
      <span style="flex:1">${it.text}</span><button class="secondary" data-del="${i}">Remove</button></label>`).join("");
  }
  list.addEventListener("change",(e)=>{
    const i=e.target.dataset.i; if(i==null) return; items[i].done=e.target.checked; localStorage.setItem(key,JSON.stringify(items));
  });
  list.addEventListener("click",(e)=>{
    const i=e.target.dataset.del; if(i==null) return; items.splice(+i,1); localStorage.setItem(key,JSON.stringify(items)); render();
  });
  add?.addEventListener("click",()=>{ const t=(input?.value||"").trim(); if(!t) return; items.push({text:t,done:false}); input.value=""; localStorage.setItem(key,JSON.stringify(items)); render(); });
  render();
};
