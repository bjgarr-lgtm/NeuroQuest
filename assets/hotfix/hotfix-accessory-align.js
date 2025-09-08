// hotfix-accessory-align.js — floating editor wired to overlays.js (ESM)
import { overlayKeyForImage, listPlacements, setPlacementAt, replacePlacements, addOverlayFromFile, applyOverlaysTo } from '../js/overlays.js';

function findPortrait(){
  const view=document.querySelector('#view')||document.body;
  let img=view.querySelector('.char-portrait img, .portrait img, img.portrait, img.char, img.character');
  if(img) return img;
  img=view.querySelector('.party-banner img, .party-members img');
  if(img) return img;
  return view.querySelector('img');
}

function ensureStyles(){
  if(document.getElementById('sb-align-style')) return;
  const css=`
  .sb-acc-fab{position:fixed;right:16px;bottom:86px;z-index:99999;border-radius:50%;width:48px;height:48px;font-size:24px;background:#0ff5;border:1px solid #0ff9;color:#fff;backdrop-filter:blur(6px)}
  .sb-acc-panel{position:fixed;right:16px;bottom:146px;width:380px;max-width:92vw;background:rgba(18,22,32,.95);color:#eee;border:1px solid #4cf;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,.45);z-index:99998;font-family:system-ui,sans-serif}
  .sb-acc-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #3af}
  .sb-acc-tools{display:flex;align-items:center;gap:8px;padding:10px 12px;flex-wrap:wrap}
  .sbbtn{background:#1e2b;color:#fff;border:1px solid #6cf;border-radius:10px;padding:6px 10px;cursor:pointer}
  .sbhint{opacity:.7;font-size:12px}
  .sb-portrait-wrap{position:relative;display:inline-block}
  .sb-acc-layer{position:absolute;inset:0;pointer-events:none}
  .sb-list{max-height:160px;overflow:auto;padding:8px 12px;border-top:1px solid #234}
  .sb-row{display:flex;align-items:center;gap:8px;margin:6px 0}
  .sb-row input[type="range"]{flex:1}
  `;
  const el=document.createElement('style'); el.id='sb-align-style'; el.textContent=css; document.head.appendChild(el);
}

function createEditor(){
  ensureStyles();
  const img=findPortrait();
  if(!img){ alert('No portrait image found on this screen.'); return; }
  const key=overlayKeyForImage(img);
  let wrap=img.closest('.sb-portrait-wrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.className='sb-portrait-wrap'; img.parentNode.insertBefore(wrap,img); wrap.appendChild(img); wrap.style.display='inline-block'; wrap.style.position='relative'; }
  let layer=wrap.querySelector('.sb-acc-layer'); if(!layer){ layer=document.createElement('div'); layer.className='sb-acc-layer'; wrap.appendChild(layer); }

  let panel=document.querySelector('.sb-acc-panel'); if(panel) panel.remove();
  panel=document.createElement('div'); panel.className='sb-acc-panel';
  panel.innerHTML=`
    <div class="sb-acc-head"><strong>Accessory Align</strong><div style="flex:1"></div><button class="sbbtn" data-act="close">✕</button></div>
    <div class="sb-acc-tools">
      <input type="file" accept="image/*" class="sbfile"/>
      <button class="sbbtn" data-act="add">Add</button>
      <button class="sbbtn" data-act="clear">Clear All</button>
      <span class="sbhint">Drag=move • Wheel=scale • Shift+Wheel=rotate</span>
    </div>
    <div class="sb-list" id="sbList"></div>
  `;
  document.body.appendChild(panel);

  const listEl=panel.querySelector('#sbList');
  let placements = listPlacements(key);

  function renderList(){
    placements = listPlacements(key);
    listEl.innerHTML = placements.map(p=>`
      <div class="sb-row" data-i="${p.index}">
        <span>#${p.index+1}</span>
        <label>X <input type="range" min="0" max="100" step="0.1" value="${p.x}"></label>
        <label>Y <input type="range" min="0" max="100" step="0.1" value="${p.y}"></label>
        <label>W <input type="range" min="2" max="200" step="0.5" value="${p.w}"></label>
      </div>
    `).join('');
    listEl.querySelectorAll('.sb-row').forEach(row=>{
      const i = parseInt(row.dataset.i,10);
      const [rx, ry, rw] = row.querySelectorAll('input[type="range"]');
      rx.oninput = ()=>{ setPlacementAt(key,i,{x:parseFloat(rx.value)}); applyOverlaysTo(img); };
      ry.oninput = ()=>{ setPlacementAt(key,i,{y:parseFloat(ry.value)}); applyOverlaysTo(img); };
      rw.oninput = ()=>{ setPlacementAt(key,i,{w:parseFloat(rw.value)}); applyOverlaysTo(img); };
    });
  }

  // Drag / wheel edit on the live image
  function enableDragOnLast(){
    const ov = wrap.querySelector('.sb-acc-layer img:last-of-type');
    if(!ov) return;
    ov.style.pointerEvents='auto';
    function startDrag(ev){
      ev.preventDefault();
      const rect=wrap.getBoundingClientRect();
      function move(e){
        const px=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
        const py=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
        const x=px/rect.width*100, y=py/rect.height*100;
        const arr=listPlacements(key); const idx=arr.length-1;
        setPlacementAt(key, idx, {x,y}); applyOverlaysTo(img); renderList();
      }
      function end(){ document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',end); document.removeEventListener('touchmove',move); document.removeEventListener('touchend',end); }
      document.addEventListener('mousemove',move); document.addEventListener('mouseup',end);
      document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',end);
    }
    function onWheel(e){
      e.preventDefault();
      const arr=listPlacements(key); const idx=arr.length-1; if(idx<0) return;
      if(e.shiftKey){ const r=((arr[idx].r||0)+(e.deltaY>0?4:-4))%360; setPlacementAt(key, idx, {r}); }
      else { const w=Math.max(2, Math.min(200, (arr[idx].w||40)+(e.deltaY>0?-2:2))); setPlacementAt(key, idx, {w}); }
      applyOverlaysTo(img); renderList();
    }
    ov.addEventListener('mousedown',startDrag); ov.addEventListener('touchstart',startDrag,{passive:false}); ov.addEventListener('wheel',onWheel,{passive:false});
  }

  panel.querySelector('[data-act="add"]').onclick=async()=>{
    const f=panel.querySelector('.sbfile'); const file=f.files?.[0];
    if(!file){ alert('Pick an image first'); return; }
    await addOverlayFromFile(img, file);
    await applyOverlaysTo(img);
    renderList(); enableDragOnLast(); f.value='';
  };
  panel.querySelector('[data-act="clear"]').onclick=()=>{
    replacePlacements(key, []); applyOverlaysTo(img); renderList();
  };
  panel.querySelector('[data-act="close"]').onclick=()=>panel.remove();

  applyOverlaysTo(img);
  renderList();
  enableDragOnLast();
}

function ensureFab(){
  if(document.querySelector('.sb-acc-fab')) return;
  const b=document.createElement('button'); b.className='sb-acc-fab'; b.title='Accessory Align'; b.textContent='🧩';
  document.body.appendChild(b); b.addEventListener('click', createEditor);
}
const mo=new MutationObserver(()=>ensureFab()); mo.observe(document.body,{childList:true,subtree:true}); ensureFab();
