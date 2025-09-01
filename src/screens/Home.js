// src/screens/Home.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const ConfettiBurst = FX.ConfettiBurst || (()=>null);

function Meter({ label, value = 0.6, color = '#80FFEA' }) {
  return (
    <View style={{ marginBottom:10 }}>
      <Text style={{ color:'#c9cbe0', marginBottom:6 }}>{label}</Text>
      <View style={{ height:14, backgroundColor:'#0f0b1f', borderRadius:999, borderWidth:2, borderColor:'#2d2450', overflow:'hidden' }}>
        <View style={{ width: `${Math.round(value*100)}%`, height:'100%', backgroundColor: color }} />
      </View>
    </View>
  );
}

export default function Home({ navigation }) {
  const { state } = useGame();
  const quests = state?.quests || [];
  const completed = state?.completed || {};
  const hasIncomplete = quests.some(q => !completed[q.id]);

  const goAdventure = () => {
    if (hasIncomplete && quests.length) navigation.navigate('QuestBoard'); // resume
    else navigation.navigate('Start');                                    // begin
  };

  return (
    <View style={styles.screen}>
      <TopNav active="Home" />
      <ScrollView contentContainerStyle={{ paddingHorizontal:16, paddingBottom:32 }}>
        <View style={styles.topRow}>
          <Text style={styles.h1}>Dashboard</Text>
          <View style={{ flexDirection:'row', gap:10 }}>
            <View style={styles.pill}><Text style={styles.pillText}>🪙 {state?.coins ?? 0}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>⭐ {state?.xp ?? 0}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Lvl {state?.level ?? 1}</Text></View>
          </View>
        </View>

        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:12 }}>
          <Panel style={{ flexBasis:'48%', flexGrow:1 }}>
            <Text style={styles.subH}>Today</Text>
            <Text style={styles.note}>{hasIncomplete ? 'You have quests to finish.' : 'No quests yet — begin a new day.'}</Text>
            <ShinyButton onPress={goAdventure} style={{ marginTop:10 }}>
              {hasIncomplete ? 'Resume Adventure →' : 'Begin Adventure →'}
            </ShinyButton>
          </Panel>
          <Panel style={{ flexBasis:'48%', flexGrow:1 }}>
            <Text style={styles.subH}>Meters</Text>
            <Meter label="Daily completion" value={Math.min(1,(state?.completedToday||0)/ (quests.length||1))} color="#46FFC8" />
            <Meter label="Focus health" value={Math.min(1,(state?.focusMinToday||0)/60)} color="#80FFEA" />
          </Panel>
        </View>

        <Panel title="Skins & Gear">
          <Text style={styles.note}>Spend coins in the Shop to unlock cosmetics.</Text>
          <ShinyButton onPress={()=>navigation.navigate('Shop')} style={{ marginTop:10 }}>Open Shop →</ShinyButton>
        </Panel>
      </ScrollView>
      <View style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <ConfettiBurst burstKey={0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  topRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  h1:{ color:'#fff', fontSize:22, fontWeight:'900' },
  subH:{ color:'#fff', fontSize:18, fontWeight:'800', marginBottom:4 },
  note:{ color:'#c9cbe0' },
  pill:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', paddingVertical:6, paddingHorizontal:10, borderRadius:999 },
  pillText:{ color:'#c9cbe0', fontWeight:'800' },
});
