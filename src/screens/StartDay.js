// minimal Start Day that always navigates → Activities
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function StartDay({ navigation }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Start Day</Text>

      <View style={styles.panel}>
        <Text style={styles.section}>Daily Quests</Text>
        <Text style={styles.item}>• Main quest</Text>
        <Text style={styles.item}>• Side quest</Text>
        <Text style={styles.item}>• Bonus loot</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.section}>Cleaning Dungeon</Text>
        <Text style={styles.item}>• Dishes • Trash • Quick tidy</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={()=>navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={styles.btn} onPress={()=>navigation.navigate('Activities')}><Text style={styles.btnText}>Begin →</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, padding:16, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  panel:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:12 },
  section:{ color:'#ffd166', marginBottom:6 },
  item:{ color:'#c9cbe0', marginBottom:4 },
  row:{ flexDirection:'row', gap:10, marginTop:6 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnGhost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
