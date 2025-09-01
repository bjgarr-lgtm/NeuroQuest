import React, { useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Animated
} from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

// web-safe float/bob (no native driver)
function useFloatLoop(range = 10, duration = 1400, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, delay, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -range] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  return { translateY, scale };
}

function QuestRow({ q, done, onPress }) {
  const bump = useRef(new Animated.Value(0)).current;
  const press = () => {
    onPress();
    // quick “completed” pulse
    Animated.sequence([
      Animated.timing(bump, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.timing(bump, { toValue: 0, duration: 160, useNativeDriver: false }),
    ]).start();
  };
  const scale = bump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View style={[styles.card, done && styles.done, { transform: [{ scale }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={press}>
        <Text style={styles.title}>{q.title}</Text>
        <Text style={styles.meta}>+{q.reward.xp} XP · +{q.reward.coins}g · {q.cat}</Text>
        {done && <Text style={styles.check}>✓ Completed</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function QuestBoard({ navigation }) {
  const { state, actions } = useGame();
  const { quests = [], completed = {}, hero, companion } = state;

  // Float the party sprites
  const heroMotion = useFloatLoop(10, 1400, 0);
  const compMotion = useFloatLoop(10, 1600, 200);

  // Progress %
  const doneCount = Object.keys(completed).length;
  const total = quests.length || 1;
  const pct = Math.round((doneCount / total) * 100);

  const endDay = () => {
    actions.lockInDay();
    navigation.navigate('EndDay');
  };

  const rollIfEmpty = () => {
    actions.startDay();
  };

  const list = useMemo(() => quests, [quests]);

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Daily Activities</Text>

      {/* Party sprites with float animation */}
      <View style={styles.partyStrip}>
        <Animated.Image
          source={heroArt[hero || 'bambi']}
          resizeMode="contain"
          style={[
            styles.spriteSmall,
            { transform: [{ translateY: heroMotion.translateY }, { scale: heroMotion.scale }] },
          ]}
        />
        <View style={{ width: 10 }} />
        <Animated.Image
          source={companionArt[companion || 'molly'] || heroArt[companion || 'molly']}
          resizeMode="contain"
          style={[
            styles.spriteSmall,
            { transform: [{ translateY: compMotion.translateY }, { scale: compMotion.scale }] },
          ]}
        />
      </View>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <Text style={styles.meta}>Progress: {doneCount}/{total} ({pct}%)</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        {list.map((q) => (
          <QuestRow
            key={q.id}
            q={q}
            done={!!completed[q.id]}
            onPress={() => !completed[q.id] && actions.completeQuest(q)}
          />
        ))}

        {!quests.length && (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={styles.meta}>No quests yet.</Text>
            <Pressable style={[styles.btnGhost, { marginTop: 10 }]} onPress={rollIfEmpty}>
              <Text style={styles.btnGhostText}>Roll Today’s Quests</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <Pressable style={styles.btnPrimary} onPress={endDay}>
          <Text style={styles.btnPrimaryText}>End Day →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17', padding: 16 },
  h1: { color: '#fff', fontSize: 20, marginBottom: 10 },

  partyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginBottom: 12,
  },
  spriteSmall: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2d2450',
    backgroundColor: '#0e0b1d',
  },

  progressCard: {
    backgroundColor: '#131024',
    borderWidth: 2, borderColor: '#2d2450',
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  track: {
    height: 10, borderRadius: 999, backgroundColor: '#241d3f', marginTop: 8, overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#46FFC8' },

  card: {
    backgroundColor: '#131024',
    borderWidth: 2, borderColor: '#2d2450',
    borderRadius: 12, padding: 12, marginBottom: 10,
  },
  title: { color: '#fff', fontSize: 16, marginBottom: 4 },
  meta: { color: '#c9cbe0' },
  check: { color: '#80FFEA', marginTop: 6 },
  done: { borderColor: '#46FFC8', backgroundColor: '#0f1e1b' },

  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  btnPrimary: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: '#0d0a17', fontWeight: '800' },
  btnGhost: {
    borderWidth: 2, borderColor: '#2d2450', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
  },
  btnGhostText: { color: '#fff', fontWeight: '700' },
});
