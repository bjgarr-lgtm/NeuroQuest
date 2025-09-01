// StartDay.js — simple, reliable start gate
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

export default function StartDay({ navigation, route }) {
  const { state, actions } = useGame();
  const heroKey = route?.params?.heroKey ?? state.hero ?? 'bambi';
  const companionKey = route?.params?.companionKey ?? state.companion ?? 'molly';

  // ensure party is stored (coming from deep refresh/back)
  if (state.hero !== heroKey || state.companion !== companionKey) {
    actions.setParty(heroKey, companionKey);
  }

  const begin = () => {
    actions.startDay();               // roll quests for today
    navigation.replace('QuestBoard'); // go straight to quests
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Begin Adventure</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Image source={heroArt[heroKey]} style={styles.img} resizeMode="contain" />
          <Text style={styles.caption}>Hero: {heroKey}</Text>
        </View>
        <View style={styles.card}>
          <Image source={companionArt[companionKey] || heroArt[companionKey]} style={styles.img} resizeMode="contain" />
          <Text style={styles.caption}>Companion: {companionKey}</Text>
        </View>
      </View>

      <Pressable style={styles.btn} onPress={begin}>
        <Text style={styles.btnText}>Begin Adventure →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16, gap:16 },
  h1:{ color:'#fff', fontSize:20, fontWeight:'800' },
  row:{ flexDirection:'row', gap:12 },
  card:{ flex:1, backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:10, alignItems:'center' },
  img:{ width:'100%', height:220, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  caption:{ color:'#c9cbe0', marginTop:6 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'800' },
});
