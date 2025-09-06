
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.breathe = function(){
  const circle = document.querySelector("#breathCircle");
  const phaseEl = document.querySelector("#breathPhase");
  if(!circle || !SB_HOTFIX._bind(circle,"breath")) return;
  let timer=null, t=0, phase=0;
  const phases=[{label:"Inhale",secs:4,color:"#5ef"},{label:"Hold",secs:4,color:"#ffd166"},
                {label:"Exhale",secs:6,color:"#9bf"},{label:"Hold",secs:2,color:"#83e377"}];
  const total = phases.reduce((a,b)=>a+b.secs,0);
  function render(){
    const p=(t/total)*100; circle.style.setProperty("--p", p+"%");
  }
  function setPhase(i){ phase=i%phases.length; const ph=phases[phase]; circle.classList.add("play"); circle.style.outlineColor=ph.color; phaseEl&&(phaseEl.textContent=ph.label); }
  function tick(){
    t = (t+1)%total;
    let acc=0; for(let i=0;i<phases.length;i++){ acc+=phases[i].secs; if(t<acc){ setPhase(i); break; } }
    render();
  }
  circle.addEventListener("click",()=>{
    if(timer){ clearInterval(timer); timer=null; circle.classList.remove("play"); phaseEl&&(phaseEl.textContent="Ready"); circle.style.setProperty("--p","0%"); return; }
    t=0; setPhase(0); render(); timer=setInterval(tick,1000);
  });
};
