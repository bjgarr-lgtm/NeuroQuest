import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useGame } from '../game/store';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { heroArt, companionArt } from '../art';

function PortraitCard({ label, src, selected, onPress }) {
  const scale = new Animated.Value(selected ? 1.02 : 1);
  if (selected) Animated.spring(scale, { toValue: 1.04, useNativeDriver: false }).start();

  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardOn]}>
      <Animated.Image source={src} resizeMode="contain" style={[styles.img, { transform:[{ scale }] }]} />
      <Text style={styles.name}>{label}</Text>
    </Pressable>
  );
}

const HERO_IDS = ['bambi','ash','odin','fox'];
const nice = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CompanionSelect({ navigation }) {
  const { state, actions } = useGame();
  const heroChosen = state.hero || 'bambi';

  // Molly + every hero except the one already chosen
  const options = useMemo(() => {
    const remainingHeroes = HERO_IDS.filter(id => id !== heroChosen).map(id => ({
      id, label: nice(id), kind: 'hero',
      src: heroArt[id],
    }));
    return [
      { id: 'molly', label: 'Molly', kind: 'comp', src: companionArt.molly },
      ...remainingHeroes,
    ];
  }, [heroChosen]);

  const [pick, setPick] = useState(options[0]?.id || 'molly');

  const go = () => {
    actions.setCompanion(pick);
    navigation.navigate('Start'); // proceed to StartDay
  };

  return (
    <View style={styles.screen}>
      <Panel title="Choose your companion" style={{ margin:16 }}>
        <View style={styles.grid}>
          {options.map(opt => (
            <PortraitCard
              key={opt.id}
              label={opt.label}
              src={opt.src}
              selected={pick === opt.id}
              onPress={() => { setPick(opt.id); setTimeout(go, 140); }} // auto-advance on click
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
