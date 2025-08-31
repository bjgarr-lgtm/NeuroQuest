
const $ = (sel) => document.querySelector(sel);
const stateKey = "adhdQuestV2";
let sfxMuted = false;

const initialState = () => ({
  date: new Date().toISOString().slice(0,10),
  companion: null,
  quests: [
    { txt: "", done: false, mins: 10 },
    { txt: "", done: false, mins: 10 },
    { txt: "", done: false, mins: 10 },
  ],
  boss: { txt: "", done: false },
  points: 0,
  loot: []
});

let state = load() || initialState();

function save(){ localStorage.setItem(stateKey, JSON.stringify(state)); }
function load(){ try { return JSON.parse(localStorage.getItem(stateKey)); } catch(e){ return null; } }

function show(id){
  document.querySelectorAll('.scene').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function playPop(){
  if (sfxMuted) return;
  try { new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYBAGZmZmY=').play(); } catch(e){}
}

$('#start').addEventListener('click', () => {
  state = initialState(); save();
  renderCompanions();
  show('scene-companion');
});
$('#resume').addEventListener('click', () => {
  state = load() || state;
  if (!state.companion) { renderCompanions(); show('scene-companion'); }
  else { renderBoard(); show('scene-board'); }
});
document.getElementById('btnMute').addEventListener('click', () => {
  sfxMuted = !sfxMuted;
  document.getElementById('btnMute').textContent = sfxMuted ? '🔇' : '🔈';
});

const COMPANIONS = [
  { id:'fox', name:'Fox', img:'/assets/img/fox.svg' },
  { id:'molotov', name:'Molotov', img:'/assets/img/molotov.svg' },
  { id:'odin', name:'Odin', img:'/assets/img/odin.svg' },
  { id:'bambi', name:'Bambi', img:'/assets/img/bambi.svg' },
  { id:'ben', name:'Ben', img:'/assets/img/ben.svg' },
];
function renderCompanions(){
  const wrap = $('#companions'); wrap.innerHTML = '';
  COMPANIONS.forEach(c => {
    const el = document.createElement('button');
    el.className = 'companion' + (state.companion === c.id ? ' selected' : '');
    el.innerHTML = `<img src="${c.img}" alt=""><div><div><strong>${c.name}</strong></div><div class="hint">+ cozy comments</div></div>`;
    el.addEventListener('click', () => { state.companion = c.id; save(); renderCompanions(); playPop(); });
    wrap.appendChild(el);
  });
}
$('#toBoard').addEventListener('click', () => {
  if (!state.companion) { alert('pick a companion'); return; }
  renderBoard(); show('scene-board');
});

function questRow(i){
  const q = state.quests[i];
  const row = document.createElement('div');
  row.className = 'quest';
  row.innerHTML = `
    <input type="checkbox" class="chk" ${q.done?'checked':''}>
    <input type="text" placeholder="tiny quest ${i+1}" value="${q.txt}">
    <input type="number" class="mins" min="1" max="60" value="${q.mins}">
    <button class="btn small">×</button>
  `;
  const [chk, txt, mins, delbtn] = row.children;
  chk.addEventListener('change', () => { q.done = chk.checked; save(); if (q.done) addPoints(10); });
  txt.addEventListener('input', () => { q.txt = txt.value; save(); });
  mins.addEventListener('change', () => { q.mins = Math.max(1, parseInt(mins.value||1)); save(); });
  delbtn.addEventListener('click', () => { state.quests.splice(i,1); save(); renderBoard(); });
  return row;
}
function renderBoard(){
  const list = document.getElementById('questList'); list.innerHTML = '';
  state.quests.forEach((_,i) => list.appendChild(questRow(i)));
  document.getElementById('bossText').value = state.boss.txt || '';
}
document.getElementById('addQuest').addEventListener('click', () => {
  state.quests.push({ txt:'', done:false, mins: 10 });
  save(); renderBoard();
});
document.getElementById('markBossDone').addEventListener('click', () => {
  state.boss.txt = document.getElementById('bossText').value;
  if (!state.boss.done) { state.boss.done = true; addPoints(25); }
  save(); playPop();
});
document.getElementById('toTimer').addEventListener('click', () => {
  const m = Math.max(1, parseInt(document.querySelector('.mins')?.value || '10'));
  document.getElementById('timerMinutes').value = m;
  startBreathAnimation();
  show('scene-timer');
});

function addPoints(n){
  state.points = (state.points||0) + n; save();
}

let timerInterval = null, timerRemain = 0, timerTotal = 0;
const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');
let animReq = null, glowT = 0;

function drawTimer(){
  const w = canvas.width, h = canvas.height, r = 120, cx = w/2, cy = h/2;
  ctx.clearRect(0,0,w,h);
  const glow = 0.1 + 0.15 * Math.abs(Math.sin(glowT));
  ctx.beginPath(); ctx.arc(cx, cy, r+10, 0, Math.PI*2); ctx.fillStyle = `rgba(20,83,45,${glow})`; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*(timerTotal? (1 - timerRemain/timerTotal) : 0), false);
  ctx.strokeStyle = '#14532D'; ctx.lineWidth = 14; ctx.stroke();
  ctx.fillStyle = '#2F3A3C'; ctx.font = 'bold 28px serif'; ctx.textAlign='center';
  const mm = String(Math.floor((timerRemain||0)/60)).padStart(2,'0');
  const ss = String(Math.floor((timerRemain||0)%60)).padStart(2,'0');
  ctx.fillText(`${mm}:${ss}`, cx, cy+10);
}

function tick(){
  timerRemain -= 1;
  if (timerRemain <= 0){ clearInterval(timerInterval); timerInterval = null; addPoints(5); openLoot(); }
  drawTimer();
}

function startTimer(){
  const m = Math.max(1, parseInt(document.getElementById('timerMinutes').value||'10'));
  timerTotal = timerRemain = m*60;
  drawTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer(){ if (!timerInterval) return; clearInterval(timerInterval); timerInterval = null; }
function doneTimer(){ if (timerInterval){ clearInterval(timerInterval); timerInterval = null; } addPoints(5); openLoot(); }

function openLoot(){
  const stickers = ['/assets/img/sticker1.svg','/assets/img/sticker2.svg','/assets/img/sticker3.svg'];
  const pick = stickers[Math.floor(Math.random()*stickers.length)];
  state.loot.push(pick); save();
  document.getElementById('lootSticker').style.backgroundImage = `url('${pick}')`;
  show('scene-loot'); startConfetti();
}

document.getElementById('btnStartTimer').addEventListener('click', startTimer);
document.getElementById('btnPauseTimer').addEventListener('click', pauseTimer);
document.getElementById('btnDoneTimer').addEventListener('click', doneTimer);

function startBreathAnimation(){
  cancelAnimationFrame(animReq);
  function loop(){ glowT += 0.02; drawTimer(); animReq = requestAnimationFrame(loop); }
  loop();
}

document.getElementById('toBoardFromLoot').addEventListener('click', () => { show('scene-board'); });
document.getElementById('toTitle').addEventListener('click', () => { state = initialState(); save(); show('scene-title'); });

const confetti = document.getElementById('confetti');
const cctx = confetti.getContext('2d');
let confettiParticles = [];
function startConfetti(){
  confettiParticles = Array.from({length: 120}, () => ({
    x: Math.random()*confetti.width,
    y: -10 - Math.random()*100,
    vx: -1 + Math.random()*2,
    vy: 1 + Math.random()*2,
    r: 2 + Math.random()*3
  }));
  function loop(){
    cctx.clearRect(0,0,confetti.width,confetti.height);
    confettiParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.02;
      cctx.fillStyle = ['#14532D','#166534','#7C5E43','#2F3A3C'][Math.floor(Math.random()*4)];
      cctx.fillRect(p.x, p.y, p.r, p.r);
    });
    requestAnimationFrame(loop);
  }
  loop();
}

window.addEventListener('load', () => {
  if (state && state.companion) $('#resume').disabled = false; else $('#resume').disabled = true;
  show('scene-title');
});
