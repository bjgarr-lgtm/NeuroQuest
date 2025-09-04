/*! SootheBirb loop-guard shim v1
    Stops the rapid "render failed reloading" loop by capping retries per route
    and providing a safe fallback. Include BEFORE your main bundle.
*/
(function(){
  if (typeof window === 'undefined') return;
  const MAX_RETRIES = 2;        // per route within WINDOW_MS
  const WINDOW_MS   = 2000;     // 2 seconds window
  const tries = {};

  function tooMany(route){
    const k = route || (location.hash || '#home');
    const now = Date.now();
    const arr = (tries[k] = (tries[k] || []).filter(t => now - t < WINDOW_MS));
    arr.push(now);
    return arr.length > MAX_RETRIES;
  }

  // Protect location.reload from being spammed by render loops
  const origReload = window.location.reload.bind(window.location);
  let lastReload = 0;
  window.location.reload = function(){
    const now = Date.now();
    if (now - lastReload < 3000) {
      console.warn('[LoopGuard] Suppressed rapid reload');
      return;
    }
    lastReload = now;
    return origReload();
  };

  // Wrap renderRoute if present
  function wrapRenderRoute(){
    const orig = window.renderRoute;
    if (!orig || orig.__loopGuardWrapped) return;
    window.renderRoute = function(route){
      if (tooMany(route)) {
        console.warn('[LoopGuard] Too many render retries for', route, '→ showing #home');
        try { return orig('#home'); } catch(e) { console.error('[LoopGuard] Fallback render failed', e); }
        return;
      }
      try {
        return orig.apply(this, arguments);
      } catch (e) {
        console.error('[LoopGuard] renderRoute error:', e);
        // let the app show its error UI, but prevent hard loops by not re-invoking directly here
      }
    };
    window.renderRoute.__loopGuardWrapped = true;
  }

  // Debounce hashchange to avoid thrash
  let hashTimer = null;
  const origAdd = window.addEventListener;
  window.addEventListener = function(type, listener, opts){
    if (type === 'hashchange') {
      const wrapped = function(){
        if (hashTimer) cancelAnimationFrame(hashTimer);
        hashTimer = requestAnimationFrame(listener);
      };
      return origAdd.call(this, type, wrapped, opts);
    }
    return origAdd.call(this, type, listener, opts);
  };

  // Try to wrap immediately and again after load
  wrapRenderRoute();
  window.addEventListener('load', wrapRenderRoute);
  // Expose flag for diagnostics
  window.__SB_LOOP_GUARD__ = 'v1';
})();