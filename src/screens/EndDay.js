import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function EndDay({ navigation }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>End Day</Text>

      <View style={styles.panel}>
        <Text style={styles.section}>Daily Summary</Text>
        <Text style={styles.item}>Tasks done: 0</Text>
        <Text style={styles.item}>Focus minutes: 0</Text>
        <Text style={styles.item}>Got stuck: 0</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.section}>Tip</Text>
        <Text style={styles.item}>You tend to do best in the afternoon. Schedule Main Quests there.</Text>
        <Pressable style={styles.btnGhost} onPress={()=>navigation.navigate('Trends')}>
          <Text style={styles.ghostText}>Open Trends</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={()=>navigation.navigate('Start')}><Text style={styles.btnText}>New Day →</Text></Pressable>
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
  btnGhost:{ paddingVertical:10, paddingHorizontal:14, borderRadius:12, borderWidth:2, borderColor:'#2d2450', marginTop:8 },
  ghostText:{ color:'#c9cbe0' },
});
