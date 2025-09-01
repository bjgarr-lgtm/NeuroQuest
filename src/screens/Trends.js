import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';

export default function Trends() {
  const { state } = useGame();
  const done = state.today.done.length;
  const total = (state.daily || []).length || 3;
  const pct = Math.round((done/total)*100);

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Trends (14–30d)">
          <Text style={s.item}>Daily completion</Text>
          <Bar value={pct} color="#46FFC8" />
          <Text style={s.small}>{done}/{total} today • Streak {state.streak}</Text>

          <View style={{ height:12 }} />

          <Text style={s.item}>XP gained</Text>
          <Bar value={Math.min(100, state.today.xpGain)} color="#7CFFB2" />

          <Text style={[s.item,{ marginTop:12 }]}>Coins earned</Text>
          <Bar value={Math.min(100, state.today.coinGain*2)} color="#FFD166" />

          <Text style={s.small}>More long-range stats coming soon.</Text>
        </Panel>
      </ScrollView>
    </View>
  );
}

function Bar({ value=0, color='#46FFC8' }) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(()=>{ Animated.timing(v,{ toValue:value, duration:500, useNativeDriver:false }).start(); },[value]);
  return (
    <View style={sBar.wrap}>
      <Animated.View style={[sBar.fill,{ backgroundColor:color, width:v.interpolate({ inputRange:[0,100], outputRange:['0%','100%'] }) }]} />
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  item:{ color:'#fff', fontWeight:'800', marginBottom:6 },
  small:{ color:'#c9cbe0', marginTop:6 },
});

const sBar = StyleSheet.create({
  wrap:{ height:14, borderRadius:999, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#0f0b1f', overflow:'hidden' },
  fill:{ height:'100%' },
});
