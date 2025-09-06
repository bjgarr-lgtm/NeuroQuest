
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.overlays = function(){
  // Baseline overlay: draws equipment layers over character/party portraits.
  const key="sb.v2.equip"; // { player: { items: ["cap","cape"] }, party: { "odin": {items:[...] } } }
  const data=JSON.parse(localStorage.getItem(key)||"{}");

  function applyTo(container){
    if(!container) return;
    // Expect images inside container; wrap each img with .sb-portrait and add layers
    container.querySelectorAll("img").forEach(img=>{
      if(img.closest(".sb-portrait")) return;
      const wrap=document.createElement("span"); wrap.className="sb-portrait"; img.replaceWith(wrap); wrap.appendChild(img);
      const layer=document.createElement("div"); layer.className="sb-layer"; wrap.appendChild(layer);
      // derive items for this portrait
      const who = (img.alt || img.getAttribute("data-name") || "player").toLowerCase();
      const items = (data.player?.items)||[];
      const partyItems=(data.party?.[who]?.items)||[];
      const all = [...new Set([...items, ...partyItems])];
      layer.innerHTML = all.map(s=>`<img src="assets/overlays/${s}.svg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;"/>`).join("");
    });
  }

  applyTo(document.querySelector("#partyBanner"));
  applyTo(document.querySelector(".party-banner"));
  applyTo(document.querySelector("#characterPortrait"));
};

// util to avoid rebinding
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX._bind = function(el, key){
  const k = "sbBind_"+key; if(el.dataset[k]) return false; el.dataset[k]=1; return true;
}
SB_HOTFIX.runAll = function(){
  try{ SB_HOTFIX.breathe(); }catch(e){}
  try{ SB_HOTFIX.journal(); }catch(e){}
  try{ SB_HOTFIX.shopping(); }catch(e){}
  try{ SB_HOTFIX.budget(); }catch(e){}
  try{ SB_HOTFIX.checkin(); }catch(e){}
  try{ SB_HOTFIX.settings(); }catch(e){}
  try{ SB_HOTFIX.calendar(); }catch(e){}
  try{ SB_HOTFIX.toddler(); }catch(e){}
  try{ SB_HOTFIX.overlays(); }catch(e){}
};
