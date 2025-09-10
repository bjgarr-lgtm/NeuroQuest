// overlays.js — overlay placement (accessories) using IndexedDB for files
import { getRaw, setRaw } from './storage.js';
import { getObjectURL, putBlob, deleteBlob } from './asset-db.js';

const LS_PLACEMENTS='sb_overlays_v1';

function loadPlacements(){ try{ return JSON.parse(getRaw(LS_PLACEMENTS,'{}'))||{}; }catch{ return {}; } }
function savePlacements(data){ try{ setRaw(LS_PLACEMENTS, JSON.stringify(data)); }catch(e){ console.warn('SootheBirb overlays: save fail', e); } }

export function overlayKeyForImage(imgEl){
  const id=(imgEl&&(imgEl.dataset.charId||imgEl.getAttribute('data-char-id')))||(imgEl&&imgEl.alt)||(imgEl&&imgEl.src)||'default';
  return id.slice(-120);
}

export function listPlacements(key){ const db=loadPlacements(); return (db[key]||[]).map((x,i)=>({...x,index:i})); }
export function setPlacementAt(key,index,patch){ const db=loadPlacements(); if(!db[key]||!db[key][index]) return; Object.assign(db[key][index],patch); savePlacements(db); }
export function replacePlacements(key,newList){ const db=loadPlacements(); db[key]=newList; savePlacements(db); }

export async function applyOverlaysTo(imgEl){
  if(!imgEl) return;
  const key=overlayKeyForImage(imgEl); const db=loadPlacements(); const list=db[key]||[]; if(!list.length) return;
  let wrap=imgEl.closest('.sb-portrait-wrap'); if(!wrap){ wrap=document.createElement('div'); wrap.className='sb-portrait-wrap'; imgEl.parentNode.insertBefore(wrap,imgEl); wrap.appendChild(imgEl); wrap.style.display='inline-block'; wrap.style.position='relative'; }
  let layer=wrap.querySelector('.sb-acc-layer'); if(!layer){ layer=document.createElement('div'); layer.className='sb-acc-layer'; wrap.appendChild(layer); }
  layer.innerHTML='';
  for(const item of list){
    let src=null; if(item.dbKey){ src=await getObjectURL(item.dbKey); } else if(item.src && item.src.startsWith('http')) { src=item.src; }
    if(!src) continue;
    const el=document.createElement('img'); el.src=src; el.alt='overlay'; el.className='sb-acc-ov'; el.style.position='absolute';
    el.style.left=item.x+'%'; el.style.top=item.y+'%'; el.style.width=item.w+'%';
    el.style.transform=`translate(-50%,-50%) rotate(${item.r||0}deg) scaleX(${item.fx?-1:1})`; el.style.pointerEvents='none'; layer.appendChild(el);
  }
}

export async function addOverlayFromFile(imgEl,file){
  if(!file||!imgEl) return;
  const key=overlayKeyForImage(imgEl); const db=loadPlacements(); const list=db[key]||(db[key]=[]);
  const dbKey=`acc_${Date.now()}_${file.name}`; await putBlob(dbKey,file);
  list.push({ dbKey, x:50, y:50, w:40, r:0, fx:false }); savePlacements(db); return dbKey;
}

export function clearOverlaysForKey(key){
  const db=loadPlacements(); const list=db[key]||[]; list.forEach(i=>i.dbKey&&deleteBlob(i.dbKey)); db[key]=[]; savePlacements(db);
}
