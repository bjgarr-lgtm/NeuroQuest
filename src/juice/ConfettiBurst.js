// Simple confetti using RN Animated — no extra deps
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const COLORS = ['#FF7E6B','#FFD166','#80FFEA','#B887FF','#75D66B'];
const GLYPHS = ['✦','✧','★','❈','✺','◆','✸'];

function Particle({ seed, onDone }) {
  const { width } = Dimensions.get('window');
  const x = useMemo(()=> new Animated.Value(width/2 - 20 + (Math.random()*120 - 60)), []);
  const y = useMemo(()=> new Animated.Value(0), []);
  const rot = useMemo(()=> new Animated.Value(0), []);
  const op = useMemo(()=> new Animated.Value(1), []);
  const scale = useMemo(()=> new Animated.Value(0.6 + Math.random()*0.8), []);
  const color = COLORS[seed % COLORS.length];
  const glyph = GLYPHS[seed % GLYPHS.length];
  const dur = 600 + Math.random()*500;
  const dx = (Math.random()*2-1) * 120;
  const dy = 220 + Math.random()*160;

  useEffect(()=>{
    Animated.parallel([
      Animated.timing(x,   { toValue: x.__getValue()+dx, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver:true }),
      Animated.timing(y,   { toValue: -dy, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver:true }),
      Animated.timing(rot, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver:true }),
      Animated.timing(op,  { toValue: 0, duration: dur, easing: Easing.inOut(Easing.quad), useNativeDriver:true }),
    ]).start(onDone);
  },[]);

  const rotate = rot.interpolate({ inputRange:[0,1], outputRange:['0deg','540deg'] });

  return (
    <Animated.View style={[styles.p, { transform:[{translateX:x}, {translateY:y}, {rotate}, {scale}], opacity: op }]}>
      <Text style={[styles.t, { color }]}>{glyph}</Text>
    </Animated.View>
  );
}

export default function ConfettiBurst({ count=24, onFinish }) {
  const done = React.useRef(0);
  const handleDone = () => { done.current += 1; if (done.current >= count && onFinish) onFinish(); };

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {Array.from({length:count}).map((_,i)=>(
        <Particle key={i} seed={i + Math.floor(Math.random()*9999)} onDone={handleDone}/>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ position:'absolute', left:0, right:0, top:0, bottom:0, alignItems:'center', justifyContent:'center' },
  p:{ position:'absolute' },
  t:{ fontSize:22, textShadowColor:'#0008', textShadowRadius:4, textShadowOffset:{width:0,height:1} },
});
