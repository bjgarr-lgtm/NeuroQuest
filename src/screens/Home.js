import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

function useFloat(range=10, dur=1400) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [v, range, dur]);
  return { transform: [{ translateY: v.interpolate({ inputRange:[0,1], outputRange:[0,-range] }) }] };
}

export default function Home({ navigation }) {
  const { state, actions } = useGame();
  const floatA = useFloat(8, 1300);
  const floatB = useFloat(8, 1600);

  const goQuests = () => navigation.navigate('Quests');
  const goPet    = () => navigation.navigate('PetRoom');

  const heroKey = state?.hero || 'bambi';
  const compKey = state?.companion || 'molly';

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
            <Text style={s.stat}>⭐ XP: {state?.xp ?? 0}</Text>
            <Text style={s.stat}>🪙 Coins: {state?.coins ?? 0}</Text>
            <Text style={s.stat}>🔥 Streak: {state?.streak ?? 0}</Text>
          </View>
          <View style={s.ctaRow}>
            <Pressable style={s.cta} onPress={goQuests}><Text style={s.ctaTxt}>Start Day →</Text></Pressable>
            <Pressable style={s.cta} onPress={goPet}><Text style={s.ctaTxt}>Pet Room</Text></Pressable>
          </View>
        </Panel>

        <Panel title="Shortcuts" style={{ marginTop:12 }}>
          <View style={s.shortRow}>
            <Pressable style={s.short} onPress={() => navigation.navigate('Shop')}><Text style={s.shortTxt}>Shop</Text></Pressable>
            <Pressable style={s.short} onPress={() => navigation.navigate('Trends')}><Text style={s.shortTxt}>Trends</Text></Pressable>
            <Pressable style={s.short} onPress={() => navigation.navigate('EndDay')}><Text style={s.shortTxt}>End Day</Text></Pressable>
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
