import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useGame } from '../game/store';

export default function EndDay({ navigation }) {
  const { state, actions } = useGame();
  const s = state.summary;
  const tips = useMemo(()=> actions.insights(), [state.history]);

  const finish = () => {
    actions.endDay({ startNext:true });
    navigation.navigate('QuestBoard');
  };

  const summary = s || { total:(state.quests||[]).length, done:Object.keys(state.completed||{}).length, gainedXP:0, gainedCoins:0, byCat:{} };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding:16, paddingBottom:32 }}>
      <Text style={styles.h1}>Day Summary</Text>

      <View style={styles.card}>
        <Text style={styles.line}>Quests: {summary.done}/{summary.total}</Text>
        <Text style={styles.line}>XP earned: {summary.gainedXP}</Text>
        <Text style={styles.line}>Coins earned: {summary.gainedCoins}</Text>
        <Text style={[styles.line,{marginTop:6}]}>By category:</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  h2:{ color:'#FFD166', fontSize:16, marginBottom:6 },
  card:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:16, marginBottom:16 },
  line:{ color:'#fff', marginBottom:6 },
  meta:{ color:'#c9cbe0' },
  tip:{ color:'#80FFEA', marginBottom:4 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
