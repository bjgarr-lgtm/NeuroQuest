import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Animated, Image } from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';

// simple float/bob animation (works on web; no native driver)
function useFloatLoop(range = 8, duration = 1600, delay = 0) {
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

export default function EndDay({ navigation }) {
  const { state, actions } = useGame();

  // ensure summary exists for today (in case user jumped here directly)
  useEffect(() => {
    if (!state.summary) actions.lockInDay();
  }, [state.summary]);

  const s = state.summary || {
    total: (state.quests || []).length,
    done: Object.keys(state.completed || {}).length,
    gainedXP: 0,
    gainedCoins: 0,
    byCat: {},
  };

  // Insights from history
  const tips = useMemo(() => actions.insights(), [state.history]);

  // Sprite float animations
  const heroMotion = useFloatLoop(10, 1400, 0);
  const compMotion = useFloatLoop(10, 1600, 200);

  const finish = () => {
    // save today to history, roll tomorrow, and go straight to new quests
    actions.endDay({ startNext: true });
    navigation.replace('QuestBoard');
  };

  const heroKey = state.hero || 'bambi';
  const compKey = state.companion || 'molly';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.h1}>End of Day</Text>

      {/* Party card with animated sprites */}
      <View style={styles.partyCard}>
        <View style={styles.avatarCol}>
          <Animated.Image
            source={heroArt[heroKey]}
            style={[
              styles.sprite,
              {
                transform: [
                  { translateY: heroMotion.translateY },
                  { scale: heroMotion.scale },
                ],
              },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.caption}>Hero: {heroKey}</Text>
        </View>

        <View style={styles.avatarCol}>
          <Animated.Image
            source={companionArt[compKey] || heroArt[compKey]}
            style={[
              styles.sprite,
              {
                transform: [
                  { translateY: compMotion.translateY },
                  { scale: compMotion.scale },
                ],
              },
            ]}
            resizeMode="contain"
          />
          <Text style={styles.caption}>Companion: {compKey}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.line}>Quests: {s.done}/{s.total}</Text>
        <Text style={styles.line}>XP earned: {s.gainedXP}</Text>
        <Text style={styles.line}>Coins earned: {s.gainedCoins}</Text>
        <Text style={[styles.line, { marginTop: 6 }]}>By category:</Text>
        {Object.entries(s.byCat || {}).length ? (
          Object.entries(s.byCat).map(([k, v]) => (
            <Text key={k} style={styles.meta}>
              • {k}: {v.done}/{v.total}
            </Text>
          ))
        ) : (
          <Text style={styles.meta}>• (no categories recorded today)</Text>
        )}
      </View>

      {/* Trends & Tips */}
      {!!tips?.length && (
        <View style={styles.card}>
          <Text style={styles.h2}>Trends & Tips</Text>
          {tips.map((t, i) => (
            <Text key={i} style={styles.tip}>• {t}</Text>
          ))}
        </View>
      )}

      {/* Actions */}
      <Pressable style={styles.btnPrimary} onPress={finish}>
        <Text style={styles.btnPrimaryText}>Finish Day → New Quests</Text>
      </Pressable>

      <Pressable
        style={[styles.btnGhost, { marginTop: 12 }]}
        onPress={() => navigation.navigate('Trends')}
      >
        <Text style={styles.btnGhostText}>View Trends</Text>
      </Pressable>

      <Pressable
        style={[styles.btnGhost, { marginTop: 8 }]}
        onPress={() => navigation.navigate('QuestBoard')}
      >
        <Text style={styles.btnGhostText}>Back to Today</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17' },
  h1: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  h2: { color: '#FFD166', fontSize: 16, fontWeight: '700', marginBottom: 6 },

  partyCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#131024',
    borderWidth: 2, borderColor: '#2d2450',
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  avatarCol: { flex: 1, alignItems: 'center' },
  sprite: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2d2450',
    backgroundColor: '#0e0b1d',
  },
  caption: { color: '#c9cbe0', marginTop: 6 },

  card: {
    backgroundColor: '#131024',
    borderWidth: 2, borderColor: '#2d2450',
    borderRadius: 14, padding: 16, marginBottom: 16,
  },
  line: { color: '#fff', marginBottom: 6 },
  meta: { color: '#c9cbe0' },
  tip: { color: '#80FFEA', marginBottom: 4 },

  btnPrimary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#0d0a17', fontWeight: '800' },

  btnGhost: {
    borderWidth: 2, borderColor: '#2d2450',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  btnGhostText: { color: '#fff', fontWeight: '700' },
});
