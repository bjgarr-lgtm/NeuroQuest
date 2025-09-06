
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.settings = function(){
  const name=document.querySelector("#userName");
  const theme=document.querySelector("#themeSelect");
  const font=document.querySelector("#fontSelect");
  const art=document.querySelector("#artSelect");
  const scan=document.querySelector("#scanlinesToggle");
  const todd=document.querySelector("#toddlerToggle");
  const save=document.querySelector("#saveSettings");
  const reset=document.querySelector("#resetApp");

  if(!save || !SB_HOTFIX._bind(save,"settings")) return;

  const key="sb.v2.settings";
  const S=Object.assign({name:"",theme:"retro",font:"press2p",art:"pixel",scanlines:true,toddler:false}, JSON.parse(localStorage.getItem(key)||"{}"));

  function apply(){
    if(name) name.value=S.name;
    if(theme) theme.value=S.theme;
    if(font) font.value=S.font;
    if(art) art.value=S.art;
    if(scan) scan.checked=!!S.scanlines;
    if(todd) todd.checked=!!S.toddler;
    document.documentElement.classList.toggle("theme-retro", S.theme==="retro");
    document.body.classList.toggle("crt", !!S.scanlines);
    // toddler gating
    document.querySelectorAll(".toddler-only").forEach(el=> el.classList.toggle("toddler-hidden", !S.toddler));
  }
  function persist(){ localStorage.setItem(key, JSON.stringify(S)); apply(); }
  save.addEventListener("click",()=>{
    if(name) S.name=name.value;
    if(theme) S.theme=theme.value;
    if(font) S.font=font.value;
    if(art) S.art=art.value;
    if(scan) S.scanlines=!!scan.checked;
    if(todd) S.toddler=!!todd.checked;
    persist();
  });
  reset?.addEventListener("click",()=>{ if(!confirm("Reset all local data?")) return;
    localStorage.clear(); location.reload();
  });
  apply();
};
