import {load, save} from '../util/storage.js';
import {logAction} from '../util/game.js';
import {confetti, crownDrop} from '../ui/fx.js';

export default function renderJournal(root){
  let s = load();
  s.journal ??= {prompt:'', entries:[], moods:[]};

  // fresh prompt suggestions each load
  const PROMPTS = [
    "What went well today?",
    "What challenged me?",
    "One thing I'm grateful for",
    "What do I need tomorrow-me to remember?",
    "A small win I'm proud of",
    "Something I can let go of",
    "Who helped me today?",
    "What's one thing I can do for future me?",
    "A moment I want to keep",
    "What energized me? What drained me?"
  ];
  const shuffled = PROMPTS.sort(()=>Math.random()-0.5).slice(0,3);

  root.innerHTML = `
    <h2>Journal + Check-In</h2>
    <section class="grid two">
      <div class="panel">
        <h3>Mood</h3>
        <div class="row">
          <input id="moodNote" placeholder="Add a quick note (optional)" style="flex:1">
        </div>
        <div class="row">
          <button class="secondary mood" data-m="awful">😖</button>
          <button class="secondary mood" data-m="bad">☹️</button>
          <button class="secondary mood" data-m="ok">😐</button>
          <button class="secondary mood" data-m="good">🙂</button>
          <button class="secondary mood" data-m="great">😄</button>
        </div>
        <div id="moodList" class="list"></div>
      </div>
      <div class="panel">
        <h3>Journal</h3>
        <div class="row" id="promptRow">
          ${shuffled.map((p)=>`<button class="secondary prompt" data-p="${p.replace(/"/g,'&quot;')}">${p}</button>`).join('')}
        </div>
        <textarea id="jText" rows="8" placeholder="Write anything…"></textarea>
        <div class="row"><button id="saveJ" class="primary">Save</button></div>
        <div id="jList" class="list"></div>
      </div>
    </section>
  `;

  // ------- helpers: bridge-aware award + reload -------
  function awardGold1(){
    try{
      if (window.NQ && typeof window.NQ.addGold === 'function'){
        window.NQ.addGold(1);
      }else{
        const cur = load();
        cur.gold = (cur.gold||0)+1;
        save(cur);
      }
    }catch(e){}
  }
  function refresh(){
    s = load();
    drawMoods();
    drawJ();
  }

  // ------- Mood handlers -------
  document.querySelectorAll('.mood').forEach(b=> b.onclick=()=>{
    const note = (document.getElementById('moodNote').value || '').trim();
    const mood = b.dataset.m;

    // Prefer shared bridge; fallback to legacy local shape
    try{
      if (window.NQ && typeof window.NQ.pushMood === 'function'){
        window.NQ.pushMood(mood, note);
      }else{
        s.journal.moods.push({m:mood, note, t:Date.now()});
        save(s);
      }
    }catch(e){
      s.journal.moods.push({m:mood, note, t:Date.now()});
      save(s);
    }

    awardGold1();
    try{ crownDrop(); }catch(e){}
    try{ confetti(); }catch(e){}

    document.getElementById('moodNote').value='';
    refresh();
  });

  function drawMoods(){
    const list=document.getElementById('moodList'); list.innerHTML='';
    // support both shapes: {m, t} and {mood, ts}
    const items = (s.journal.moods||[]).slice().reverse();
    items.forEach(m=>{
      const when = new Date(m.t ?? m.ts ?? Date.now()).toLocaleString();
      const mood = m.m ?? m.mood ?? '';
      const note = m.note ? ` — ${m.note}` : '';
      const row=document.createElement('div'); row.className='row';
      row.textContent = `${when} — ${mood}${note}`;
      list.appendChild(row);
    });
  }
  drawMoods();

  // ------- Journal prompts -------
  document.querySelectorAll('.prompt').forEach(btn=>{
    btn.onclick=()=>{
      const v=btn.dataset.p;
      const area=document.getElementById('jText');
      if(area.value.trim().length>0) area.value = area.value.trim()+"\n\n"+v+": ";
      else area.value = v + ": ";
      area.focus();
      area.selectionStart = area.selectionEnd = area.value.length;
    };
  });

  // ------- Save journal entry -------
  document.getElementById('saveJ').onclick=()=>{
    const v=document.getElementById('jText').value.trim(); if(!v) return;

    // Prefer shared bridge; fallback to legacy local shape
    try{
      if (window.NQ && typeof window.NQ.pushJournal === 'function'){
        window.NQ.pushJournal(v, "", "");
      }else{
        s.journal.entries.push({t:Date.now(), text:v});
        save(s);
      }
    }catch(e){
      s.journal.entries.push({t:Date.now(), text:v});
      save(s);
    }

    awardGold1();
    try{ crownDrop(); }catch(e){}
    try{ confetti(); }catch(e){}
    document.getElementById('jText').value='';
    refresh();
  };

  function drawJ(){
    const list=document.getElementById('jList'); list.innerHTML='';
    // support both shapes: {t, text} and {ts, text}
    const items = (s.journal.entries||[]).slice().reverse();
    items.forEach(e=>{
      const when = new Date(e.t ?? e.ts ?? Date.now()).toLocaleDateString();
      const row=document.createElement('div'); row.className='row';
      row.textContent = `${when}: ${e.text||''}`;
      list.appendChild(row);
    });
  }
  drawJ();
}
