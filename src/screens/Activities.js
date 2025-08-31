
import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { colors, neon } from '../theme';
import Button from '../components/Button';
import { addXP, getState, loadState } from '../state/store';

export default function Activities({ navigation }){
  const [left, setLeft] = useState(600);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  const draw = (sec)=>{
    const m = String(Math.floor(sec/60)).padStart(2,'0');
    const s = String(sec%60).padStart(2,'0');
    return `${m}:${s}`;
  };

  useEffect(()=>{ loadState(); },[]);

  const start = ()=>{
    if (ref.current) return;
    setRunning(true);
    ref.current = setInterval(()=>{
      setLeft((v)=>{
        if (v<=1){ clearInterval(ref.current); ref.current=null; setRunning(false); addXP(20); }
        return v-1;
      });
    }, 1000);
  };
  const stop = ()=>{ if (ref.current){ clearInterval(ref.current); ref.current=null; } setRunning(false); };

  return (
    <View style={{flex:1, backgroundColor:colors.bg, padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:12}}>Focus Timer</Text>
        <Text style={{color:colors.ink, fontSize:32, textAlign:'center', marginBottom:12}}>{draw(left)}</Text>
        <View style={{flexDirection:'row', gap:8, justifyContent:'center'}}>
          <Button title="5m" onPress={()=>setLeft(300)} />
          <Button title="10m" onPress={()=>setLeft(600)} />
          <Button title="20m" onPress={()=>setLeft(1200)} />
          {!running ? <Button title="Start" onPress={start} /> : <Button title="Stop" onPress={stop} />}
        </View>
        <View style={{alignItems:'center', marginTop:12}}>
          <Button title="End Day" variant="primary" onPress={()=>navigation.navigate('EndDay')} />
        </View>
      </View>
    </View>
  );
}
