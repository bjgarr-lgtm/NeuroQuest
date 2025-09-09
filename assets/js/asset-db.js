// asset-db.js — tiny IndexedDB blob store for accessory/overlay files
export const DB_NAME='sb_assets_v1', DB_STORE='files';
let _dbPromise=null; const _urlCache=new Map();
function openDB(){ if(_dbPromise) return _dbPromise; _dbPromise=new Promise((res,rej)=>{ const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=e=>{const db=e.target.result; if(!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);};
  req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); }); return _dbPromise; }
export async function putBlob(key,blob){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.onerror=()=>rej(tx.error); tx.oncomplete=()=>res(key); tx.objectStore(DB_STORE).put(blob,key); }); }
export async function getBlob(key){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(DB_STORE,'readonly'); tx.onerror=()=>rej(tx.error); const rq=tx.objectStore(DB_STORE).get(key); rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>rej(rq.error); }); }
export async function getObjectURL(key){ if(_urlCache.has(key)) return _urlCache.get(key); const blob=await getBlob(key); if(!blob) return null; const url=URL.createObjectURL(blob); _urlCache.set(key,url); return url; }
export async function deleteBlob(key){ const db=await openDB(); return new Promise((res,rej)=>{ const tx=db.transaction(DB_STORE,'readwrite'); tx.onerror=()=>rej(tx.error); tx.oncomplete=()=>res(true); tx.objectStore(DB_STORE).delete(key); }); }
