import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { colors, Panel, ShinyButton } from '../ui/Skin';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { heroArt } from '../art';

export default function CharacterSelect({ navigation }) {
  const { state, actions } = useGame();
  const [sel, setSel] = useState(state?.hero || null);

  const heroKeys = useMemo(() => Object.keys(heroArt || {}), []);
  const canNext = !!sel;

  const onNext = () => {
    actions?.setParty?.(sel, state?.companion || 'molly');
    navigation.navigate('Companion');
  };

  return (
    <View style={s.screen}>
      <TopNav active="Dashboard" />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Choose your Hero">
          <View style={s.grid}>
            {heroKeys.map((k) => (
              <Pressable
                key={k}
                onPress={() => setSel(k)}
                style={[s.card, sel === k && s.cardActive]}
              >
                <Image
                  source={heroArt[k]}
                  style={s.art}
                  resizeMode="contain"
                />
                <Text style={s.name}>{k}</Text>
              </Pressable>
            ))}
          </View>

          <ShinyButton style={[s.cta, !canNext && { opacity:0.5 }]} onPress={onNext} disabled={!canNext}>
            Next →
          </ShinyButton>
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  grid:{
    flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between',
  },
  card:{
    width:'48%',
    backgroundColor:'#131024',
    borderWidth:2, borderColor: colors.border, borderRadius:14,
    padding:10, marginBottom:12, alignItems:'center',
  },
  cardActive:{ borderColor:'#46FFC8', backgroundColor:'#0f1e1b' },
  art:{ width:'100%', height:160, backgroundColor:'transparent' }, // kill white box
  name:{ color:'#fff', marginTop:6, fontWeight:'800', textTransform:'capitalize' },
  cta:{ marginTop:8 },
});
