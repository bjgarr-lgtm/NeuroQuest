// src/screens/StartDay.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const MAIN = [
  { id:'deep',   label:'Deep Work 20m',  payload:{xp:15, coins:5, cat:'main'} },
  { id:'admin',  label:'Admin Sweep',    payload:{xp:10, coins:4, cat:'main'} },
  { id:'move',   label:'Move Body 10m',  payload:{xp:10, coins:4, cat:'main'} },
];
const SIDE = [
  { id:'hydrate', label:'Hydrate + Meds',  payload:{xp:5, coins:2,  cat:'side'} },
  { id:'tidy',    label:'Tidy Corner',     payload:{xp:6, coins:2,  cat:'side'} },
  { id:'msg',     label:'Send 1 Message',  payload:{xp:5, coins:2,  cat:'side'} },
];

function Chip({ on, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export default function StartDay({ navigation }) {
  const [main, setMain] = useState(MAIN[0]);
  const [side, setSide] = useState(SIDE[0]);

  const begin = () => {
    playSFX('select'); haptic('light');
    try {
      const { useGame } = require('../game/store');
      const { actions } = useGame.getState();
      actions.startDay({ main, side });   // roll quests for today
    } catch {}
    navigation.navigate('QuestBoard');     // ← go to quests, not Home
  };

  return (
    <View style={styles.screen}>
      <TopNav active="Start" />
      <Panel title="Pick your Main Quest" style={{ marginHorizontal:16 }}>
        <View style={styles.row}>
          {MAIN.map(m => <Chip key={m.id} on={main.id===m.id} label={m.label} onPress={()=>setMain(m)} />)}
        </View>
      </Panel>

      <Panel title="Pick a Side Quest" style={{ margin:16 }}>
        <View style={styles.row}>
          {SIDE.map(s => <Chip key={s.id} on={side.id===s.id} label={s.label} onPress={()=>setSide(s)} />)}
        </View>
      </Panel>

      <View style={{ marginHorizontal:16 }}>
        <ShinyButton onPress={begin}>Begin Adventure →</ShinyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  row:{ flexDirection:'row', flexWrap:'wrap', gap:10 },
  chip:{
    paddingVertical:10, paddingHorizontal:12, borderRadius:12,
    borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b'
  },
  chipOn:{ backgroundColor:'#10231e', borderColor:'#46FFC8' },
  chipText:{ color:'#c9cbe0', fontWeight:'700' },
  chipTextOn:{ color:'#46FFC8' },
});
