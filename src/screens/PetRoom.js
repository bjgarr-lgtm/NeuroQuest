// src/screens/PetRoom.js
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { companionArt } from '../art';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

export default function PetRoom() {
  const [emo, setEmo] = useState('✨');
  const a = useRef(new Animated.Value(0)).current;

  const emote = (icon='✨') => {
    setEmo(icon);
    a.setValue(0);
    Animated.timing(a, { toValue:1, duration:600, useNativeDriver:false }).start();
  };

  const pet = () => {
    emote('❤️'); playSFX('cheer'); haptic('light');
    try {
      const { useGame } = require('../game/store');
      useGame.getState()?.actions?.petInteract?.('pet');
    } catch {}
  };

  const treat = () => {
    emote('🍪'); playSFX('coin'); haptic('medium');
    try {
      const { useGame } = require('../game/store');
      useGame.getState()?.actions?.petInteract?.('treat');
    } catch {}
  };

  const top = a.interpolate({ inputRange:[0,1], outputRange:[0,-28] });
  const op  = a.interpolate({ inputRange:[0,1], outputRange:[0.9,0] });

  const compKey = (require('../game/store').useGame.getState?.().state?.companion) || 'molly';

  return (
    <View style={styles.screen}>
      <Panel title="Pet Room" style={{ margin:16 }}>
        <View style={styles.petStage}>
          <Animated.Image source={companionArt[compKey] || companionArt.molly} resizeMode="contain" style={styles.petImg} />
          <Animated.Text style={[styles.emote, { opacity:op, transform:[{ translateY: top }] }]}>{emo}</Animated.Text>
        </View>

        <View style={styles.actions}>
          <ShinyButton onPress={pet} style={{ flex:1 }}>Pet ❤️</ShinyButton>
          <ShinyButton onPress={treat} style={{ flex:1 }}>Treat 🍪</ShinyButton>
        </View>

        <View style={styles.meterTrack}><View style={[styles.meterFill]} /></View>
        <Text style={styles.meta}>Affection ↑ when you interact & complete quests.</Text>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17' },
  petStage:{ alignItems:'center', justifyContent:'center', paddingVertical:8 },
  petImg:{ width:'100%', height:220, backgroundColor:'#0e0b1d', borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  emote:{ position:'absolute', top:20, fontSize:28 },
  actions:{ flexDirection:'row', gap:10, marginTop:10 },
  meterTrack:{ height:14, backgroundColor:'#0f0b1f', borderRadius:999, borderWidth:2, borderColor:'#2d2450', overflow:'hidden', marginTop:10 },
  meterFill:{ width:'40%', height:'100%', backgroundColor:'#FFD166' },
  meta:{ color:'#c9cbe0', marginTop:6 },
});
