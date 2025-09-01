import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useGame } from '../game/store';
import { heroArt } from '../art';
import { Panel, ShinyButton, colors } from '../ui/Skin';

const HEROES = [
  { id: 'bambi', label: 'Bambi' },
  { id: 'ash',   label: 'Ash'   },
  { id: 'odin',  label: 'Odin'  },
  { id: 'fox',   label: 'Fox'   },
];

function Portrait({ src, label, selected, onPress }) {
  const scale = new Animated.Value(selected ? 1.02 : 1);
  if (selected) Animated.spring(scale, { toValue: 1.06, useNativeDriver: false }).start();

  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardOn]}>
      <Animated.Image
        source={src}
        resizeMode="contain"
        style={[styles.img, { transform: [{ scale }] }]}
      />
      <Text style={styles.name}>{label}</Text>
    </Pressable>
  );
}

export default function CharacterSelect({ navigation }) {
  const { state, actions } = useGame();
  const [pick, setPick] = useState(state.hero || 'bambi');

  const chooseAndGo = (id) => {
    setPick(id);
    actions.setHero(id);
    // small delay for the glow/scale feedback to register
    setTimeout(() => navigation.navigate('Companion'), 140);
  };

  const next = () => chooseAndGo(pick);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Panel title="Choose your character" style={styles.panel}>
          <View style={styles.grid}>
            {HEROES.map(h => (
              <Portrait
                key={h.id}
                src={heroArt[h.id]}
                label={h.label}
                selected={pick === h.id}
                onPress={() => chooseAndGo(h.id)}
              />
            ))}
          </View>

          <ShinyButton onPress={next} style={{ marginTop: 8 }}>Next →</ShinyButton>
        </Panel>
      </ScrollView>
    </View>
  );
}

const W = Dimensions.get('window').width;
const cardWidth = W > 640 ? '48%' : '100%';   // responsive: 2 columns on wider screens

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollPad: { padding: 16, paddingBottom: 32 },
  panel: { },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: cardWidth,
    backgroundColor: colors.panel,
    borderWidth: 2, borderColor: colors.border, borderRadius: 16,
    padding: 10, alignItems: 'center',
  },
  cardOn: {
    borderColor: colors.neon,
    shadowColor: colors.neon, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  img: {
    width: '100%',
    aspectRatio: 3/4,            // keeps portraits nicely sized everywhere
    borderRadius: 12,
    backgroundColor: colors.ink,
    borderWidth: 2, borderColor: colors.border,
  },
  name: { color: '#c9cbe0', marginTop: 6 },
});
