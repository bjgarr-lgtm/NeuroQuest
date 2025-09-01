import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { colors, Panel } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt } from '../art';
import { useFloat, usePulse } from '../ui/FX';

export default function CharacterSelect({ navigation }) {
  const { state, actions } = useGame();
  const heroKeys = useMemo(()=>Object.keys(heroArt||{}), []);
  const float = useFloat(8, 1400);
  const pulse = usePulse();

  const pick = (k) => { actions.setParty(k, state.companion || 'molly'); navigation.navigate('Companion'); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Hero">
          <View style={s.grid}>
            {heroKeys.map(k => (
              <Pressable key={k} onPress={()=>pick(k)} style={s.card}>
                <Animated.Image source={heroArt[k]} style={[s.art, float, pulse]} resizeMode="contain" />
                <Text style={s.name}>{k}</Text>
              </Pressable>
            ))}
          </View>
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
});
