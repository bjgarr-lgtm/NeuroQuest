
import {S, save} from '../core/state.js';
export function calendar(){
  const wrap = document.createElement('section'); wrap.className='section calendar';
  wrap.innerHTML = `<h2>Weekly Calendar</h2>
  <div class="section"><label>Google Calendar embed or src URL<br/>
  <input id="calInput" style="width:100%" value="${S.calendar.src}"/></label>
  <button id="calSave" class="btn">Save</button></div>
  <div class="embed-wrap"><iframe id="gcal" src="${sanitize(S.calendar.src)}" frameborder="0" scrolling="no"></iframe></div>`;
  wrap.querySelector('#calSave').onclick=()=>{
    const v=wrap.querySelector('#calInput').value.trim(); S.calendar.src=v; save();
    wrap.querySelector('#gcal').src = sanitize(v);
  };
  return wrap;
}
function sanitize(v){ if(!v) return ''; const m=v.match(/src=["']([^"']+)/i); const src=m?m[1]:v; try{const u=new URL(src); if(!u.hostname.includes('calendar.google.com')) return ''; return u.href;}catch(e){return '';} }
