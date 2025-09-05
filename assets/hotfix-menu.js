
// hotfix-menu.js — hide Pet tab, gate Minigames by toddler-mode, tiny burger
(function(){
  const ensureBurger = () => {
    if(document.querySelector('.sb-burger')) return;
    const header = document.querySelector('.app-header'); if(!header) return;
    const btn = document.createElement('button');
    btn.className='sb-burger'; btn.textContent='☰';
    btn.style.cssText='position:absolute;left:6px;top:6px;background:#0006;border:1px solid #678;border-radius:8px;color:#9df;padding:.2rem .5rem;cursor:pointer;z-index:5';
    header.appendChild(btn);
    const nav=document.querySelector('.top-nav');
    btn.addEventListener('click',()=>{
      nav.style.display = (nav.style.display==='none'?'':'none');
      setTimeout(()=>nav.style.display='', 7000);
    });
  };

  const hidePetShowMini = () => {
    const qs=(s)=>Array.from(document.querySelectorAll(s));
    // Hide Companion "Pet" tab if it exists (legacy)
    qs('[data-route="pet"]').forEach(el=>el.style.display='none');
    const toddler = JSON.parse(localStorage.getItem('settings.toddler')||'false');
    qs('[data-route="minigames"]').forEach(el=>el.style.display = toddler ? '' : 'none');
  };

  window.addEventListener('DOMContentLoaded', ()=>{ ensureBurger(); hidePetShowMini(); });
  window.addEventListener('hashchange', hidePetShowMini);
  window.addEventListener('sb:toddler-changed', hidePetShowMini);
})();
