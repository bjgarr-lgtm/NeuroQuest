// src/ui/Skin.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';

export const colors = {
  bg: '#0d0a17',
  panel: '#131024',
  border: '#2d2450',
  neon: '#B887FF',
  gold: '#FFD166',
  mint: '#46FFC8',
  cyan: '#80FFEA',
  ink: '#0e0b1d',
  paper: '#1a1728', // faux parchment base (dark journal)
};

export function Panel({ title, children, style }) {
  return (
    <View style={[styles.panel, style]}>
      {title ? <Text style={styles.panelTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function ShinyButton({ children, onPress, style, textStyle }) {
  // simple shine sweep; no external deps
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const run = () => {
      x.setValue(-1);
      Animated.timing(x, { toValue: 1, duration: 1800, useNativeDriver: false }).start(() => {
        setTimeout(run, 1200);
      });
    };
    run();
  }, [x]);
  const left = x.interpolate({ inputRange: [-1,1], outputRange: ['-40%','140%'] });

  return (
    <Pressable onPress={onPress} style={[styles.btn, style]}>
      <Animated.View pointerEvents="none" style={[styles.shine, { left }]} />
      <Text style={[styles.btnText, textStyle]}>{children}</Text>
    </Pressable>
  );
}

export function Sparkles({ burstKey = 0, style }) {
  // Renders a few emoji sparkles that float up & fade; re-runs when key changes
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 620, useNativeDriver: false }).start();
  }, [burstKey]);
  const up = a.interpolate({ inputRange:[0,1], outputRange:[0,-20] });
  const op = a.interpolate({ inputRange:[0,1], outputRange:[0.9,0] });

  return (
    <Animated.View style={[{ position:'absolute', inset:0, opacity: op, transform:[{ translateY: up }] }, style]} pointerEvents="none">
      <Text style={styles.spark}>&nbsp;✨&nbsp;</Text>
      <Text style={[styles.spark,{ alignSelf:'flex-end'}]}>✦</Text>
      <Text style={[styles.spark,{ alignSelf:'center'}]}>⭐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel:{
    backgroundColor: colors.panel,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: 16, padding: 12,
  },
  panelTitle:{ color:'#fff', fontSize:16, fontWeight:'800', marginBottom:8 },

  btn:{
    backgroundColor:'#fff',
    borderRadius: 14, paddingVertical: 14, alignItems:'center', overflow:'hidden',
  },
  btnText:{ color: colors.bg, fontWeight:'800' },
  shine:{
    position:'absolute', top:0, bottom:0, width:'28%',
    backgroundColor:'#ffffff33', transform:[{skewX:'-16deg'}],
  },

  spark:{ color: colors.cyan, fontSize:14 },
});
