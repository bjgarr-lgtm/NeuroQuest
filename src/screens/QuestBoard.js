import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGame } from '../game/store';
import ConfettiBurst from '../juice/ConfettiBurst';
import AnimPressable from '../juice/AnimPressable';

function Toast({ text }) {
  if (!text) return null;
  return <View style={styles.toast}><Text style={styles.toastText}>{text}</Text></View>;
}

export default function QuestBoard() {
  const { state, actions } = useGame();
  const [toast, setToast] = useState('');
  const [pop, setPop] = useState(false);

  const isDone = useCallback((id) => !!state.completed[id], [state.completed]);

  const complete = (q) => {
    actions.completeQuest(q);
    setToast(`✨ +${q.reward.xp} XP  +${q.reward.coins} coins`);
    setPop(true);
    setTimeout(() => { setToast(''); setPop(false); }, 900);
  };

  const data = state.quests ?? [];
  const renderItem = ({ item: q }) => (
    <View style={[styles.card, isDone(q.id) && styles.done]}>
      <Text style={styles.title}>{q.title}</Text>
      <Text style={styles.meta}>+{q.reward.xp} XP • +{q.reward.coins} coins</Text>
      {!isDone(q.id) ? (
        <AnimPressable style={styles.btn} onPress={() => complete(q)}>
          <Text style={styles.btnText}>Complete</Text>
        </AnimPressable>
      ) : (
        <Text style={styles.check}>✓ Done</Text>
      )}
    </View>
  );

  if (data.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.h1}>Daily Quests</Text>
        <Text style={styles.meta}>No quests yet. Roll today’s set.</Text>
        <AnimPressable style={styles.btn} onPress={actions.startDay}>
          <Text style={styles.btnText}>Roll Quests</Text>
        </AnimPressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Daily Quests</Text>
      <FlatList
        data={data}
        keyExtractor={(q) => q.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }} // ← room for bottom area on mobile
        style={{ flex: 1 }}
      />
      <Toast text={toast} />
      {pop && <ConfettiBurst count={26} onFinish={() => setPop(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  card:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:12, marginBottom:10,
         shadowColor:'#B887FF', shadowOpacity:0.2, shadowRadius:8, shadowOffset:{width:0,height:2} },
  title:{ color:'#fff', fontSize:16 },
  meta:{ color:'#b9bfd3', marginBottom:8 },
  btn:{ alignSelf:'flex-start', backgroundColor:'#fff', paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  done:{ opacity:0.6 },
  check:{ color:'#c9cbe0' },
  toast:{ position:'absolute', bottom:20, left:16, right:16, backgroundColor:'#1b1731',
          borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:10, alignItems:'center' },
  toastText:{ color:'#80FFEA', fontWeight:'700' },
});
