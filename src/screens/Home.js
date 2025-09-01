import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';
import { floatStyle } from '../ui/FX';

export default function Home({ navigation }) {
  const { state } = useGame();
  const floatA = floatStyle(8, 1300);
  const floatB = floatStyle(8, 1600);
  const heroKey = state.hero || 'bambi';
  const compKey = state.companion || 'molly';

  return (
    <View style={s.screen}>
      <TopNav />
      <View style={{ padding:16 }}>
        <Panel title="Party">
          <View style={s.banner}>
            <Animated.Image source={heroArt[heroKey]} style={[s.sprite, floatA]} resizeMode="contain" />
            <View style={{ width:16 }} />
            <Animated.Image source={companionArt[compKey] || companionArt.molly} style={[s.sprite, floatB]} resizeMode="contain" />
          </View>
          <View style={s.statsRow}>
            <Text style={s.stat}>⭐ XP: {state.xp}</Text>
            <Text style={s.stat}>🪙 Coins: {state.coins}</Text>
            <Text style={s.stat}>🔥 Streak: {state.streak}</Text>
          </View>
          <View style={s.ctaRow}>
            <Pressable style={s.cta} onPress={()=>navigation.navigate('Quests')}><Text style={s.ctaTxt}>Start Day →</Text></Pressable>
            <Pressable style={s.cta} onPress={()=>navigation.navigate('PetRoom')}><Text style={s.ctaTxt}>Pet Room</Text></Pressable>
          </View>
        </Panel>

        <Panel title="Shortcuts" style={{ marginTop:12 }}>
          <View style={s.shortRow}>
            <Pressable style={s.short} onPress={()=>navigation.navigate('Shop')}><Text style={s.shortTxt}>Shop</Text></Pressable>
            <Pressable style={s.short} onPress={()=>navigation.navigate('Trends')}><Text style={s.shortTxt}>Trends</Text></Pressable>
            <Pressable style={s.short} onPress={()=>navigation.navigate('EndDay')}><Text style={s.shortTxt}>End Day</Text></Pressable>
          </View>
        </Panel>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  banner:{ flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#0e0b1d', borderWidth:2, borderColor:'#2d2450', borderRadius:16, padding:12 },
  sprite:{ flex:1, height:160, backgroundColor:'transparent' },
  statsRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  stat:{ color:'#c9cbe0', fontWeight:'700' },
  ctaRow:{ flexDirection:'row', marginTop:12 },
  cta:{ flex:1, alignItems:'center', paddingVertical:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b', marginHorizontal:4 },
  ctaTxt:{ color:'#fff', fontWeight:'800' },

  shortRow:{ flexDirection:'row', justifyContent:'space-between' },
  short:{ width:'32%', alignItems:'center', paddingVertical:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b' },
  shortTxt:{ color:'#46FFC8', fontWeight:'800' },
});
