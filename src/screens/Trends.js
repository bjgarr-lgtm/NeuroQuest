// src/screens/Trends.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { Panel, colors } from '../ui/Skin';

function Bar({ label, pct, color='#46FFC8' }) {
  return (
    <View style={{ marginBottom:12 }}>
      <Text style={{ color:'#c9cbe0', marginBottom:6 }}>{label} — {Math.round(pct*100)}%</Text>
      <View style={{ height:14, borderRadius:999, backgroundColor:'#0f0b1f', borderWidth:2, borderColor:'#2d2450', overflow:'hidden' }}>
        <View style={{ width:`${pct*100}%`, height:'100%', backgroundColor:color }} />
      </View>
    </View>
  );
}

export default function Trends() {
  const { state } = useGame();
  const comp = (state?.completedHistory || []).slice(-14).length;
  const total = Math.max(1,(state?.questHistory || []).slice(-14).length);
  const pct = comp/total;

  return (
    <View style={styles.screen}>
      <TopNav active="Trends" />
      <View style={{ paddingHorizontal:16 }}>
        <Panel title="Trends • last 14 days">
          <Bar label="Daily completion" pct={pct} color="#46FFC8" />
          <Bar label="Focus minutes vs. 60/day" pct={Math.min(1,(state?.focusMin14||0)/ (14*60))} color="#80FFEA" />
          <Bar label="Mood drift (smile ↑)" pct={Math.min(1,(state?.mood14||50)/100)} color="#FFD166" />
          <Text style={{ color:'#c9cbe0', marginTop:6 }}>Tip: Your best streak window looks like late afternoon. Try stacking a 20m “Deep Work” timer there.</Text>
        </Panel>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
});
