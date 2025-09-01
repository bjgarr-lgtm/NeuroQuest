import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { companionArt } from '../art';

export default function PetRoom() {
  const { state, actions } = useGame();
  const compKey = state.companion || 'molly';
  const affection = state.today.done.length * 5;

  return (
    <View style={s.screen}>
      <TopNav />
      <Panel title="Pet Room" style={{ margin:16, flex:1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom:24 }}>
          <View style={s.stage}>
            <Image source={companionArt[compKey] || companionArt.molly} style={s.petImg} resizeMode="contain" />
          </View>
          <Text style={s.h2}>Affection</Text>
          <View style={s.bar}><View style={[s.fill, { width: `${Math.min(100, affection)}%` }]} /></View>
          <Text style={s.meta}>{Math.min(100, affection)}/100 • unlock cosmetics as you bond</Text>
          <View style={{ flexDirection:'row', marginTop:12 }}>
            <ShinyButton style={{ flex:1, marginRight:8 }} onPress={()=>actions.completeQuest({ id:'pet', reward:{ xp:0, coins:1 }})}>Pet ❤️</ShinyButton>
            <ShinyButton style={{ flex:1, marginLeft:8 }} onPress={()=>actions.completeQuest({ id:'treat', reward:{ xp:0, coins:1 }})}>Treat 🍪</ShinyButton>
          </View>
        </ScrollView>
      </Panel>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  stage:{ height:260, borderRadius:16, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#131024', alignItems:'center', justifyContent:'center', marginBottom:16 },
  petImg:{ width:'70%', height:'90%', backgroundColor:'transparent' },
  h2:{ color:'#fff', fontWeight:'800', marginBottom:8 },
  bar:{ height:14, borderRadius:999, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0f0b1f', overflow:'hidden' },
  fill:{ height:'100%', backgroundColor:'#FFD166' },
  meta:{ color:'#c9cbe0', marginTop:6 },
});
