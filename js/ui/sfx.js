
// js/ui/sfx.js — lightweight synthesized UI sounds + music player
let _ctx=null, _music=null, _musicURL=null;
function ctx(){ if(!_ctx) _ctx=new (window.AudioContext||window.webkitAudioContext)(); return _ctx; }

export function clickBlip(){
  const c=ctx(), o=c.createOscillator(), g=c.createGain();
  o.type='square'; o.frequency.setValueAtTime(880,c.currentTime);
  g.gain.setValueAtTime(0.12,c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.08);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.09);
}
export function rewardChime(){
  const c=ctx(), g=c.createGain(); g.connect(c.destination);
  [880,1320,1760].forEach((f,i)=>{ const o=c.createOscillator(); o.type='triangle'; o.frequency.value=f;
    const gg=c.createGain(); gg.gain.setValueAtTime(0.08,c.currentTime+i*0.03); gg.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.35+i*0.03);
    o.connect(gg).connect(g); o.start(c.currentTime+i*0.03); o.stop(c.currentTime+0.4+i*0.03); });
}
export function partyHorn(){
  const c=ctx(), o=c.createOscillator(), g=c.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(220,c.currentTime);
  o.frequency.exponentialRampToValueAtTime(880,c.currentTime+0.5);
  g.gain.setValueAtTime(0.08,c.currentTime); g.gain.linearRampToValueAtTime(0.0,c.currentTime+0.6);
  o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.6);
}
export function attachGlobalClicks(){
  document.addEventListener('click', ()=>{ try{ ctx().resume(); }catch(_){} clickBlip(); }, {capture:true});
}

export function setupMusicControls(){
  const btn=document.getElementById('musicBtn'); const file=document.getElementById('musicFile');
  if(!btn||!file) return;
  btn.onclick=()=>{
    if(!_music){ _music=new Audio(); _music.loop=true; if(_musicURL) _music.src=_musicURL; }
    if(_music.paused){ _music.play(); btn.textContent='⏸'; } else { _music.pause(); btn.textContent='♫'; }
  };
  file.addEventListener('change', ()=>{
    const f=file.files?.[0]; if(!f) return;
    if(_musicURL) URL.revokeObjectURL(_musicURL);
    _musicURL = URL.createObjectURL(f);
    if(!_music) _music=new Audio();
    _music.src=_musicURL; _music.loop=true; _music.play(); btn.textContent='⏸';
  });
}
