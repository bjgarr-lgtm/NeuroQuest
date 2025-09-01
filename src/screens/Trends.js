// src/screens/Trends.js
// Neon-storybook Trends: spark-bars, animated meters, and bite-size insights.
// Safe fallbacks if game store has no history yet.

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Dimensions } from 'react-native';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const ConfettiBurst = FX.ConfettiBurst || (()=>null);
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const W = Dimensions.get('window').width;
const twoCol = W >= 820;

/* ---------- Mini spark bar ---------- */
function SparkBar({ data = [], color = '#46FFC8', height = 54, pad = 2 }) {
  const max = Math.max(1, ...data);
  return (
    <View style={[styles.sparkWrap, { height }]}>
      {data.map((v, i) => {
        const h = Math.max(2, Math.round((v / max) * (height - 6)));
        return (
          <View
            key={i}
            style={{
              flex: 1, marginHorizontal: pad, justifyContent: 'flex-end',
            }}
          >
            <View style={{ height: h, backgroundColor: color, borderRadius: 4 }} />
          </View>
        );
      })}
    </View>
  );
}

/* ---------- Animated meter ---------- */
function Meter({ label, value = 0.6, color = '#80FFEA' }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: value, duration: 700, useNativeDriver: false }).start();
  }, [value]);
  const width = a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.meterBox}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

/* ---------- Data extraction (safe) ---------- */
function useTrends(range = 14) {
  let st;
  try { st = require('../game/store').useGame.getState?.().state; } catch {}
  // If you have real history: st.history = [{date, completed, total, focusMin, catHits:{main:..,side:..}, hourHits:{morning:..}}]
  const hist = Array.isArray(st?.history) ? st.history.slice(-range) : null;

  // Fallback synthetic baseline so screen looks alive before data exists:
  const seed = (st?.level ?? 1) * 13 + (st?.coins ?? 0);
  const fake = Array.from({ length: range }).map((_, i) => {
    const t = (i + seed) % 10;
    const completed = 2 + (t % 3);      // 2..4
    const total     = 4;                 // keep simple
    const focusMin  = 40 + (t * 5);      // 40..85
    const catHits   = { main: completed - 1, side: 1 + (t % 2), bonus: (t % 2) };
    const hourHits  = { morning: t%3, afternoon: 3 + (t%2), evening: 2 + ((t+1)%2) };
    return { completed, total, focusMin, catHits, hourHits };
  });

  const rows = hist && hist.length ? hist : fake;

  const completion = rows.map(r => (r.total ? r.completed / r.total : 0)); // 0..1
  const focus      = rows.map(r => r.focusMin || 0);                        // minutes
  const tasks      = rows.map(r => r.completed || 0);

  // Aggregate
  const avg = a => (a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0);
  const sum = a => a.reduce((s,x)=>s+x,0);

  const completionAvg = avg(completion);
  const focusAvg      = avg(focus);
  const tasksSum      = sum(tasks);

  // Top category
  const catTotals = rows.reduce((acc, r) => {
    Object.entries(r.catHits || {}).forEach(([k,v]) => acc[k] = (acc[k]||0)+v);
    return acc;
  }, {});
  const topCat = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'main';

  // Best time window
  const hourTotals = rows.reduce((acc, r) => {
    Object.entries(r.hourHits || {}).forEach(([k,v]) => acc[k] = (acc[k]||0)+v);
    return acc;
  }, {});
  const bestTime = Object.entries(hourTotals).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'afternoon';

  return { completion, focus, tasks, completionAvg, focusAvg, tasksSum, topCat, bestTime, range };
}

/* ---------- Toggle chip ---------- */
function Chip({ on, children, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{children}</Text>
    </Pressable>
  );
}

