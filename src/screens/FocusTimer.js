// src/screens/FocusTimer.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const DURS = [5,10,20];

export default function FocusTimer({ navigation, route }) {
  const [mins, setMins] = useState(route?.params?.mins ?? 10);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(mins*60);
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => { setLeft(mins*60); ring.setValue(0); }, [mins]);

  useEffect(() => {
    if (!running) return;
    playSFX('select'); haptic('light');
    const t0 = Date.now(); const startLeft = left;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now()-t0)/1000);
      const remain = Math.max(0, startLeft - elapsed);
      setLeft(remain);
      ring.setValue(1 - remain/(mins*60));
      if (remain <= 0) { clearInterval(id); onDone(true); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const onDone = (completed) => {
    setRunning(false);
    const rewardXP    = completed ? mins : Math.ceil(mins/2);
    const rewardCoins = completed ? Math.ceil(mins/2) : Math.ceil(mins/4);
    playSFX(completed ? 'levelup' : 'cheer'); haptic(completed ? 'success' : 'light');

    // Update store if available
    try {
      const { useGame } = require('../game/store');
      const st = useGame.getState ? useGame.getState() : null;
      const a  = st?.actions;
      a?.addFocus?.(mins);
      a?.reward?.({ xp:rewardXP, coins:rewardCoins, mood: completed? 3 : 1 });
    } catch {}

    navigation.navigate('QuestBoard');
  };

  const stopEarly = () => onDone(false);

  const mm = String(Math.floor(left/60)).padStart(2,'0');
  const ss = String(left%60).padStart(2,'0');
  const width = ring.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });

  return (
    <View style={styles.screen}>
      <Panel title="Focus Timer" style={{ margin:16 }}>
        <View style={styles.dursRow}>
          {DURS.map(d => (
            <Pressable key={d} onPress={()=>!running && setMins(d)} style={[styles.dur, mins===d && styles.durOn]}>
              <Text style={[styles.durTxt, mins===d && styles.durTxtOn]}>{d}m</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ringBox}>
          <View style={styles.ringTrack}>
            <Animated.View style={[styles.ringFill, { width }]} />
          </View>
          <Text style={styles.clock}>{mm}:{ss}</Text>
        </View>

        {!running ? (
          <ShinyButton onPress={()=>setRunning(true)} style={{ marginTop:10 }}>Start</ShinyButton>
        ) : (
          <ShinyButton onPress={stopEarly} style={{ marginTop:10, backgroundColor:'#ffdede' }} textStyle={{ color:'#4a0a0a' }}>
            Stop Early (½ reward)
          </ShinyButton>
        )}
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  dursRow:{ flexDirection:'row', gap:10, marginBottom:10 },
  dur:{ paddingVertical:8, paddingHorizontal:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b' },
  durOn:{ backgroundColor:'#10231e', borderColor:'#46FFC8' },
  durTxt:{ color:'#c9cbe0', fontWeight:'800' },
  durTxtOn:{ color:'#46FFC8' },

  ringBox:{ alignItems:'center', marginTop:10 },
  ringTrack:{ width:'100%', height:16, backgroundColor:'#0f0b1f', borderRadius:999, borderWidth:2, borderColor:'#2d2450', overflow:'hidden' },
  ringFill:{ height:'100%', backgroundColor:'#80FFEA' },
  clock:{ color:'#fff', fontSize:36, fontWeight:'900', marginTop:10, letterSpacing:1 },
});
