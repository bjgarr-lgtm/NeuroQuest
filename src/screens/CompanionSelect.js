import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Animated } from 'react-native';
import { colors, Panel } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

function useFloat(range=8, dur=1400) {
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

export default function CompanionSelect({ navigation }) {
  const { state, actions } = useGame();
  const hero = state?.hero || null;
  const [sel, setSel] = useState(state?.companion || null);
  const float = useFloat();

  // union of keys (so Fox, Molly, etc. always available)
  const unionKeys = useMemo(() => {
    const keys = new Set([...Object.keys(heroArt||{}), ...Object.keys(companionArt||{})]);
    if (hero) keys.delete(hero);
    keys.add('molly'); // ensure Molly is present
    return Array.from(keys);
  }, [hero]);

  const artFor = (k) => companionArt[k] || heroArt[k];

  const onPick = (k) => { setSel(k); actions?.setParty?.(hero, k); actions?.startDay?.(); navigation.replace('Dashboard'); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Companion">
          <View style={s.grid}>
            {unionKeys.map((k) => (
              <Pressable key={k} onPress={() => onPick(k)} style={[s.card, sel===k && s.cardActive]}>
                <Animated.Image source={artFor(k)} style={[s.art, float]} resizeMode="contain" />
                <Text style={s.name}>{k}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.hint}>Tip: Tap any companion image to begin your adventure.</Text>
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  card:{ width:'48%', backgroundColor:'#131024', borderWidth:2, borderColor: '#2d2450', borderRadius:14, padding:10, marginBottom:12, alignItems:'center' },
  cardActive:{ borderColor:'#FFD166', backgroundColor:'#2a1f47' },
  art:{ width:'100%', height:160, backgroundColor:'transparent' },
  name:{ color:'#fff', marginTop:6, fontWeight:'800', textTransform:'capitalize' },
  hint:{ color:'#c9cbe0', marginTop:6 },
});
