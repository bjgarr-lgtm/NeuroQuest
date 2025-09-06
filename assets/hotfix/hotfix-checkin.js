
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.checkin = function(){
  const faces=document.querySelectorAll(".mood-row .mood");
  const save=document.querySelector("#saveCheckin");
  const tags=document.querySelector("#checkinTags");
  const notes=document.querySelector("#checkinNotes");
  const list=document.querySelector("#moodList");
  if(!faces.length || !SB_HOTFIX._bind(list||document.body,"checkin")) return;
  const key="sb.v2.moods"; const data=JSON.parse(localStorage.getItem(key)||"[]");
  let selected=null;
  faces.forEach(f=>f.addEventListener("click",()=>{ faces.forEach(x=>x.classList.remove("active")); f.classList.add("active"); selected=f.dataset.mood; }));
  function render(){ if(!list) return;
    list.innerHTML = data.slice().reverse().map(m=>`<div class="row"><b>${new Date(m.ts).toLocaleString()}</b> <span style="margin-left:8px">${m.mood}</span> <span style="opacity:.7;margin-left:auto">${(m.tags||"")}</span></div>`).join("");
  }
  save?.addEventListener("click",()=>{ if(!selected) return alert("Pick a mood");
    data.push({ts:Date.now(),mood:selected,tags:tags?.value||"",notes:notes?.value||""});
    localStorage.setItem(key,JSON.stringify(data)); if(tags) tags.value=""; if(notes) notes.value=""; render();
  });
  render();
};
