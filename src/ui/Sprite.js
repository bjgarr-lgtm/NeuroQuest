import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function Sprite({ source, style, label }) {
  const [err, setErr] = useState(false);
  if (err || !source) {
    return <View style={[styles.fallback, style]}><Text style={styles.fallbackText}>{label || '??'}</Text></View>;
  }
  return <Image source={source} style={[styles.img, style]} resizeMode="contain" onError={()=>setErr(true)} />;
}
const styles = StyleSheet.create({
  img: { width:'100%' },  // height comes from caller; no implicit ratio
  fallback:{ backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', alignItems:'center', justifyContent:'center' },
  fallbackText:{ color:'#c9cbe0' },
});
