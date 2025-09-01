import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, TouchableOpacity, Animated
} from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

// floating bob animation (web safe)
function useFloat(range = 10, dur = 1400, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, delay, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, dur, delay]);
  return {
    transform: [
      { translateY: v.interpolate({ inputRange: [0,1], outputRange: [0, -range] }) },
      { scale:      v.interpolate({ inputRange: [0,1], outputRange: [1, 1.03]  }) },
    ],
  };
}

// simple heart/sparkle burst on tap
function HeartBurst({ show }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!show) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [show]);
  const up = a.interpolate({ inputRange: [0,1], outputRange: [0, -26] });
  const op = a.interpolate({ inputRange: [0,1], outputRange: [0.9, 0] });
  return (
    <Animated.Text style={{ position:'absolute', top:-8, right:14, transform:[{ translateY: up }], opacity: op }}>
      💖✨
    </Animated.Text>
  );
}

export default function QuestBoard({ navigation }) {
  const { state, actions } = useGame();
  const { quests = [], completed = {} } = state;
  const [heroBurst, setHeroBurst] = useState(false);
  const [compBurst, setCompBurst] = useState(false);

  // animated sprites
  const heroAnim = useFloat(10, 1300, 0);
  const compAnim = useFloat(10, 1500, 200);

  const heroKey = state.hero || 'bambi';
  const compKey = state.companion || 'molly';

  const tapHero = () => { setHeroBurst(true); setTimeout(() => setHeroBurst(false), 720); };
  const tapComp = () => { setCompBurst(true); setTimeout(() => setCompBurst(false), 720); };

  const toggle = (q) => {
    if (!completed[q.id]) actions.completeQuest(q);
  };
  const toEnd = () => {
    actions.lockInDay();
    navigation.navigate('EndDay');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Daily Activities</Text>

      {/* Sprites row */}
      <View style={styles.partyRow}>
        <Pressable onPress={tapHero} style={styles.spriteWrap}>
          <Animated.Image
            source={heroArt[heroKey] || heroArt.bambi}
            style={[styles.sprite, heroAnim]}
            resizeMode="contain"
          />
          <HeartBurst show={heroBurst} />
          <Text style={styles.caption}>Hero: {heroKey}</Text>
        </Pressable>

        <Pressable onPress={tapComp} style={styles.spriteWrap}>
          <Animated.Image
            source={companionArt[compKey] || companionArt.molly}
            style={[styles.sprite, compAnim]}
            resizeMode="contain"
          />
          <HeartBurst show={compBurst} />
          <Text style={styles.caption}>Companion: {compKey}</Text>
        </Pressable>
      </View>

      {/* Quests */}
      <ScrollView contentContainerStyle={{ paddingBottom: 88 }}>
        {quests.map((q) => {
          const done = !!completed[q.id];
          return (
            <TouchableOpacity
              key={q.id}
              onPress={() => toggle(q)}
              activeOpacity={0.9}
              style={[styles.card, done && styles.done]}
            >
              <Text style={styles.title}>{q.title}</Text>
              <Text style={styles.meta}>+{q.reward.xp} XP · +{q.reward.coins}g · {q.cat}</Text>
              {done && <Text style={styles.check}>✓ Completed</Text>}
            </TouchableOpacity>
          );
        })}
        {!quests.length && (
          <View style={[styles.card,{alignItems:'center'}]}>
            <Text style={styles.meta}>No quests yet. Tap “End Day” to roll a fresh set.</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <Pressable style={styles.btn} onPress={toEnd}>
          <Text style={styles.btnText}>End Day →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, marginBottom:10 },

  partyRow:{ flexDirection:'row', gap:12, marginBottom:12 },
  spriteWrap:{
    flex:1, alignItems:'center',
    backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:14, padding:10,
  },
  sprite:{
    width:'100%', height:190, borderRadius:10,
    borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0e0b1d',
  },
  caption:{ color:'#c9cbe0', marginTop:6 },

  card:{
    backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450',
    borderRadius:12, padding:12, marginBottom:10,
  },
  title:{ color:'#fff', fontSize:16, marginBottom:4 },
  meta:{ color:'#c9cbe0' },
  check:{ color:'#80FFEA', marginTop:6 },
  done:{ borderColor:'#46FFC8', backgroundColor:'#0f1e1b' },

  footer:{ position:'absolute', left:16, right:16, bottom:16 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:12, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'800' }
});
