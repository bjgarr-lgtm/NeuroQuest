// src/screens/Home.js
// Finch-like dashboard: animated meters, currency, skins preview, and big CTA.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Dimensions } from 'react-native';
import { useGame } from '../game/store';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const ConfettiBurst = FX.ConfettiBurst || (() => null);
const playSFX       = FX.playSFX       || (() => {});
const haptic        = FX.haptic        || (() => {});

const W = Dimensions.get('window').width;
const twoCol = W >= 840;

function useMeter(to = 0.7, duration = 900) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: to, duration, useNativeDriver: false }).start();
  }, [to]);
  return v;
}

function Meter({ label, value = 0.6, color = '#80FFEA' }) {
  const v = useMeter(value);
  const width = v.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });
  return (
    <View style={styles.meterBox}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CardStat({ emoji, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SkinTile({ name, price = 50, owned = false, onBuy }) {
  return (
    <Pressable onPress={onBuy} style={[styles.skinTile, owned && styles.skinOwned]} disabled={owned}>
      <Text style={styles.skinArt}>{owned ? '🧥' : '🪄'}</Text>
      <Text style={styles.skinName}>{name}</Text>
      <Text style={styles.skinPrice}>{owned ? 'Owned' : `🪙 ${price}`}</Text>
    </Pressable>
  );
}

export default function Home({ navigation }) {
  const { state, actions } = useGame();
  const [burstKey, setBurstKey] = useState(0);

  const level = state?.level ?? 1;
  const xp    = state?.xp ?? 0;
  const coins = state?.coins ?? 0;

  // demo trend values—replace with real stats later
  const completion = Math.min(1, (state?.daysDone ?? 0) / 7);
  const focus      = Math.min(1, (state?.focusMin ?? 120) / 180);
  const streak     = Math.min(1, (state?.streak ?? 2) / 7);

  const begin = () => {
    playSFX('select'); haptic('light');
    navigation.navigate('Start');
  };

  const maybeBuy = (name, price = 50) => {
    if ((state?.coins ?? 0) < price) {
      playSFX('cheer');
      return;
    }
    if (actions?.buySkin) actions.buySkin(name, price);
    else if (actions?.spendCoins) actions.spendCoins(price);
    setBurstKey(k => k + 1);
    playSFX('coin'); haptic('medium');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>
        <View style={styles.topRow}>
          <Text style={styles.h1}>Dashboard</Text>
          <View style={{ flexDirection:'row', gap:10 }}>
            <View style={styles.pill}><Text style={styles.pillText}>🪙 {coins}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>⭐ {xp}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Lvl {level}</Text></View>
          </View>
        </View>

        {/* Stats overview */}
        <View style={[styles.grid, { marginBottom:12 }]}>
          <Panel style={styles.gridItem}>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <CardStat emoji="🔥" label="Streak" value={`${state?.streak ?? 0}d`} />
              <CardStat emoji="✅" label="Completed" value={`${state?.completedCount ?? 0}`} />
              <CardStat emoji="⏱️" label="Focus" value={`${state?.focusMin ?? 0}m`} />
            </View>
          </Panel>

          <Panel style={styles.gridItem}>
            <Meter label="Daily completion" value={completion} color="#46FFC8" />
            <Meter label="Focus minutes"   value={focus}      color="#80FFEA" />
            <Meter label="Streak health"   value={streak}     color="#FFD166" />
          </Panel>
        </View>

        {/* Skins & Gear */}
        <Panel title="Skins & Gear">
          <View style={FX.fxStyles?.portal || { position:'absolute', inset:0, pointerEvents:'none' }}>
            <ConfettiBurst burstKey={burstKey} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:12 }}>
            <SkinTile name="Neon Hoodie"   price={80} onBuy={() => maybeBuy('Neon Hoodie', 80)} />
            <SkinTile name="Star Cloak"    price={60} onBuy={() => maybeBuy('Star Cloak', 60)} />
            <SkinTile name="Fox Ears"      price={30} onBuy={() => maybeBuy('Fox Ears', 30)} />
            <SkinTile name="Aurora Cape"   price={100} onBuy={() => maybeBuy('Aurora Cape', 100)} />
          </ScrollView>
        </Panel>

        {/* CTA row */}
        <View style={[styles.grid, { marginTop:12 }]}>
          <Panel style={styles.gridItem}>
            <Text style={styles.subH}>Today’s Adventure</Text>
            <Text style={styles.note}>Roll quests, earn coins, level up.</Text>
            <ShinyButton onPress={begin} style={{ marginTop:10 }}>Begin Adventure →</ShinyButton>
          </Panel>

          <Panel style={styles.gridItem}>
            <Text style={styles.subH}>Trends & Tips</Text>
            <Text style={styles.note}>See what’s working over 14–30 days.</Text>
            <ShinyButton onPress={() => navigation.navigate('Trends')} style={{ marginTop:10 }}>Open Trends →</ShinyButton>
          </Panel>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },

  topRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  h1:{ color:'#fff', fontSize:22, fontWeight:'900' },
  pill:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  pillText:{ color:'#c9cbe0', fontWeight:'800' },

  grid:{
    flexDirection: twoCol ? 'row' : 'column',
    gap: 12,
  },
  gridItem:{
    flex: 1,
  },

  meterBox:{ marginBottom:10 },
  meterLabel:{ color:'#c9cbe0', marginBottom:6 },
  meterTrack:{ height:14, backgroundColor:'#0f0b1f', borderRadius:999, borderWidth:2, borderColor:'#2d2450', overflow:'hidden' },
  meterFill:{ height:'100%' },

  statCard:{
    width:'32%', backgroundColor:'#18122c', borderRadius:12,
    borderWidth:2, borderColor:'#2d2450', alignItems:'center', paddingVertical:12
  },
  statEmoji:{ fontSize:20, marginBottom:4 },
  statValue:{ color:'#fff', fontSize:18, fontWeight:'900' },
  statLabel:{ color:'#c9cbe0' },

  subH:{ color:'#fff', fontSize:18, fontWeight:'800', marginBottom:4 },
  note:{ color:'#c9cbe0' },

  skinTile:{
    width:160, height:160, borderRadius:16,
    backgroundColor:'#18122c', borderWidth:2, borderColor:'#2d2450',
    alignItems:'center', justifyContent:'center',
  },
  skinOwned:{ borderColor:'#46FFC8', backgroundColor:'#10231e' },
  skinArt:{ fontSize:36, marginBottom:6 },
  skinName:{ color:'#fff', fontWeight:'800' },
  skinPrice:{ color:'#c9cbe0', marginTop:4 },
});
