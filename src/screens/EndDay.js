import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGame } from '../game/store';

export default function EndDay({ navigation }) {
  const { state, actions } = useGame();
  const done = Object.keys(state.completed || {}).length;
  const total = (state.quests || []).length;

  const finish = () => {
    try { actions?.endDay?.(); } catch {}
    navigation.navigate('Home');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Day Summary</Text>
      <View style={styles.card}>
        <Text style={styles.line}>Quests: {done}/{total}</Text>
        <Text style={styles.line}>XP: {state.xp}</Text>
        <Text style={styles.line}>Coins: {state.coins}</Text>
        <Text style={styles.meta}>Nice work. Tomorrow we roll a new set.</Text>
      </View>

      <Pressable style={styles.btn} onPress={finish}>
        <Text style={styles.btnText}>Finish Day →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  card:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:16, marginBottom:16 },
  line:{ color:'#fff', marginBottom:6 },
  meta:{ color:'#c9cbe0', marginTop:6 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
