// js/bot/nyx-render-hook.js — keep NYX mounted across route changes
(function () {
  let raf = 0;

  function reassert() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      // (1) remember where we want to live
      window.NYX = window.NYX || {};
      window.NYX.mountSelector = '#nyxMount';

      // (2) if panel vanished (route re-render), remount via the live instance
      const hasPanel = document.getElementById('nyx-panel');
      const hasFab = document.getElementById('nyx-launcher');

      if ((!hasPanel || !hasFab) && window.NQ && window.NQ.nyx) {
        // mountUI is idempotent (creates if missing, no dupes)
        try { window.NQ.nyx.mountUI && window.NQ.nyx.mountUI(); } catch {}
      }
    });
  }

  window.addEventListener('hashchange', reassert);
  document.addEventListener('DOMContentLoaded', reassert);
  setTimeout(reassert, 200);
})();
