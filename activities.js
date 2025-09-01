// Breathing animation and prompts
export function startBreathing(circleEl, phaseEl, onFinish){
  const phases = [
    {name:"Inhale", secs:4},
    {name:"Hold", secs:4},
    {name:"Exhale", secs:6},
    {name:"Hold", secs:2},
  ];
  let active = true;
  let i=0;
  let totalSecs = 0;

  function step(){
    if(!active) return;
    const p = phases[i % phases.length];
    phaseEl.textContent = p.name;
    animateCircle(circleEl, p.name);
    const t = setTimeout(()=>{
      totalSecs += p.secs;
      i++;
      if(totalSecs >= 60){ active=false; onFinish(60); return; }
      step();
    }, p.secs*1000);
  }
  step();
  return () => { active=false; phaseEl.textContent="Ready"; circleEl.style.transform="scale(1)"; }
}

function animateCircle(el, phase){
  if(phase==="Inhale"){ el.style.transform = "scale(1.2)"; el.style.borderColor="var(--accent)"; }
  else if(phase==="Exhale"){ el.style.transform = "scale(0.85)"; el.style.borderColor="var(--accent-2)"; }
  else { el.style.transform = "scale(1)"; el.style.borderColor="var(--muted)"; }
}

export const PROMPTS = [
  "Name one tiny win from today.",
  "What do you need less of right now?",
  "Three things you’re grateful for:",
  "What would kindness toward yourself look like today?",
  "Finish this sentence: I feel most like me when…",
  "A thought to let go:",
  "A place that makes you breathe easier:",
  "Something you’re proud of this week:",
];
