import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useGame } from '../game/store';

export default function QuestBoard({ navigation }) {
  const { state, actions } = useGame();
  const { quests = [], completed = {} } = state;

  const toggle = (q) => {
    if (!completed[q.id]) actions.completeQuest(q);
  };

  const toEnd = () => {
    actions.lockInDay();                // compute summary now
    navigation.navigate('EndDay');      // show summary + roll tomorrow there
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Daily Activities</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {quests.map((q) => {
          const done = !!completed[q.id];
          return (
            <TouchableOpacity key={q.id} onPress={() => toggle(q)} activeOpacity={0.9}
              style={[styles.card, done && styles.done]}>
              <Text style={styles.title}>{q.title}</Text>
              <Text style={styles.meta}>+{q.reward.xp} XP · +{q.reward.coins}g · {q.cat}</Text>
              {done && <Text style={styles.check}>✓ Completed</Text>}
            </TouchableOpacity>
          );
        })}
        {!quests.length && (
          <View style={[styles.card,{alignItems:'center'}]}>
            <Text style={styles.meta}>No quests yet. Tap “End Day” to roll a fresh set.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.btn} onPress={toEnd}>
          <Text style={styles.btnText}>End Day →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:10 },
  card:{
    backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450',
    borderRadius:12, padding:12, marginBottom:10
  },
  title:{ color:'#fff', fontSize:16, marginBottom:4 },
  meta:{ color:'#c9cbe0' },
  check:{ color:'#80FFEA', marginTop:6 },
  done:{ borderColor:'#46FFC8', backgroundColor:'#0f1e1b' },
  footer:{
    position:'absolute', left:16, right:16, bottom:16,
  },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'800' }
});