/* ---------- Screen ---------- */
export default function Trends({ navigation }) {
  const [days, setDays] = useState(14);
  const t = useTrends(days);
  const [burstKey, setBurstKey] = useState(0);

  const setRange = (n) => {
    setDays(n);
    setBurstKey(k=>k+1);
    playSFX('select'); haptic('light');
  };

  const NiceTime = { morning:'Morning', afternoon:'Afternoon', evening:'Evening' }[t.bestTime] || 'Afternoon';
  const NiceCat  = { main:'Main', side:'Side', bonus:'Bonus', small:'Small' }[t.topCat] || 'Main';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>
        <View style={styles.topRow}>
          <Text style={styles.h1}>Trends</Text>
          <View style={{ flexDirection:'row', gap:8 }}>
            <Chip on={days===14} onPress={()=>setRange(14)}>14d</Chip>
            <Chip on={days===30} onPress={()=>setRange(30)}>30d</Chip>
          </View>
        </View>

        {/* KPI cards */}
        <View style={[styles.grid, { marginBottom:12 }]}>
          <Panel style={styles.gridItem}>
            <View style={styles.kpiRow}>
              <View style={styles.kpi}>
                <Text style={styles.kpiBig}>{Math.round(t.completionAvg*100)}%</Text>
                <Text style={styles.kpiLabel}>Daily Completion</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.kpiBig}>{Math.round(t.focusAvg)}m</Text>
                <Text style={styles.kpiLabel}>Avg Focus</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.kpiBig}>{t.tasksSum}</Text>
                <Text style={styles.kpiLabel}>Tasks Done</Text>
              </View>
            </View>
            <Meter label="Completion" value={t.completionAvg} color="#46FFC8" />
            <Meter label="Focus health" value={Math.min(1, t.focusAvg/60)} color="#80FFEA" />
          </Panel>

          <Panel style={styles.gridItem}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}><Text style={styles.badgeTxt}>⭐ Best time: {NiceTime}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeTxt}>🗂️ Top cat: {NiceCat}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeTxt}>🔥 Streak-friendly</Text></View>
            </View>
            <View style={{ marginTop:10 }}>
              <Text style={styles.subH}>Tips</Text>
              <View style={styles.tipRow}>
                <View style={styles.tip}><Text style={styles.tipTxt}>✨ Schedule {NiceTime.toLowerCase()} deep work</Text></View>
                <View style={styles.tip}><Text style={styles.tipTxt}>🍬 Keep side quests bite-size</Text></View>
                <View style={styles.tip}><Text style={styles.tipTxt}>🪙 Convert coins → skins for motivation</Text></View>
              </View>
            </View>
          </Panel>
        </View>

        {/* Spark sections */}
        <Panel title="Completion (daily)" style={{ marginBottom:12 }}>
          <SparkBar data={t.completion.map(x=>Math.round(x*100))} color="#46FFC8" />
        </Panel>

        <Panel title="Focus Minutes" style={{ marginBottom:12 }}>
          <SparkBar data={t.focus} color="#80FFEA" />
        </Panel>

        <Panel title="Tasks Completed" style={{ marginBottom:12 }}>
          <SparkBar data={t.tasks} color="#FFD166" />
        </Panel>

        {/* CTA row */}
        <View style={[styles.grid, { marginTop:6 }]}>
          <Panel style={styles.gridItem}>
            <Text style={styles.subH}>Roll fresh quests</Text>
            <Text style={styles.note}>Use what’s working: {NiceTime.toLowerCase()} + {NiceCat.toLowerCase()}.</Text>
            <ShinyButton onPress={()=>navigation.navigate('Home')} style={{ marginTop:10 }}>Back to Home →</ShinyButton>
          </Panel>
          <Panel style={styles.gridItem}>
            <Text style={styles.subH}>Visit Pet Room</Text>
            <Text style={styles.note}>Affection grows with consistent days.</Text>
            <ShinyButton onPress={()=>navigation.navigate('PetRoom')} style={{ marginTop:10 }}>Pet Room →</ShinyButton>
          </Panel>
        </View>

        <View style={FX.fxStyles?.portal || { position:'absolute', inset:0, pointerEvents:'none' }}>
          <ConfettiBurst burstKey={burstKey} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  topRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  h1:{ color:'#fff', fontSize:22, fontWeight:'900' },

  grid:{ flexDirection: twoCol ? 'row' : 'column', gap:12 },
  gridItem:{ flex:1 },

  kpiRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  kpi:{ alignItems:'center', flex:1 },
  kpiBig:{ color:'#fff', fontSize:22, fontWeight:'900' },
  kpiLabel:{ color:'#c9cbe0' },

  badgeRow:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  badge:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  badgeTxt:{ color:'#c9cbe0', fontWeight:'800' },

  subH:{ color:'#fff', fontSize:18, fontWeight:'800', marginBottom:4 },
  note:{ color:'#c9cbe0' },

  tipRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:6 },
  tip:{ backgroundColor:'#18122c', borderWidth:2, borderColor:'#2d2450', borderRadius:12, paddingVertical:8, paddingHorizontal:10 },
  tipTxt:{ color:'#c9cbe0' },

  meterBox:{ marginTop:6, marginBottom:6 },
  meterLabel:{ color:'#c9cbe0', marginBottom:6 },
  meterTrack:{ height:14, backgroundColor:'#0f0b1f', borderRadius:999, borderWidth:2, borderColor:'#2d2450', overflow:'hidden' },
  meterFill:{ height:'100%' },

  sparkWrap:{
    flexDirection:'row',
    backgroundColor:'#0f0b1f',
    borderWidth:2, borderColor:'#2d2450', borderRadius:12,
    paddingVertical:6, paddingHorizontal:4,
    overflow:'hidden',
  },
  chip:{
    paddingVertical:8, paddingHorizontal:12, borderRadius:12,
    borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b'
  },
  chipOn:{ backgroundColor:'#10231e', borderColor:'#46FFC8' },
  chipTxt:{ color:'#c9cbe0', fontWeight:'800' },
  chipTxtOn:{ color:'#46FFC8' },
});
