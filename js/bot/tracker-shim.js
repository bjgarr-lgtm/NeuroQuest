// tracker-shim.js — define tracker() before app.js loads
(function(){
  try{
    window.NQ_track = window.NQ_track || function (ev, payload) {
      try { if (window.NQ && typeof window.NQ.track === 'function') window.NQ.track(ev, payload || {}); } catch (e) {}
    };
    window.tracker = window.tracker || window.NQ_track;
    console.log('[shim] tracker ready');
  }catch(e){ console.warn('[shim] tracker failed', e); }
})();
