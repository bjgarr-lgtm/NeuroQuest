export async function init(root,S,update){
  const src = S.settings?.gcal || 'https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles';
  root.innerHTML=`<section class="cardish"><h2 class="dash">Calendar</h2>
    <div style="position:relative;min-height:70vh"><iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%" frameborder="0"></iframe></div>
    <div class="row"><input id="gcal" placeholder="Paste Google Calendar embed URL"><button id="save" class="primary">Save</button></div>
  </section>`;
  root.querySelector('#save').onclick=()=>{ const v=root.querySelector('#gcal').value.trim(); if(!v) return; S.settings.gcal=v; update({settings:S.settings}); init(root,S,update); }
}
