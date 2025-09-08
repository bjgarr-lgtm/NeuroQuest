export async function init(root,S,update){
  S.settings=S.settings||{ toddler:false, gcal:null };
  root.innerHTML=`<section class="cardish"><h2 class="dash">Settings</h2>
    <div class="grid2">
      <label class="cardish">Your name <input id="name" value="${S.user?.name||''}"></label>
      <label class="cardish">Toddler Mode <input id="tod" type="checkbox" ${S.settings.toddler?'checked':''}></label>
    </div>
    <div class="cardish"><div class="row"><input id="gcal" placeholder="Google Calendar embed URL" value="${S.settings.gcal||''}" style="flex:1"><button id="save" class="primary">Save</button></div></div>
  </section>`;
  root.querySelector('#save').onclick=()=>{
    S.user={name:root.querySelector('#name').value||'Hero'}; S.settings.toddler=root.querySelector('#tod').checked; S.settings.gcal=root.querySelector('#gcal').value||null;
    update({user:S.user, settings:S.settings});
  };
}
