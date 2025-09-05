/* Compact Menu + toddler gating — v4 */
(function(){
  const qs = (s, el=document)=>el.querySelector(s);
  const qsa= (s, el=document)=>Array.from(el.querySelectorAll(s));
  const load=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } };
  const settings=()=>load('sb.settings',{});
  const toddlerOn=()=>!!settings().toddlerToggle;

  function ensureHamburger(){
    const header = qs('.app-header'); if (!header) return;
    if (qs('#menuToggle', header)) return;
    const btn = document.createElement('button');
    btn.id = 'menuToggle'; btn.className='secondary'; btn.textContent='☰';
    btn.title = 'Menu';
    header.insertBefore(btn, header.firstChild);
    const nav = qs('.top-nav', header); if (!nav) return;
    nav.classList.add('collapsible');
    btn.addEventListener('click', ()=> nav.classList.toggle('open'));
    // add minimal styles
    const style = document.createElement('style');
    style.textContent = `
      .top-nav.collapsible { display:flex; flex-wrap:wrap; gap:.25rem; }
      @media (max-width: 1100px) {
        .top-nav.collapsible { display:none; position:absolute; left:.5rem; right:.5rem; top:64px; background:rgba(0,0,0,.8); padding:.5rem; border:1px solid rgba(255,255,255,.2); border-radius:.75rem; z-index:500;}
        .top-nav.collapsible.open { display:flex; }
        #menuToggle { margin-right:.5rem; }
      }`;
    document.head.appendChild(style);
  }

  function gateToddlerRoutes(){
    const show = toddlerOn();
    const petBtn = qs('button[data-route="pet"]');
    if (petBtn) petBtn.style.display = 'none'; // always hide separate Pet tab
    const miniBtn = qs('button[data-route="minigames"]');
    if (miniBtn) miniBtn.style.display = show ? '' : 'none';
    qsa('.tile[data-route="pet"],a.tile[data-route="pet"]').forEach(t=> t.style.display='none'); // pet handled inside minigames now
    qsa('.tile[data-route="minigames"],a.tile[data-route="minigames"]').forEach(t=> t.style.display = show ? '' : 'none');
  }

  function apply(){
    ensureHamburger();
    gateToddlerRoutes();
  }

  window.addEventListener('hashchange', apply);
  document.addEventListener('DOMContentLoaded', apply);
  setInterval(apply, 1200);
})();