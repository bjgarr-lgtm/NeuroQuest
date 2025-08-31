import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGame } from '../game/store';

export default function StartDay({ navigation, route }) {
  const { actions } = useGame();
  const heroKey = route?.params?.heroKey ?? '—';
  const companionKey = route?.params?.companionKey ?? '—';

  const begin = () => {
    actions.setParty(heroKey, companionKey);
    actions.startDay(); // rolls daily quests + resets meters
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Start Day</Text>
      <Text style={styles.sub}>Hero: {heroKey} • Companion: {companionKey}</Text>

      <View style={styles.panel}>
        <Text style={styles.section}>Today&apos;s Plan</Text>
        <Text style={styles.item}>• We’ll roll quests and set your XP goal.</Text>
        <Text style={styles.item}>• Your companion reacts to completions.</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={() => navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={styles.btn} onPress={begin}><Text style={styles.btnText}>Begin Adventure →</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, padding:16, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:6 },
  sub:{ color:'#b9bfd3', marginBottom:12 },
  panel:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:12 },
  section:{ color:'#ffd166', marginBottom:6 },
  item:{ color:'#c9cbe0', marginBottom:4 },
  row:{ flexDirection:'row', gap:10, marginTop:6 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnGhost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
