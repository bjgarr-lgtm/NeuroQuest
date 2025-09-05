
// hotfix-fx.js — small helpers (toast, modal, confetti crown)
(function(){
  const STYLE = `
  .sb-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);
    background:#111a;border:1px solid #8af;backdrop-filter:blur(6px);
    color:#dff;padding:.6rem 1rem;border-radius:10px;font-family:monospace;z-index:99999}
  .sb-modal{position:fixed;inset:0;background:linear-gradient(#0009,#000c);display:flex;align-items:center;justify-content:center;z-index:99998}
  .sb-card{max-width:680px;width:92%;background:#0b0e18;border:1px solid #8af;padding:1rem;border-radius:14px;box-shadow:0 0 40px #9cf2}
  .sb-card h3{margin:0 0 .5rem 0}
  .sb-btn{border:1px solid #8af;border-radius:10px;background:#05121f;color:#e2f; padding:.5rem .9rem;cursor:pointer}
  .sb-row{display:flex;gap:.75rem;align-items:center;justify-content:flex-end;margin-top:1rem}
  `;
  const style = document.createElement('style'); style.textContent = STYLE; document.head.appendChild(style);

  window.sbToast = (msg, ms=1400) => {
    const t = document.createElement('div');
    t.className='sb-toast'; t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), ms);
  };

  window.sbModal = (title, bodyHTML) => {
    const m = document.createElement('div'); m.className='sb-modal';
    m.innerHTML = `<div class="sb-card"><h3>${title}</h3><div>${bodyHTML||''}</div>
      <div class="sb-row"><button class="sb-btn" id="sbClose">Close</button></div></div>`;
    m.addEventListener('click', (e)=>{ if(e.target.id==='sbClose'|| e.target===m) m.remove();});
    document.body.appendChild(m); return m;
  };

  // Crown confetti light
  window.sbCrown = (parent=document.body) => {
    const crown = document.createElement('div');
    crown.style.cssText = `position:fixed;left:50%;top:18%;transform:translateX(-50%);
      width:120px;height:80px;z-index:9999;filter:drop-shadow(0 0 10px #fc3)`;
    crown.innerHTML = `<svg viewBox="0 0 200 120">
      <polygon points="0,120 200,120 160,40 100,90 40,30" fill="#f7c200" stroke="#945" stroke-width="6"/>
      <circle cx="40" cy="30" r="12" fill="#ff9"/>
      <circle cx="100" cy="40" r="12" fill="#ff9"/>
      <circle cx="160" cy="40" r="12" fill="#ff9"/>
    </svg>`;
    parent.appendChild(crown);
    setTimeout(()=>crown.remove(),1200);
    // simple sparkles
    for(let i=0;i<30;i++){
      const s=document.createElement('div');
      s.style.cssText=`position:fixed;left:${50+Math.random()*14-7}%;top:${18+Math.random()*6}%;width:6px;height:6px;border-radius:50%;background:hsl(${40+Math.random()*40} 90% 60%);z-index:9999`;
      document.body.appendChild(s);
      const dx=(Math.random()*2-1)*200, dy=200+Math.random()*150;
      s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy}px)`,opacity:0}],{duration:800+Math.random()*600, easing:'ease-out'}).onfinish=()=>s.remove();
    }
  };
})();
