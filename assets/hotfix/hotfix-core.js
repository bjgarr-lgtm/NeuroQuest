
(()=>{
  const ready = (fn)=> (document.readyState!=="loading") ? fn() : document.addEventListener("DOMContentLoaded",fn);
  const once = (el,mark)=>{ if(el && !el.dataset[mark]){ el.dataset[mark]=1; return true } return false; };

  // Observe route/view swaps
  function hookView(observerFn){
    const view = document.querySelector("#view") || document.body;
    const mo = new MutationObserver(()=> observerFn());
    mo.observe(view,{childList:true,subtree:true});
    observerFn();
  }

  function buildBurger(){
    if(document.querySelector("#sb-burger")) return;
    const btn=document.createElement("button"); btn.id="sb-burger"; btn.title="Menu"; btn.innerHTML="<span></span>";
    const drawer=document.createElement("div"); drawer.id="sb-drawer";
    document.body.append(btn,drawer);
    btn.addEventListener("click",()=>drawer.classList.toggle("open"));
    // clone nav buttons
    const nav=document.querySelector(".top-nav")||document.querySelector("nav"); 
    if(nav){
      drawer.innerHTML="";
      nav.querySelectorAll("button.nav-btn,[data-route]").forEach(b=>{
        const d=document.createElement("button");
        d.className="drawer-btn";
        d.textContent=b.textContent.trim();
        const r=b.dataset.route;
        d.addEventListener("click",()=>{ drawer.classList.remove("open"); if(r) window.location.hash="#"+r; b.click?.(); });
        drawer.appendChild(d);
      });
    }
  }

  ready(()=>{
    buildBurger();
    hookView(()=>{
      try{ window.SB_HOTFIX && window.SB_HOTFIX.runAll(); }catch(e){ /* noop */ }
    });
  });
})();
