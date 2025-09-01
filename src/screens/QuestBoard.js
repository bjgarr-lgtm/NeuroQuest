// src/screens/QuestBoard.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useToasts } from '../ui/Toasts';

// Safe FX imports
import * as FX from '../ui/FX';
const ConfettiBurst = FX.ConfettiBurst || (() => null);
const playSFX       = FX.playSFX       || (() => {});
const haptic        = FX.haptic        || (() => {});
const fxStyles      = FX.fxStyles      || { portal: { position:'absolute', inset:0, pointerEvents:'none' } };
const usePulse      = FX.usePulse      || (() => ({}));

function useFloat(range = 10, dur = 1400, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: dur, delay, useNativeDriver: false }),
        Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: false }),
      ])
    );
    loop.start(); return () => loop.stop();
  }, [v, range, dur, delay]);
  return {
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -range] }) },
      { scale:      v.interpolate({ inputRange: [0, 1], outputRange: [1,  1.04] }) },
    ]
  };
}

function minutesFromTitle(title='') {
  const m = String(title).match(/(\d+)\s*m/gi) || String(title).match(/(\d+)\s*$/);
  const n = m ? parseInt(String(m[0]).replace(/[^\d]/g,''), 10) : 10;
  return Math.max(5, Math.min(60, n || 10));
}

