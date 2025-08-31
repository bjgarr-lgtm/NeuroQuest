
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

const K = 'neuroquest_v2';

const seed = () => ({
  date: dayjs().format('YYYY-MM-DD'),
  xp: 0, coins: 0, level: 1,
  character: null, companion: null,
  quests: { main: [], side: [], bonus: [] },
  cleaning: { small:['Dishes','Trash','Quick tidy'], weekly:['Bathroom'], monthly:['Closet'] },
  coop: ['Draw with kid','Nature walk','Story pile'],
  budget: { pouch: 0, tx: [] },
  logs: {}, trends: { streak: 0, last: null }
});

let S = seed();

export async function loadState(){
  try{
    const raw = await AsyncStorage.getItem(K);
    if (raw){ S = JSON.parse(raw); }
  }catch(e){}
  return S;
}
export async function saveState(){ try{ await AsyncStorage.setItem(K, JSON.stringify(S)); }catch(e){} }

export function getState(){ return S; }
export function setState(next){ S = { ...S, ...next }; return saveState(); }

export function addXP(n){ S.xp += n; const need = S.level*100; if (S.xp >= need){ S.xp -= need; S.level += 1; } return saveState(); }
export function addCoins(n){ S.coins += n; return saveState(); }

export function addQuest(where, txt=''){
  S.quests[where].push({ txt, done:false, ts: Date.now() }); return saveState();
}
export function toggleQuest(where, i, done){
  const t = S.quests[where][i]; if (!t) return;
  t.done = done;
  if (done){ addXP(10); addCoins(5); logDone(t.txt, where); }
  return saveState();
}

export function logDone(txt, where){
  const d = dayjs().format('YYYY-MM-DD');
  if (!S.logs[d]) S.logs[d] = { done:[], minutes:0, stuck:0, tx:[] };
  S.logs[d].done.push({ txt, where, t: Date.now() });
}

export function addTx(name, amt){
  S.budget.tx.push({ name, amt, time: Date.now() });
  S.budget.pouch += amt; return saveState();
}

export function computeTrends(days=14){
  const horizon = Date.now() - days*864e5;
  let done=0, minutes=0, stuck=0, byHour=[0,0,0], cats={};
  for (const [d,val] of Object.entries(S.logs)){
    if (new Date(d).getTime() >= horizon){
      done += (val.done||[]).length; minutes += val.minutes||0; stuck += val.stuck||0;
      (val.done||[]).forEach(x=>{
        const hr = new Date(x.t).getHours();
        if (hr<12) byHour[0]++; else if (hr<18) byHour[1]++; else byHour[2]++;
        cats[x.where]=(cats[x.where]||0)+1;
      });
    }
  }
  const bestTime = byHour.indexOf(Math.max(...byHour));
  const timeName = ['morning','afternoon','evening'][bestTime];
  const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]?.[0]||'main';
  const rate = done / Math.max(1, Object.keys(S.logs).length || 1);
  return { done, minutes, stuck, timeName, topCat, rate: Math.round(rate*100) };
}
