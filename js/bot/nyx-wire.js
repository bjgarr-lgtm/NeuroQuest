// js/bot/nyx-wire.js  — idempotent FAB + panel injector (ES module)
(function(){
  // Avoid double-injection
  if (window.__NYX_WIRED__) return;
  window.__NYX_WIRED__ = true;

  function injectStyles(){
    if (document.getElementById('nyx-fab-styles')) return;
    const css = `
      .nyx-fab {
        position: fixed; right: 18px; bottom: 18px;
        width: 56px; height: 56px; border-radius: 50%;
        display: grid; place-items: center;
        background: linear-gradient(180deg,#3af,#08c);
        box-shadow: 0 8px 20px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.25);
        color: #fff; font-size: 24px; cursor: pointer; border: none;
        z-index: 2147483647;
      }
      .nyx-fab:focus { outline: 2px solid #fff8; outline-offset: 3px }
      .nyx-fab svg { width: 26px; height: 26px; display:block }
      .nyx-panel {
        position: fixed; right: 18px; bottom: 86px; width: min(420px, 92vw); height: min(70vh, 680px);
        background: #0d1117; color: #e6edf3; border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0,0,0,.5), inset 0 0 0 1px #223;
        overflow: hidden; display: none;
        z-index: 2147483646;
      }
      .nyx-panel.open { display: block }
      .nyx-panel header {
        display:flex; align-items:center; justify-content:space-between;
        padding:10px 12px; background:#101826; border-bottom:1px solid #223; font-weight:600;
      }
      .nyx-panel .nyx-body { height: calc(100% - 46px); background:#0b1422 }
      .nyx-close {
        background: transparent; border: 1px solid #345; color:#cbd5e1; border-radius:8px;
        padding:6px 10px; cursor:pointer;
      }
      #nyxFab, #nyxPanel { display: initial !important; visibility: visible !important; }
    `;
    const style = document.createElement('style');
    style.id = 'nyx-fab-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureDom(){
    injectStyles();
    if (document.getElementById('nyxRoot')) return;

    const root = document.createElement('div');
    root.id = 'nyxRoot';
    root.innerHTML = `
      <button id="nyxFab" class="nyx-fab" aria-label="Open chat" title="Chat">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor"
            d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 3v-3H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
        </svg>
      </button>
      <div id="nyxPanel" class="nyx-panel" role="dialog" aria-modal="true" aria-labelledby="nyxTitle">
        <header>
          <div id="nyxTitle">NeuroQuest Chat</div>
          <button class="nyx-close" id="nyxClose" type="button">Close</button>
        </header>
        <div class="nyx-body" id="nyxMount">
          <iframe id="nyxFallback" title="Chat Placeholder" style="border:0;width:100%;height:100%; background:#0b1422; color:#cbd5e1"
            srcdoc='<html><body style="margin:0;font-family:system-ui;background:#0b1422;color:#cbd5e1;display:grid;place-items:center;height:100%;"><div style="opacity:.8;text-align:center;padding:20px;max-width:24rem;"><div style="font-size:18px;margin-bottom:8px;">Chat is ready</div><div style="font-size:14px;line-height:1.4">Your bot script can mount into <code>#nyxMount</code> when available.</div></div></body></html>'>
          </iframe>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const fab    = document.getElementById('nyxFab');
    const panel  = document.getElementById('nyxPanel');
    const closeB = document.getElementById('nyxClose');

    function openPanel(){
      if (window.NYX && typeof window.NYX.open === 'function' && !window.__NYX_SELF__) {
        try { window.NYX.open(); return; } catch(_){}
      }
      panel.classList.add('open');
    }
    function closePanel(){
      if (window.NYX && typeof window.NYX.close === 'function' && !window.__NYX_SELF__) {
        try { window.NYX.close(); return; } catch(_){}
      }
      panel.classList.remove('open');
    }
    fab.addEventListener('click', openPanel);
    closeB.addEventListener('click', closePanel);
    window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closePanel(); });

    // public API + mount point for other scripts
    window.NYX = window.NYX || {};
    window.NYX.mountSelector = '#nyxMount';
    // If no other NYX implementation provides open/close, provide ours:
    if (!window.NYX.open)  window.NYX.open  = ()=> panel.classList.add('open');
    if (!window.NYX.close) window.NYX.close = ()=> panel.classList.remove('open');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDom);
  } else {
    ensureDom();
  }
})();