import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useGame } from '../game/store';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { heroArt, companionArt } from '../art';

const HERO_IDS = ['bambi','ash','odin','fox'];
const Nice = s => s.charAt(0).toUpperCase() + s.slice(1);

function Portrait({ src, label, selected, onPress }) {
  const scale = new Animated.Value(selected ? 1.02 : 1);
  if (selected) Animated.spring(scale, { toValue: 1.06, useNativeDriver: false }).start();
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardOn]}>
      <Animated.Image source={src} resizeMode="contain" style={[styles.img, { transform:[{ scale }] }]} />
      <Text style={styles.name}>{label}</Text>
    </Pressable>
  );
}

export default function CompanionSelect({ navigation }) {
  const { state, actions } = useGame();
  const heroChosen = state.hero || 'bambi';

  const options = useMemo(() => {
    const remaining = HERO_IDS.filter(id => id !== heroChosen).map(id => ({
      id, label: Nice(id), src: heroArt[id],
    }));
    return [{ id: 'molly', label: 'Molly', src: companionArt.molly }, ...remaining];
  }, [heroChosen]);

  const [pick, setPick] = useState(options[0]?.id || 'molly');

  const chooseAndGo = (id) => {
    setPick(id);
    actions.setCompanion(id);
    setTimeout(() => navigation.navigate('Start'), 140);
  };

  const next = () => chooseAndGo(pick);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Panel title="Choose your companion" style={styles.panel}>
          <View style={styles.grid}>
            {options.map(o => (
              <Portrait
                key={o.id}
                src={o.src}
                label={o.label}
                selected={pick === o.id}
                onPress={() => chooseAndGo(o.id)}
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
const cardWidth = W > 640 ? '48%' : '100%';

const styles = StyleSheet.create({
  screen: { flex:1, backgroundColor: colors.bg },
  scrollPad: { padding:16, paddingBottom:32 },
  panel: { },
  grid: { flexDirection:'row', flexWrap:'wrap', gap:12 },
  card: {
    flexBasis: cardWidth,
    backgroundColor: colors.panel,
    borderWidth:2, borderColor: colors.border, borderRadius:16,
    padding:10, alignItems:'center',
  },
  cardOn: {
    borderColor: colors.neon,
    shadowColor: colors.neon, shadowOpacity:0.45, shadowRadius:14, shadowOffset:{ width:0, height:0 },
  },
  img: {
    width:'100%', aspectRatio:3/4,
    borderRadius:12, backgroundColor: colors.ink, borderWidth:2, borderColor: colors.border,
  },
  name:{ color:'#c9cbe0', marginTop:6 },
});
