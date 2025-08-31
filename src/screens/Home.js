import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGame } from '../game/store';

export default function Home({ navigation }) {
  const { state } = useGame();
  const pct = Math.min(100, Math.round((state.xp % 200) / 2)); // simple bar %

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Home</Text>
      <View style={styles.panel}>
        <Text style={styles.row}>Lv {state.level} • XP {state.xp} • Coins {state.coins}</Text>
        <View style={styles.bar}><View style={[styles.fill, { width: pct + '%' }]} /></View>
        <Text style={styles.meta}>Energy {state.energy} • Mood {state.mood}</Text>
      </View>

      <Pressable style={styles.btn} onPress={() => navigation.navigate('QuestBoard')}>
        <Text style={styles.btnText}>Open Daily Quests →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  panel:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:12 },
  row:{ color:'#fff' },
  bar:{ height:10, borderRadius:6, backgroundColor:'#241e3f', overflow:'hidden', marginTop:8, marginBottom:6 },
  fill:{ height:'100%', backgroundColor:'#B887FF' },
  meta:{ color:'#c9cbe0' },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
