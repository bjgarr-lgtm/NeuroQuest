import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGame } from '../game/store';

function Toast({ text }) {
  if (!text) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{text}</Text>
    </View>
  );
}

export default function QuestBoard() {
  const { state, actions } = useGame();
  const [toast, setToast] = useState('');

  const isDone = (id) => !!state.completed[id];

  const complete = (q) => {
    actions.completeQuest(q);
    // tiny “juice”: visible reward toast
    const msg = `✨ +${q.reward.xp} XP  +${q.reward.coins} coins`;
    setToast(msg);
    setTimeout(() => setToast(''), 900);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Daily Quests</Text>

      {state.quests.map((q) => (
        <View key={q.id} style={[styles.card, isDone(q.id) && styles.done]}>
          <Text style={styles.title}>{q.title}</Text>
          <Text style={styles.meta}>+{q.reward.xp} XP • +{q.reward.coins} coins</Text>

          {!isDone(q.id) ? (
            <Pressable style={styles.btn} onPress={() => complete(q)}>
              <Text style={styles.btnText}>Complete</Text>
            </Pressable>
          ) : (
            <Text style={styles.check}>✓ Done</Text>
          )}
        </View>
      ))}

      <Toast text={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  card:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:10 },
  title:{ color:'#fff', fontSize:16 },
  meta:{ color:'#b9bfd3', marginBottom:8 },
  btn:{ alignSelf:'flex-start', backgroundColor:'#fff', paddingVertical:8, paddingHorizontal:14, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  done:{ opacity:0.6 },
  check:{ color:'#c9cbe0' },
  toast:{ position:'absolute', bottom:20, left:16, right:16, backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:10, alignItems:'center' },
  toastText:{ color:'#80FFEA', fontWeight:'700' },
});
