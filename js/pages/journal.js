import {load, save} from '../util/storage.js';

export default function renderJournal(root){
  const s=load();
  s.journal ??= {prompt:'', entries:[], moods:[]};

  root.innerHTML = `
    <h2>Journal + Check-In</h2>
    <section class="grid two">
      <div class="panel">
        <h3>Mood</h3><small>Add a note, then tap mood.</small>
        <div class="row">
          <button class="secondary mood" data-m="awful">😖</button>
          <button class="secondary mood" data-m="bad">☹️</button>
          <button class="secondary mood" data-m="ok">😐</button>
          <button class="secondary mood" data-m="good">🙂</button>
          <button class="secondary mood" data-m="great">🤩</button>
        </div>
        <div id="moodList" class="list"></div>
      </div>
      <div class="panel"><h3>Journal</h3><div class="row"><input id="moodNote" placeholder="Mood note (optional)"/></div>
        <textarea id="jText" rows="8" placeholder="Let it out…"></textarea><div class="row"><button class="secondary" id="p1">What went well today?</button><button class="secondary" id="p2">What challenged me?</button><button class="secondary" id="p3">One thing I’m grateful for</button></div>
        <div class="row"><button id="saveJ" class="primary">Save</button></div>
        <div id="jList" class="list"></div>
      </div>
    </section>
  `;

  document.querySelectorAll('.mood').forEach(b=> b.onclick=()=>{
    s.journal.moods.push({m:b.dataset.m, t:Date.now()}); save(s); drawMoods();
  });
  function drawMoods(){
    const list=document.getElementById('moodList'); list.innerHTML='';
    (s.journal.moods||[]).slice().reverse().forEach(m=>{
      const row=document.createElement('div'); row.textContent=new Date(m.t).toLocaleString()+' — '+m.m; list.appendChild(row);
    });
  }
  drawMoods();

  document.getElementById('p1').onclick=()=>{ document.getElementById('jText').value='What went well today?\n'; };
  document.getElementById('p2').onclick=()=>{ document.getElementById('jText').value='What challenged me?\n'; };
  document.getElementById('p3').onclick=()=>{ document.getElementById('jText').value='One thing I\'m grateful for:\n'; };
  document.getElementById('saveJ').onclick=()=>{
    const v=document.getElementById('jText').value.trim(); if(!v) return;
    s.journal.entries.push({t:Date.now(),text:v}); save(s); const st=load(); st.gold=(st.gold||0)+1; save(st); try{ sfx && sfx(880,100);}catch(_){ } document.getElementById('jText').value=''; drawJ();
  };
  function drawJ(){
    const list=document.getElementById('jList'); list.innerHTML='';
    (s.journal.entries||[]).slice().reverse().forEach(e=>{
      const row=document.createElement('div'); row.className='row'; row.textContent=new Date(e.t).toLocaleDateString()+': '+e.text; list.appendChild(row);
    });
  }
  drawJ();
}
