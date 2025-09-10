// js/bot/nyx-render-hook.js — optional router awareness (ES module)
(function(){
  // Keep FAB alive across route changes; re-assert mount point after views update.
  let scheduled = null;
  function reassert(){
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(()=>{
      const root = document.getElementById('nyxRoot');
      if (!root) {
        // If something nuked it, rebuild via nyx-wire
        const evt = new Event('DOMContentLoaded');
        document.dispatchEvent(evt);
      }
      // ensure mountSelector remains
      window.NYX = window.NYX || {};
      window.NYX.mountSelector = '#nyxMount';
    });
  }
  window.addEventListener('hashchange', reassert);
  document.addEventListener('DOMContentLoaded', reassert);
  setTimeout(reassert, 200);
})();