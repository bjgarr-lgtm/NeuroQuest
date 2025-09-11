// js/bot/nyx-render-hook.js — keep NYX alive across route/view changes
(function(){
  let scheduled = null;

  function reassert(){
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(()=>{
      // ensure mount root
      if (!document.getElementById('nyxRoot')) {
        // if nuked, ask nyx-wire to re-mount
        document.dispatchEvent(new Event('nyx:mount'));
      }
      // always re-pin selector
      window.NYX = window.NYX || {};
      window.NYX.mountSelector = '#nyxMount';
    });
  }

  window.addEventListener('hashchange', reassert);
  document.addEventListener('DOMContentLoaded', reassert);
  setTimeout(reassert, 200);
})();
