import React, { useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useGame } from '../game/store';
import { heroArt } from '../art';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { ConfettiBurst, playSFX, haptic, fxStyles } from '../ui/FX';

const HEROES = [
  { id: 'bambi', label: 'Bambi' },
  { id: 'ash',   label: 'Ash'   },
  { id: 'odin',  label: 'Odin'  },
  { id: 'fox',   label: 'Fox'   },
];

// route name in your navigator:
const NEXT_ROUTE = 'Companion';

function Portrait({ src, label, selected, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
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
  const [burstKey, setBurstKey] = useState(0);

  const choose = (id) => {
    setPick(id);
    actions.setHero?.(id);
    setBurstKey(k => k + 1);
    playSFX('select'); haptic('light');
    setTimeout(() => navigation.navigate(NEXT_ROUTE), 160);
  };

  const next = () => choose(pick);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Panel title="Choose your character" style={styles.panel}>
          <View style={fxStyles.portal}><ConfettiBurst burstKey={burstKey} /></View>
          <View style={styles.grid}>
            {HEROES.map(h => (
              <Portrait
                key={h.id}
                src={heroArt[h.id]}
                label={h.label}
                selected={pick === h.id}
                onPress={() => choose(h.id)}
              />
            ))}
          </View>

          <ShinyButton onPress={next} style={{ marginTop: 10 }}>Next →</ShinyButton>
        </Panel>
      </ScrollView>
    </View>
  );
}

const W = Dimensions.get('window').width;
const twoCol = W >= 700;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollPad: { padding: 16, paddingBottom: 32 },
  panel: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: twoCol ? 'space-between' : 'center',
  },
  card: {
    flexBasis: twoCol ? '48%' : '100%',
    maxWidth: 520,
    backgroundColor: colors.panel,
    borderWidth: 2, borderColor: colors.border, borderRadius: 16,
    padding: 10, alignItems: 'center', alignSelf: 'center',
  },
  cardOn: {
    borderColor: colors.neon,
    shadowColor: colors.neon, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
  },
  // Fixed height keeps portraits from going HUGE
  img: { width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.border },
  name: { color: '#c9cbe0', marginTop: 6 },
});
