// src/screens/PetRoom.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { companionArt } from '../art';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

export default function PetRoom() {
  const { state, actions } = useGame();
  const insets = useSafeAreaInsets();
  const FOOTER_H = 64;

  const compKey = state?.companion || 'molly';
  const affection = state?.pet?.affection ?? 0;

  const pet = () => { actions?.petInteract?.('pet'); playSFX('sparkle'); haptic('light'); };
  const treat = () => { actions?.petInteract?.('treat'); playSFX('coin'); haptic('medium'); };

  return (
    <View style={styles.screen}>
      <TopNav active="Pet" />

      <Panel title="Pet Room" style={styles.panel}>
        <ScrollView
          style={{ flex:1, minHeight:0 }}
          contentContainerStyle={{ padding:16, paddingBottom: FOOTER_H + insets.bottom + 24 }}
          showsVerticalScrollIndicator
        >
          <View style={styles.stage}>
            <Image
              source={companionArt[compKey] || companionArt.molly}
              style={styles.petImg}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.h2}>Affection</Text>
          <View style={styles.barWrap}>
            <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, affection))}%` }]} />
          </View>
          <Text style={styles.meta}>{affection}/100 • unlock cosmetics as you bond</Text>
        </ScrollView>
      </Panel>

      {/* sticky footer actions */}
      <View style={[styles.footer, { bottom: insets.bottom + 12 }]}>
        <ShinyButton style={{ flex:1, marginRight:8 }} onPress={pet}>Pet ❤️</ShinyButton>
        <ShinyButton style={{ flex:1, marginLeft:8 }} onPress={treat}>Treat 🍪</ShinyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  panel:{ flex:1, minHeight:0, marginHorizontal:16 },
  stage:{
    height:260, borderRadius:16, borderWidth:2, borderColor:'#2d2450',
    backgroundColor:'#131024', alignItems:'center', justifyContent:'center', marginBottom:16
  },
  petImg:{ width:'70%', height:'90%' },
  h2:{ color:'#fff', fontWeight:'800', marginBottom:8 },
  barWrap:{ height:14, borderRadius:999, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0f0b1f', overflow:'hidden' },
  barFill:{ height:'100%', backgroundColor:'#FFD166' },
  meta:{ color:'#c9cbe0', marginTop:6 },

  footer:{
    position:'absolute', left:16, right:16,
    flexDirection:'row',
  },
});
