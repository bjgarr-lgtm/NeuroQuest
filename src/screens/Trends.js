// src/screens/Trends.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useGame } from '../game/store';

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const dstr = (s) => new Date(s);

function windowed(history, days) {
  if (!history?.length) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  return history.filter(h => dstr(h.date) >= cutoff);
}

function computeTrends(history, days) {
  const H = windowed(history, days);
  if (!H.length) {
    return {
      days: 0, total: 0, done: 0, avg: 0,
      coins: 0, xp: 0, stuck: 0,
      topCat: null, topCatPct: 0,
      bestDow: null, bestDowPct: 0,
      insights: [],
    };
  }

  let total = 0, done = 0, coins = 0, xp = 0, stuck = 0;
  const cats = {};           // {cat:{done,total}}
  const dows = Array(7).fill(0).map(()=>({done:0,total:0}));

  H.forEach(h => {
    total += h.total || 0;
    done  += h.done  || 0;
    coins += h.gainedCoins || 0;
    xp    += h.gainedXP    || 0;
    const dayPct = pct(h.done, h.total);
    if (dayPct <= 25) stuck++;

    const d = dstr(h.date).getDay(); // 0..6
    dows[d].done  += h.done || 0;
    dows[d].total += h.total || 0;

    Object.entries(h.byCat || {}).forEach(([k,v])=>{
      cats[k] ||= {done:0,total:0};
      cats[k].done  += v.done  || 0;
      cats[k].total += v.total || 0;
    });
  });

  // top category by completion rate
  let topCat = null, topCatPct = -1;
  Object.entries(cats).forEach(([k,v])=>{
    const p = pct(v.done, v.total);
    if (p > topCatPct) { topCat = k; topCatPct = p; }
  });

  // best day-of-week
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let bestDowIdx = 0, bestDowPct = -1;
  dows.forEach((v,i)=>{
    const p = pct(v.done, v.total);
    if (p > bestDowPct) { bestDowPct = p; bestDowIdx = i; }
  });

  const avg = pct(done, total);

  const insights = [];
  insights.push(`Avg completion is ${avg}% over the last ${days} days.`);
  if (topCat) insights.push(`Top category: ${topCat} (${topCatPct}%).`);
  insights.push(`Best day: ${names[bestDowIdx]} (${bestDowPct}%).`);
  if (stuck >= 2) insights.push(`Detected ${stuck} stuck days (≤25% complete). Try 1–2 tiny wins early.`);
  if (xp >= 700) insights.push(`High XP period. Consider a lighter recovery day.`);
  if (xp < 200) insights.push(`Low XP period. Schedule a short Focus quest block.`);

  return {
    days: H.length, total, done, avg, coins, xp, stuck,
    topCat, topCatPct, bestDow: names[bestDowIdx], bestDowPct,
    insights,
  };
}

export default function Trends({ navigation }) {
  const { state } = useGame();
  const [win, setWin] = useState(14); // 14 or 30
  const T = useMemo(() => computeTrends(state.history, win), [state.history, win]);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding:16, paddingBottom:32 }}>
      <Text style={styles.h1}>Trends ({win}d)</Text>

      <View style={styles.switch}>
        <Pressable
          onPress={()=>setWin(14)}
          style={[styles.pill, win===14 && styles.pillOn]}>
          <Text style={[styles.pillText, win===14 && styles.pillTextOn]}>14 days</Text>
        </Pressable>
        <Pressable
          onPress={()=>setWin(30)}
          style={[styles.pill, win===30 && styles.pillOn]}>
          <Text style={[styles.pillText, win===30 && styles.pillTextOn]}>30 days</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.item}>Days logged: {T.days}</Text>
        <Text style={styles.item}>Quests: {T.done}/{T.total}  •  Avg completion: {T.avg}%</Text>
        <Text style={styles.item}>XP: {T.xp}  •  Coins: {T.coins}  •  Stuck days: {T.stuck}</Text>
        {T.topCat && (
          <Text style={styles.item}>Top category: {T.topCat} ({T.topCatPct}%)</Text>
        )}
        {T.bestDow && (
          <Text style={styles.item}>Best day: {T.bestDow} ({T.bestDowPct}%)</Text>
        )}
      </View>

      {!!T.insights.length && (
        <View style={styles.card}>
          <Text style={styles.h2}>Insights</Text>
          {T.insights.map((s,i)=>(
            <Text key={i} style={styles.tip}>• {s}</Text>
          ))}
        </View>
      )}

      <Pressable style={styles.btn} onPress={()=>navigation.goBack()}>
        <Text style={styles.btnText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17' },
  h1:{ color:'#fff', fontSize:20, marginBottom:12 },
  h2:{ color:'#FFD166', fontSize:16, marginBottom:6 },
  card:{
    backgroundColor:'#131024',
    borderWidth:2, borderColor:'#2d2450',
    borderRadius:14, padding:16, marginBottom:16
  },
  item:{ color:'#c9cbe0', marginBottom:6 },
  tip:{ color:'#80FFEA', marginBottom:4 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12, alignSelf:'flex-start' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  switch:{ flexDirection:'row', gap:8, marginBottom:12 },
  pill:{
    borderWidth:2, borderColor:'#2d2450', borderRadius:999,
    paddingVertical:6, paddingHorizontal:12,
  },
  pillOn:{ backgroundColor:'#B887FF22', borderColor:'#B887FF' },
  pillText:{ color:'#c9cbe0' },
  pillTextOn:{ color:'#fff', fontWeight:'700' },
});
