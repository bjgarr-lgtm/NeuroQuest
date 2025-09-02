// Companion rendering (simple SVG-based critters) and accessories
export function petSVG(species, level, acc=[]){
  // base body
  const core = {
    birb: `<ellipse cx="60" cy="70" rx="40" ry="35" fill="url(#g)"/><circle cx="60" cy="52" r="18" fill="url(#g)"/>
           <circle cx="52" cy="48" r="4" fill="#111"/><circle cx="68" cy="48" r="4" fill="#111"/>
           <polygon points="60,55 56,60 64,60" fill="#ffc66d"/>`,
    sprout:`<rect x="30" y="45" width="60" height="55" rx="16" fill="url(#g)"/>
            <circle cx="60" cy="40" r="8" fill="#64d66a"/><ellipse cx="54" cy="38" rx="6" ry="3" fill="#64d66a"/><ellipse cx="66" cy="38" rx="6" ry="3" fill="#64d66a"/>`,
    blob:  `<circle cx="60" cy="70" r="38" fill="url(#g)"/>
            <circle cx="48" cy="64" r="5" fill="#111"/><circle cx="72" cy="64" r="5" fill="#111"/>`
  }[species] || ""

  const defs = `<defs><radialGradient id="g" cx=".5" cy=".35"><stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--accent-2)"/></radialGradient></defs>`;

  const levelBadge = `<text x="10" y="18" font-size="12" fill="rgba(0,0,0,.65)">Lv.</text>
                      <rect x="28" y="6" rx="6" ry="6" width="26" height="16" fill="rgba(0,0,0,.35)"/>
                      <text x="41" y="18" text-anchor="middle" font-weight="700" fill="#fff">${level}</text>`;

  const accSVG = accessories(acc);

  return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Companion">
    ${defs}
    <rect x="0" y="0" width="120" height="120" rx="22" fill="rgba(0,0,0,.15)"/>
    ${core}
    ${accSVG}
    ${levelBadge}
  </svg>`;
}

// Pixel-art variant used by certain UI views. This keeps the rendering simple
// and leverages the existing vector pet while forcing pixelated rendering so
// it matches the app's retro aesthetic. Having this helper prevents runtime
// reference errors when toddler mode is enabled.
export function petPixelSVG(species, level, acc = []) {
  return petSVG(species, level, acc).replace(
    '<svg',
    '<svg style="image-rendering:pixelated"'
  );
}

function accessories(list){
  const set = new Set(list);
  let s = "";
  if(set.has("cap")) s += `<path d="M42 40 q18 -16 36 0 v8 h-36z" fill="#1f2937"/>`;
  if(set.has("bow")) s += `<path d="M52 78 q-12 -4 0 -8 q12 4 0 8z" fill="#e11d48"/><path d="M68 78 q12 -4 0 -8 q-12 4 0 8z" fill="#e11d48"/><circle cx="60" cy="76" r="6" fill="#be123c"/>`;
  if(set.has("glasses")) s += `<circle cx="50" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><circle cx="70" cy="48" r="7" stroke="#111" stroke-width="2" fill="none"/><line x1="57" y1="48" x2="63" y2="48" stroke="#111" stroke-width="2"/>`;
  if(set.has("leaf")) s += `<path d="M84 28 q12 6 -2 16 q-12 -6 2 -16z" fill="#22c55e"/>`;
  if(set.has("star")) s += `<polygon points="60,22 65,34 78,34 67,41 71,54 60,46 49,54 53,41 42,34 55,34" fill="#f59e0b"/>`;
  return s;
}

export const ALL_ACC = [
  { id:"cap", name:"Cap" }, { id:"bow", name:"Bow" }, { id:"glasses", name:"Glasses" },
  { id:"leaf", name:"Leaf" }, { id:"star", name:"Star" }
];
