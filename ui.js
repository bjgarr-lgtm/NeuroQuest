// Tiny DOM helpers and routing
export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));

export function routeTo(name){
  window.location.hash = name;
}

export function setActiveNav(name){
  $$(".nav-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.route===name);
  });
}

export function el(tag, opts={}, children=[]){
  const e = document.createElement(tag);
  Object.assign(e, opts);
  for(const [k,v] of Object.entries(opts.attrs||{})){ e.setAttribute(k,v); }
  if(typeof children === "string"){ e.innerHTML = children; }
  else children.forEach(c=> e.appendChild(c));
  return e;
}

export function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {month:"short", day:"numeric"});
}

export function sparkline(svg, values){
  const W=320, H=64;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  if(!values.length){ svg.innerHTML=""; return; }
  const max = Math.max(...values), min = Math.min(...values);
  const norm = v => (H-4) - ((v-min)/(max-min||1))*(H-8);
  const step = W/Math.max(1, values.length-1);
  let d="M 0 "+norm(values[0]);
  values.forEach((v,i)=> d += ` L ${i*step} ${norm(v)}`);
  svg.innerHTML = `<path d="${d}" fill="none" stroke="var(--accent-2)" stroke-width="2"/>`;
}
