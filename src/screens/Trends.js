import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function Trends({ navigation }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Trends (14–30d)</Text>
      <Text style={styles.item}>Tasks: — • Focus minutes: — • Stuck events: —</Text>
      <Text style={styles.item}>Best time: afternoon • Top category: main • Daily completion: 60%</Text>
      <Pressable style={styles.btn} onPress={()=>navigation.goBack()}>
        <Text style={styles.btnText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, padding:16, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  item:{ color:'#c9cbe0', marginBottom:6 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12, marginTop:8, alignSelf:'flex-start' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