export default function QuestBoard({ navigation }) {
  const { state, actions } = useGame();
  const toasts = useToasts();

  const quests    = state?.quests || [];
  const completed = state?.completed || {};
  const heroKey   = state?.hero || 'bambi';
  const compKey   = state?.companion || 'molly';

  const heroAnim = useFloat(10, 1200, 0);
  const compAnim = useFloat(10, 1500, 200);

  const [tapBurst, setTapBurst] = useState(0);
  const [allBurst, setAllBurst] = useState(0);

  const allDone = useMemo(() => quests.length > 0 && quests.every(q => completed[q.id]), [quests, completed]);
  const pulseBorder = usePulse(900);

  const toggleQuest = (q, evt) => {
    if (!completed[q.id]) {
      actions?.completeQuest?.(q);
      setTapBurst(k => k + 1);
      playSFX('coin'); haptic('medium');
      const xp = q.reward?.xp ?? 5; const c = q.reward?.coins ?? 1;
      // try to place popup near tap (web gives pageX/Y; native we just center)
      const x = evt?.nativeEvent?.pageX ? evt.nativeEvent.pageX - 40 : undefined;
      const y = evt?.nativeEvent?.pageY ? evt.nativeEvent.pageY - 20 : undefined;
      toasts?.push?.(`+${xp}⭐  +${c}🪙`, { x, y, color:'#46FFC8' });
    }
  };

  const longPressQuest = (q) => {
    const mins = minutesFromTitle(q.title);
    playSFX('select'); haptic('light');
    navigation.navigate('FocusTimer', { mins });
  };

  useEffect(() => {
    if (allDone) {
      setAllBurst(k => k + 1);
      playSFX('levelup'); haptic('success');
      toasts?.push?.('All quests complete!', { color:'#FFD166' });
    }
  }, [allDone]);

  const goEndDay = () => { actions?.lockInDay?.(); navigation.navigate('EndDay'); };
  const goHome = () => navigation.navigate('Home');

  // Simple weekly boss placeholder (progress via streak % of 7)
  const bossProg = Math.min(1, (state?.streak ?? 0) / 7);

  return (
    <View style={styles.screen}>
      {/* Header row */}
      <View style={styles.topRow}>
        <Text style={styles.h1}>Quest Log</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
          <View style={styles.pill}><Text style={styles.pillText}>🪙 {state?.coins ?? 0}</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>⭐ {state?.xp ?? 0}</Text></View>
          <Pressable onPress={goHome} style={styles.homeBtn}><Text style={{ fontSize:16 }}>🏠</Text></Pressable>
        </View>
      </View>

      {/* Party banner */}
      <View style={styles.banner}>
        <View style={styles.spriteCol}>
          <Animated.Image source={heroArt[heroKey]} style={[styles.sprite, heroAnim]} resizeMode="contain" />
          <Text style={styles.caption}>Hero: {heroKey}</Text>
        </View>
        <View style={styles.rings}>{Array.from({ length: 6 }).map((_, i) => <View key={i} style={styles.ring} />)}</View>
        <View style={styles.spriteCol}>
          <Animated.Image source={companionArt[compKey] || companionArt.molly} style={[styles.sprite, compAnim]} resizeMode="contain" />
          <Text style={styles.caption}>Companion: {compKey}</Text>
        </View>
      </View>

      {/* Weekly boss placeholder */}
      <Panel title="Weekly Boss (cozy mode)" style={{ marginBottom:8 }}>
        <Text style={styles.meta}>Fill this bar by keeping your streak alive.</Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(bossProg*100)}%`, backgroundColor:'#FF7BC3' }]} /></View>
      </Panel>

      {/* Journal list */}
      <Panel title="Daily Quests" style={styles.journal}>
        <View style={fxStyles.portal}><ConfettiBurst burstKey={tapBurst} /></View>

        <ScrollView style={{ flex:1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {quests.map((q) => {
            const done = !!completed[q.id];
            return (
              <TouchableOpacity
                key={q.id}
                activeOpacity={0.92}
                onPress={(e) => toggleQuest(q, e)}
                onLongPress={() => longPressQuest(q)}
                delayLongPress={260}
                style={[styles.entry, done && styles.entryDone]}
              >
                <View style={styles.bullet}><Text style={{ color: done ? colors.mint : colors.gold }}>✦</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, done && { color: colors.mint }]}>{q.title}</Text>
                  <Text style={styles.meta}>+{q.reward?.xp ?? 5} XP · +{q.reward?.coins ?? 1}g · {q.cat ?? 'quest'}</Text>
                </View>
                {done && <Text style={styles.check}>🪙</Text>}
              </TouchableOpacity>
            );
          })}
          {!quests.length && (<Text style={[styles.meta, { marginTop: 8 }]}>No quests yet — tap <Text style={{color:'#fff'}}>End Day</Text> to roll a fresh set.</Text>)}
        </ScrollView>
      </Panel>

      {/* All done celebration */}
      <View style={fxStyles.portal}>
        <ConfettiBurst burstKey={allBurst} count={36} size={24} spread={140} duration={1200} />
      </View>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <ShinyButton onPress={goEndDay} style={[{ borderWidth: 2, borderRadius: 16 }, allDone && pulseBorder]} textStyle={{ fontSize: 16 }}>
          {allDone ? 'All Quests Complete!  End Day →' : 'End Day →'}
        </ShinyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17', padding: 16 },
  topRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  h1:     { color: '#fff', fontSize: 20, fontWeight: '800' },

  pill:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  pillText:{ color:'#c9cbe0', fontWeight:'700' },
  homeBtn:{ backgroundColor:'#fff', borderRadius:10, paddingHorizontal:10, paddingVertical:6 },

  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1728', borderWidth: 2, borderColor: '#2d2450', borderRadius: 18,
    padding: 10, marginBottom: 12,
  },
  spriteCol: { flex: 1, alignItems: 'center' },
  sprite:    { width: '100%', height: 170, borderRadius: 12, backgroundColor: '#0e0b1d', borderWidth: 2, borderColor: '#2d2450' },
  caption:   { color: '#c9cbe0', marginTop: 6, fontSize: 12 },

  rings:  { width: 36, alignItems: 'center', gap: 10, paddingVertical: 6 },
  ring:   { width: 12, height: 12, borderRadius: 12, backgroundColor: '#211a3a', borderWidth: 2, borderColor: '#3a2c66' },

  journal: { flex:1, minHeight:0, marginTop: 6, position: 'relative' },

  entry: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#18122c', borderRadius: 12,
    borderWidth: 2, borderColor: '#2d2450', padding: 12, marginBottom: 10,
  },
  entryDone: { backgroundColor: '#0f1e1b', borderColor: '#46FFC8' },
  bullet:    { width: 26, alignItems: 'center', marginRight: 8 },
  title:     { color: '#fff', fontSize: 16, marginBottom: 2 },
  meta:      { color: '#c9cbe0' },
  check:     { color: '#FFD166', fontSize: 18, paddingLeft: 8 },

  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },

  track:{ height:14, borderRadius:999, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0f0b1f', overflow:'hidden' },
  fill:{ height:'100%' },
});
