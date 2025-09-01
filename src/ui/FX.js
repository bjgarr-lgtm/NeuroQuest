import React from 'react';
import { Animated, Easing } from 'react-native';

export function usePulse(dur=900, amt=0.04) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue:1, duration:dur, easing:Easing.inOut(Easing.quad), useNativeDriver:false })
    );
    loop.start(); return () => loop.stop();
  }, [v, dur]);
  const scale = v.interpolate({ inputRange:[0,1], outputRange:[1, 1+amt] });
  return { transform:[{ scale }] };
}

export function useFloat(range=8, dur=1400) {
  const v = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue:1, duration:dur, useNativeDriver:false }),
      Animated.timing(v, { toValue:0, duration:dur, useNativeDriver:false }),
    ]));
    loop.start(); return () => loop.stop();
  }, [v, range, dur]);
  return { transform:[{ translateY: v.interpolate({ inputRange:[0,1], outputRange:[0,-range] }) }] };
}

export function Sparkle({ show=false, x=0, y=0 }) {
  const fade = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!show) return;
    fade.setValue(0);
    Animated.sequence([
      Animated.timing(fade, { toValue:1, duration:120, useNativeDriver:false }),
      Animated.delay(220),
      Animated.timing(fade, { toValue:0, duration:180, useNativeDriver:false }),
    ]).start();
  }, [show, fade]);
  if (!show) return null;
  return (
    <Animated.Text style={{
      position:'absolute', left:x, top:y, opacity:fade, fontSize:16,
    }}>✨</Animated.Text>
  );
}
