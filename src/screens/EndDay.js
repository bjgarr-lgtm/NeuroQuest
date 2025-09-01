import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGame } from '../game/store';

export default function EndDay({ navigation }) {
  const { state, actions } = useGame();
  const s = state.summary;                 // summary created by lockInDay/endDay
  const tips = useMemo(()=> actions.insights(), [state.history]); // from history

  // if summary not computed (e.g., user landed here directly), compute one now
  const ensureSummary = () => { if (!s) actions.lockInDay(); };

  const finish = () => {
    actions.endDay({ startNext:true });    // save today + roll tomorrow
    navigation.navigate('QuestBoard');     // go straight to the new day’s tasks
  };

  ensureSummary();

  const summary = s || { total:(state.quests||[]).length, done:Object.keys(state.completed||{}).length, gainedXP:0, gainedCoins:0, byCat:{} };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Day Summary</Text>
      <View style={styles.card}>
        <Text style={styles.line}>Quests: {summary.done}/{summary.total}</Text>
        <Text style={styles.line}>XP earned: {summary.gainedXP}</Text>
        <Text style={styles.line}>Coins earned: {summary.gainedCoins}</Text>
        <Text style={[styles.line, {marginTop:6}]}>By category:</Text>
        {Object.entries(summary.byCat || {}).map(([k,v])=>(
          <Text key={k} style={styles.meta}>• {k}: {v.done}/{v.total}</Text>
        ))}
      </View>

      {!!tips?.length && (
        <View style={styles.card}>
          <Text style={styles.h2}>Tips & Trends</Text>
          {tips.map((t,i)=>(<Text key={i} style={styles.tip}>• {t}</Text>))}
        </View>
      )}

      <Pressable style={styles.btn} onPress={finish}>
        <Text style={styles.btnText}>Finish Day → New Quests</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  h2:{ color:'#FFD166', fontSize:16, marginBottom:6 },
  card:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:16, marginBottom:16 },
  line:{ color:'#fff', marginBottom:6 },
  meta:{ color:'#c9cbe0' },
  tip:{ color:'#80FFEA', marginBottom:4 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
