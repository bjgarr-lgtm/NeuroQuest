import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';
import { useFloat } from '../ui/FX';

export default function Home({ navigation }) {
  const { state } = useGame();
  const floatA = useFloat(8, 1300);
  const floatB = useFloat(8, 1600);

  const heroKey = state.hero || 'bambi';
  const compKey = state.companion || 'molly';

  const xpPct = Math.min(100, (state.xp % 100)); // simple loop to 100
  const coinPct = Math.min(100, Math.round((state.coins % 200)/2));

  const xpW = useRef(new Animated.Value(0)).current;
  const cW  = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(xpW,{ toValue: xpPct, duration:500, useNativeDriver:false }).start(); }, [xpPct]);
  useEffect(() => { Animated.timing(cW,{ toValue: coinPct, duration:500, useNativeDriver:false }).start(); }, [coinPct]);

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

          <View style={s.bars}>
            <Text style={s.label}>⭐ XP</Text>
            <View style={s.bar}><Animated.View style={[s.fill, { width: xpW.interpolate({ inputRange:[0,100], outputRange:['0%','100%'] }) }]} /></View>
            <Text style={s.label}>🪙 Coins</Text>
            <View style={s.bar}><Animated.View style={[s.fillGold, { width: cW.interpolate({ inputRange:[0,100], outputRange:['0%','100%'] }) }]} /></View>
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

  bars:{ marginTop:12 },
  label:{ color:'#c9cbe0', marginBottom:6, fontWeight:'700' },
  bar:{ height:14, borderRadius:999, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0f0b1f', overflow:'hidden', marginBottom:10 },
  fill:{ height:'100%', backgroundColor:'#46FFC8' },
  fillGold:{ height:'100%', backgroundColor:'#FFD166' },

  ctaRow:{ flexDirection:'row', marginTop:8 },
  cta:{ flex:1, alignItems:'center', paddingVertical:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b', marginHorizontal:4 },
  ctaTxt:{ color:'#fff', fontWeight:'800' },

  shortRow:{ flexDirection:'row', justifyContent:'space-between' },
  short:{ width:'32%', alignItems:'center', paddingVertical:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b' },
  shortTxt:{ color:'#46FFC8', fontWeight:'800' },
});
