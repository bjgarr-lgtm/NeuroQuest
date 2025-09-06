
let ctx; function ac(){ return ctx || (ctx=new (window.AudioContext||window.webkitAudioContext)()); }
export function beep(freq=880, dur=0.08, type='sine', vol=0.03){
  const a=ac(); const o=a.createOscillator(); const g=a.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(a.destination);
  g.gain.value=vol; o.start(); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime+dur); o.stop(a.currentTime+dur);
}
export const sfx={ ok:()=>beep(1200,0.1,'triangle',0.05), ding:()=>beep(1600,0.12,'sine',0.06), bad:()=>beep(220,0.15,'sawtooth',0.04) };
