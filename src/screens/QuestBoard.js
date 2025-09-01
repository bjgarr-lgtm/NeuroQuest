import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useGame } from '../game/store';
import { heroArt, companionArt } from '../art';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { ConfettiBurst, playSFX, haptic, usePulse, fxStyles } from '../ui/FX';

function useFloat(range=10, dur=1400, delay=0){
  const v = useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v,{ toValue:1, duration:dur, delay, useNativeDriver:false }),
      Animated.timing(v,{ toValue:0, duration:dur, useNativeDriver:false }),
    ]));
    loop.start(); return ()=>loop.stop();
  },[v,dur,delay]);
  return {
    transform:[
      { translateY: v.interpolate({ inputRange:[0,1], outputRange:[0,-range] }) },
      { scale: v.interpolate({ inputRange:[0,1], outputRange:[1,1.04] }) },
    ]
  };
}

export default function QuestBoard({ navigation }) {
  const { state, actions } = useGame();
  const { quests = [], completed = {} } = state;

  const heroKey = state.hero || 'bambi';
  const compKey = state.companion || 'molly';
  const heroAnim = useFloat(10,1200,0);
  const compAnim = useFloat(10,1500,200);

  const [burstKey, setBurstKey] = useState(0);
  const [bigBurst, setBigBurst] = useState(0);

  // footer pulse when all done
  const allDone = useMemo(() => quests.length > 0 && quests.every(q => completed[q.id]), [quests, completed]);
  const pulseBorder = usePulse(900);

  const toggle = (q) => {
    if (!completed[q.id]) {
      actions.completeQuest(q);
      setBurstKey(k => k + 1);
      playSFX('coin'); haptic('medium');
    }
  };

  useEffect(() => {
    if (allDone) { setBigBurst(k=>k+1); playSFX('levelup'); haptic('success'); }
  }, [allDone]);

  const toEnd = () => { actions.lockInDay(); navigation.navigate('EndDay'); };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Quest Log</Text>

      {/* Party banner */}
      <View style={styles.banner}>
        <View style={styles.spriteCol}>
          <Animated.Image source={heroArt[heroKey]} style={[styles.sprite, heroAnim]} resizeMode="contain" />
          <Text style={styles.caption}>Hero: {heroKey}</Text>
        </View>
        <View style={styles.rings}>{Array.from({length:6}).map((_,i)=>(<View key={i} style={styles.ring}/>))}</View>
        <View style={styles.spriteCol}>
          <Animated.Image source={companionArt[compKey] || companionArt.molly} style={[styles.sprite, compAnim]} resizeMode="contain" />
          <Text style={styles.caption}>Companion: {compKey}</Text>
        </View>
      </View>

      {/* Journal with confetti layer */}
      <Panel title="Daily Quests" style={styles.journal}>
        <View style={fxStyles.portal}><ConfettiBurst burstKey={burstKey} /></View>
        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
          {quests.map((q) => {
            const done = !!completed[q.id];
            return (
              <TouchableOpacity
                key={q.id}
                activeOpacity={0.92}
                onPress={() => toggle(q)}
                style={[styles.entry, done && styles.entryDone]}
              >
                <View style={styles.bullet}><Text style={{color: done ? colors.mint : colors.gold}}>✦</Text></View>
                <View style={{ flex:1 }}>
                  <Text style={[styles.title, done && { color: colors.mint }]}>{q.title}</Text>
                  <Text style={styles.meta}>+{q.reward.xp} XP · +{q.reward.coins}g · {q.cat}</Text>
                </View>
                {done && <Text style={styles.check}>🪙</Text>}
              </TouchableOpacity>
            );
          })}
          {!quests.length && <Text style={[styles.meta,{marginTop:8}]}>No quests—End Day to roll a fresh set.</Text>}
        </ScrollView>
      </Panel>

      {/* Big celebration layer when all done */}
      <View style={fxStyles.portal}><ConfettiBurst burstKey={bigBurst} count={36} size={24} spread={140} duration={1200} /></View>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <ShinyButton
          onPress={toEnd}
          style={[{ borderWidth:2, borderRadius:16 }, allDone && pulseBorder]}
          textStyle={{ fontSize:16 }}
        >
          {allDone ? 'All Quests Complete!  End Day →' : 'End Day →'}
        </ShinyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h1:{ color:'#fff', fontSize:20, fontWeight:'800', marginBottom:10 },

  banner:{
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    backgroundColor:'#1a1728', borderWidth:2, borderColor:'#2d2450', borderRadius:18,
    padding:10, marginBottom:12,
  },
  spriteCol:{ flex:1, alignItems:'center' },
  sprite:{ width:'100%', height:170, borderRadius:12, backgroundColor:'#0e0b1d', borderWidth:2, borderColor:'#2d2450' },
  caption:{ color:'#c9cbe0', marginTop:6, fontSize:12 },
  rings:{ width:36, alignItems:'center', gap:10, paddingVertical:6 },
  ring:{ width:12, height:12, borderRadius:12, backgroundColor:'#211a3a', borderWidth:2, borderColor:'#3a2c66' },

  journal:{ marginTop:6, position:'relative' },

  entry:{
    flexDirection:'row', alignItems:'center',
    backgroundColor:'#18122c', borderRadius:12,
    borderWidth:2, borderColor:'#2d2450', padding:12, marginBottom:10,
  },
  entryDone:{ backgroundColor:'#0f1e1b', borderColor:'#46FFC8' },
  bullet:{ width:26, alignItems:'center', marginRight:8 },
  title:{ color:'#fff', fontSize:16, marginBottom:2 },
  meta:{ color:'#c9cbe0' },
  check:{ color:'#FFD166', fontSize:18, paddingLeft:8 },

  footer:{ position:'absolute', left:16, right:16, bottom:16 },
});
