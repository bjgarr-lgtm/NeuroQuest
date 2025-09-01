import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

let pushToast = null;

export function ToastHost() {
  const [msg, setMsg] = React.useState(null);
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    pushToast = (m) => {
      setMsg(m);
      fade.setValue(0);
      Animated.sequence([
        Animated.timing(fade, { toValue:1, duration:150, useNativeDriver:false }),
        Animated.delay(900),
        Animated.timing(fade, { toValue:0, duration:200, useNativeDriver:false })
      ]).start();
    };
  }, [fade]);

  if (!msg) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.wrap, { opacity:fade }]}>
      <View style={s.box}><Text style={s.txt}>{msg}</Text></View>
    </Animated.View>
  );
}

export function toast(m) { if (pushToast) pushToast(m); }

const s = StyleSheet.create({
  wrap:{ position:'absolute', top:18, left:0, right:0, alignItems:'center', zIndex:9999 },
  box:{ backgroundColor:'#1b1632', borderWidth:2, borderColor:'#2d2450', borderRadius:12, paddingVertical:8, paddingHorizontal:12 },
  txt:{ color:'#fff', fontWeight:'800' },
});
