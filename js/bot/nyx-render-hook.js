// nyx-render-hook.js — auto re-render app on actions
(function(){
  try{
    const rerender = ()=>{ try{ render(); }catch(e){ console.warn('[render hook] render() failed', e); } };
    ['nq:state:reloaded','nq:action','nq:quest-create','nq:quest-complete','nq:journal-saved','nq:shopping-add','nq:budget-add','nq:hydrate','nq:breathe']
      .forEach(ev=> document.addEventListener(ev, rerender));
    window.addEventListener('storage', (e)=>{ if(e && e.key && e.key.includes('neuroquest')) rerender(); });
    console.log('[render hook] attached');
  }catch(e){ console.warn('[render hook] attach failed', e); }
})();
