import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { heroArt } from '../art';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useGame } from '../game/store';

function HeroCard({ id, label, src, selected, onPress }) {
  const scale = new Animated.Value(selected ? 1.02 : 1);
  if (selected) Animated.spring(scale, { toValue:1.04, useNativeDriver:false }).start();

  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardOn]}>
      <Animated.Image source={src} resizeMode="contain" style={[styles.img, { transform:[{ scale }] }]} />
      <Text style={styles.name}>{label}</Text>
    </Pressable>
  );
}

export default function CharacterSelect({ navigation }) {
  const { state, actions } = useGame();
  const [pick, setPick] = useState(state.hero || 'bambi');

  const go = () => {
    actions.setHero(pick);
    navigation.navigate('Companion');
  };

  return (
    <View style={styles.screen}>
      <Panel title="Choose your character" style={{ margin:16 }}>
        <View style={styles.grid}>
          {[
            { id:'bambi', label:'Bambi' },
            { id:'ash',   label:'Ash'   },
            { id:'odin',  label:'Odin'  },
            { id:'fox',   label:'Fox'   },
          ].map(h => (
            <HeroCard
              key={h.id}
              id={h.id}
              label={h.label}
              src={heroArt[h.id]}
              selected={pick === h.id}
              onPress={() => { setPick(h.id); setTimeout(go, 140); }} // auto-advance on click
            />
          ))}
        </View>
        <ShinyButton onPress={go} style={{ marginTop: 8 }}>Next →</ShinyButton>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:{
    flexBasis:'48%',
    backgroundColor: colors.panel,
    borderWidth:2, borderColor: colors.border, borderRadius:16,
    padding:10, alignItems:'center',
  },
  cardOn:{ borderColor: colors.neon, shadowColor: colors.neon, shadowOpacity:0.5, shadowRadius:12 },
  img:{ width:'100%', height:180, borderRadius:12, backgroundColor: colors.ink, borderWidth:2, borderColor: colors.border },
  name:{ color:'#c9cbe0', marginTop:6 },
});
