import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '../game/store';

export default function Home({ navigation }) {
  const { state } = useGame();
  const pctTarget = Math.min(100, Math.round(((state.xp % 200) / 200) * 100));
  const pctAnim = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    Animated.timing(pctAnim, { toValue: pctTarget, duration: 500, useNativeDriver:false }).start();
  }, [pctTarget]);

  const width = pctAnim.interpolate({ inputRange:[0,100], outputRange:['0%','100%'] });

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Dashboard</Text>

      <View style={styles.panel}>
        <Text style={styles.rowText}>Lv {state.level} • XP {state.xp} • Coins {state.coins}</Text>
        <View style={styles.bar}><Animated.View style={[styles.fill,{ width }]} /></View>
        <Text style={styles.meta}>Energy {state.energy} • Mood {state.mood}</Text>
      </View>

      <View style={styles.grid}>
        <Animated.View style={styles.tile}>
          <Text onPress={()=>navigation.navigate('QuestBoard')} style={styles.tileTitle}>Daily Quests →</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  panel:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:12, marginBottom:12 },
  rowText:{ color:'#fff' },
  bar:{ height:12, borderRadius:8, backgroundColor:'#241e3f', overflow:'hidden', marginTop:8, marginBottom:6 },
  fill:{ height:'100%', backgroundColor:'#B887FF' },
  meta:{ color:'#c9cbe0' },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:12 },
  tile:{ flexBasis:'48%', backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:16,
         shadowColor:'#FF7E6B', shadowOpacity:0.15, shadowRadius:6, shadowOffset:{width:0,height:2} },
  tileTitle:{ color:'#fff', fontWeight:'700' },
});
