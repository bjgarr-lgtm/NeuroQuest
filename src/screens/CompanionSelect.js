import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { colors, Panel, ShinyButton } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

export default function CompanionSelect({ navigation }) {
  const { state, actions } = useGame();
  const hero = state?.hero || null;
  const [sel, setSel] = useState(state?.companion || null);

  // Companion choices = all characters that are NOT the chosen hero PLUS Molly (dog)
  const allHeroes = useMemo(() => Object.keys(heroArt || {}), []);
  const baseComps = useMemo(() => allHeroes.filter(k => k !== hero), [allHeroes, hero]);
  const options = useMemo(() => {
    const uniq = new Set([...baseComps, 'molly']);
    return Array.from(uniq);
  }, [baseComps]);

  const canBegin = !!sel;

  const begin = () => {
    // lock party, roll the day, and go home
    actions?.setParty?.(hero, sel);
    actions?.startDay?.();
    navigation.replace('Dashboard');
  };

  const artFor = (k) => companionArt[k] || heroArt[k];

  return (
    <View style={s.screen}>
      <TopNav active="Dashboard" />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Companion">
          <View style={s.grid}>
            {options.map((k) => (
              <Pressable
                key={k}
                onPress={() => setSel(k)}
                style={[s.card, sel === k && s.cardActive]}
              >
                <Image
                  source={artFor(k)}
                  style={s.art}
                  resizeMode="contain"
                />
                <Text style={s.name}>{k}</Text>
              </Pressable>
            ))}
          </View>

          <ShinyButton style={[s.cta, !canBegin && { opacity:0.5 }]} onPress={begin} disabled={!canBegin}>
            Begin Adventure →
          </ShinyButton>
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  card:{
    width:'48%',
    backgroundColor:'#131024',
    borderWidth:2, borderColor: colors.border, borderRadius:14,
    padding:10, marginBottom:12, alignItems:'center',
  },
  cardActive:{ borderColor:'#FFD166', backgroundColor:'#2a1f47' },
  art:{ width:'100%', height:160, backgroundColor:'transparent' }, // kill white box
  name:{ color:'#fff', marginTop:6, fontWeight:'800', textTransform:'capitalize' },
  cta:{ marginTop:8 },
});
