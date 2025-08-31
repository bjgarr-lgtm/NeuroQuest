
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, neon } from '../theme';

export default function NeonCard({ children, style }){
  return <View style={[styles.card, style]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { ...neon.card }
});
