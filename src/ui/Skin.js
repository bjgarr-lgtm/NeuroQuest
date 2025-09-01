import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export const colors = {
  bg: '#0d0a17',
  panel: '#131024',
  border: '#2d2450',
  good: '#46FFC8',
  ink: '#ffffff',
  sub: '#c9cbe0',
};

export function Panel({ title, children, style }) {
  return (
    <View style={[styles.panel, style]}>
      {title ? <Text style={styles.panelH}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function ShinyButton({ children, style, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && { transform:[{ scale:0.98 }] },
        disabled && { opacity:0.5 },
        style,
      ]}
    >
      <Text style={styles.btnTxt}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel:{
    backgroundColor: colors.panel,
    borderWidth:2, borderColor: colors.border, borderRadius:16,
    padding:16, marginTop:12,
  },
  panelH:{ color: colors.ink, fontWeight:'800', marginBottom:10, fontSize:16 },
  btn:{
    backgroundColor:'#17132b',
    borderWidth:2, borderColor: colors.border,
    borderRadius:12, paddingVertical:12, paddingHorizontal:16, alignItems:'center',
  },
  btnTxt:{ color: colors.ink, fontWeight:'800' },
});
