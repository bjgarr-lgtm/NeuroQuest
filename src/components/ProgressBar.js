
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function ProgressBar({ value=0 }){
  return (
    <View style={styles.wrap}>
      <View style={[styles.fill, { width: `${Math.max(2, Math.min(100, value))}%` }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap:{ height:10, borderWidth:2, borderColor:'#2d2450', borderRadius:8, overflow:'hidden', width:140 },
  fill:{ height:'100%', backgroundColor: colors.vio }
});
