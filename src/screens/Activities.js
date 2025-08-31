import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function Activities({ navigation }) {
  const [left, setLeft] = useState(600);
  const ticker = useRef(null);

  useEffect(()=>()=>{ if(ticker.current) clearInterval(ticker.current); },[]);
  const start = ()=>{ if(ticker.current) return; ticker.current = setInterval(()=> setLeft(x=>Math.max(0,x-1)), 1000); };
  const stop  = ()=>{ if(ticker.current){ clearInterval(ticker.current); ticker.current=null; } };

  const m = String(Math.floor(left/60)).padStart(2,'0');
  const s = String(left%60).padStart(2,'0');

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Activities</Text>

      <View style={styles.panel}>
        <Text style={styles.section}>Focus Timer</Text>
        <Text style={styles.time}>{m}:{s}</Text>
        <View style={styles.row}>
          <Pressable style={styles.btnGhost} onPress={()=>setLeft(300)}><Text style={styles.ghostText}>5m</Text></Pressable>
          <Pressable style={styles.btnGhost} onPress={()=>setLeft(600)}><Text style={styles.ghostText}>10m</Text></Pressable>
          <Pressable style={styles.btnGhost} onPress={()=>setLeft(1200)}><Text style={styles.ghostText}>20m</Text></Pressable>
          <Pressable style={styles.btn} onPress={start}><Text style={styles.btnText}>Start</Text></Pressable>
          <Pressable style={styles.btn} onPress={stop}><Text style={styles.btnText}>Stop</Text></Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={()=>navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={styles.btn} onPress={()=>navigation.navigate('End')}><Text style={styles.btnText}>End Day →</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, padding:16, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  panel:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:12 },
  section:{ color:'#ffd166', marginBottom:6 },
  time:{ color:'#fff', fontSize:36, marginBottom:8 },
  row:{ flexDirection:'row', gap:10, marginTop:6, flexWrap:'wrap' },
  btn:{ backgroundColor:'#fff', paddingVertical:10, paddingHorizontal:14, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnGhost:{ paddingVertical:10, paddingHorizontal:14, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
