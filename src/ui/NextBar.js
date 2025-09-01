import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function NextBar({ onBack, onNext, nextLabel='Continue →', disabled }) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.ghost} onPress={onBack}>
        <Text style={styles.ghostText}>← Back</Text>
      </Pressable>
      <Pressable style={[styles.btn, disabled && {opacity:0.5}]} onPress={onNext} disabled={disabled}>
        <Text style={styles.btnText}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap:{ position:'fixed', left:0, right:0, bottom:0,    // works on web; native treats as absolute
         backgroundColor:'#0d0a17E6', borderTopWidth:2, borderTopColor:'#2d2450',
         padding:12, gap:10, flexDirection:'row', justifyContent:'space-between', zIndex:10 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  ghost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
