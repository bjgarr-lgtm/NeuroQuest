import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { colors, Panel } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';
import { useFloat, usePulse } from '../ui/FX';

export default function CompanionSelect({ navigation }) {
  const { state, actions } = useGame();
  const float = useFloat(8, 1400);
  const pulse = usePulse();
  const hero = state.hero;

  const options = useMemo(() => {
    const set = new Set([...Object.keys(heroArt||{}), ...Object.keys(companionArt||{})]);
    if (hero) set.delete(hero);
    set.add('molly'); // ensure Molly
    return Array.from(set);
  }, [hero]);

  const artFor = (k) => companionArt[k] || heroArt[k];

  const pick = (k) => { actions.setParty(hero, k); actions.startDay(); navigation.replace('Dashboard'); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Companion">
          <View style={s.grid}>
            {options.map(k => (
              <Pressable key={k} onPress={()=>pick(k)} style={s.card}>
                <Animated.Image source={artFor(k)} style={[s.art, float, pulse]} resizeMode="contain" />
                <Text style={s.name}>{k}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.hint}>Tap an image to begin your adventure.</Text>
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  card:{ width:'48%', backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:10, marginBottom:12, alignItems:'center' },
  art:{ width:'100%', height:160, backgroundColor:'transparent' },
  name:{ color:'#fff', marginTop:6, fontWeight:'800', textTransform:'capitalize' },
  hint:{ color:'#c9cbe0', marginTop:6 },
});
