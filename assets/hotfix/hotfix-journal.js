
window.SB_HOTFIX = window.SB_HOTFIX || {};
SB_HOTFIX.journal = function(){
  const sel=document.querySelector("#journalPrompt");
  const ta=document.querySelector("#journalText");
  const save=document.querySelector("#saveJournal");
  const np=document.querySelector("#newPrompt");
  const list=document.querySelector("#journalList");
  const meta=document.querySelector("#journalStorage");
  if(!sel || !SB_HOTFIX._bind(sel,"journal")) return;

  const key="sb.v2.journal";
  const promptsKey="sb.v2.journal.prompts";
  const store=JSON.parse(localStorage.getItem(key)||"[]");
  const prompts=JSON.parse(localStorage.getItem(promptsKey)||"[]");
  const defaults=["Three wins today","What went well?","Grateful for…","One small next step"];

  function savePrompts(){ localStorage.setItem(promptsKey, JSON.stringify(Array.from(new Set(prompts)))); }
  if(prompts.length===0){ defaults.forEach(p=>prompts.push(p)); savePrompts(); }

  sel.innerHTML = prompts.map(p=>`<option>${p}</option>`).join("");

  function render(){
    list.innerHTML = store.slice().reverse().map(e=>`<div class="cardish"><b>${new Date(e.ts).toLocaleString()}</b><div>${e.prompt||""}</div><div>${e.text||""}</div></div>`).join("");
    meta && (meta.textContent = `${store.length} saved entries`);
  }
  save?.addEventListener("click",()=>{
    store.push({ts:Date.now(), prompt:sel.value, text:ta.value});
    localStorage.setItem(key, JSON.stringify(store));
    ta.value=""; render();
  });
  np?.addEventListener("click",()=>{
    const p = prompt("New prompt"); if(!p) return;
    prompts.push(p); savePrompts(); sel.innerHTML = prompts.map(x=>`<option>${x}</option>`).join(""); sel.value=p;
  });
  render();
};
