import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Animated } from 'react-native';
import { colors, Panel } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt } from '../art';

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

export default function CharacterSelect({ navigation }) {
  const { state, actions } = useGame();
  const [sel, setSel] = useState(state?.hero || null);
  const heroKeys = useMemo(() => Object.keys(heroArt || {}), []);
  const float = useFloat();

  const onPick = (k) => { setSel(k); actions?.setParty?.(k, state?.companion || 'molly'); navigation.navigate('Companion'); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Hero">
          <View style={s.grid}>
            {heroKeys.map((k) => (
              <Pressable key={k} onPress={() => onPick(k)} style={[s.card, sel===k && s.cardActive]}>
                <Animated.Image source={heroArt[k]} style={[s.art, float]} resizeMode="contain" />
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
  card:{ width:'48%', backgroundColor:'#131024', borderWidth:2, borderColor: '#2d2450', borderRadius:14, padding:10, marginBottom:12, alignItems:'center' },
  cardActive:{ borderColor:'#46FFC8', backgroundColor:'#0f1e1b' },
  art:{ width:'100%', height:160, backgroundColor:'transparent' },
  name:{ color:'#fff', marginTop:6, fontWeight:'800', textTransform:'capitalize' },
});

