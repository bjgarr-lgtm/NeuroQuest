import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

export default function AnimPressable({ style, children, onPress, disabled }) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(s, { toValue:v, useNativeDriver:true, friction:5, tension:200 }).start();
  return (
    <Animated.View style={[{ transform:[{ scale:s }] }, style]}>
      <Pressable
        onPressIn={()=>to(0.96)}
        onPressOut={()=>to(1)}
        onPress={onPress}
        disabled={disabled}
        style={({pressed})=> [{ opacity: disabled ? 0.5 : (pressed ? 0.9 : 1) }]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
