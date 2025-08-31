
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, neon } from '../theme';

export default function Button({ title, onPress, variant='default', size='md', style }){
  const base = [styles.btn];
  if (variant==='primary') base.push(styles.primary);
  if (size==='sm') base.push({paddingVertical:8, paddingHorizontal:10, borderRadius:10});
  if (size==='xl') base.push({paddingVertical:14, paddingHorizontal:16});
  return (
    <TouchableOpacity onPress={onPress} style={[...base, style]} activeOpacity={0.85}>
      <Text style={[styles.text, variant==='primary' && styles.textDark]}>{title}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { ...neon.btn },
  primary: { backgroundColor: 'transparent', borderWidth:0, 
    // gradient feel via text color can be replaced later by Expo LinearGradient
    shadowColor: colors.vio, shadowOpacity: 0.5, shadowRadius: 8, elevation: 3, backgroundColor: '#ffffff' },
  text: { color: colors.ink, fontSize: 14, textAlign: 'center' },
  textDark: { color: '#0e0b1c', fontWeight: '700' }
});
