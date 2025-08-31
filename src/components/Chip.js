
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { neon, colors } from '../theme';

export default function Chip({ children }){
  return <View style={styles.chip}><Text style={{color:colors.ink, fontSize:12}}>{children}</Text></View>;
}
const styles = StyleSheet.create({
  chip: { ...neon.chip }
});
