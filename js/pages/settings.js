
import {S, save} from '../core/state.js';
export function settings(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML=`<h2>Settings</h2>
  <div class="grid two">
    <div class="section"><label>Your name <input id="nm" value="${S.user.name}"></label></div>
    <div class="section"><label>Toddler Mode <input id="tod" type="checkbox" ${S.toddler?'checked':''}></label></div>
  </div>
  <button id="save" class="btn">Save</button>`;
  el.querySelector('#save').onclick=()=>{ S.user.name=el.querySelector('#nm').value; S.toddler=el.querySelector('#tod').checked; save(); alert('Saved'); };
  return el;
}
