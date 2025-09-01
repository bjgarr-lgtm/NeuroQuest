import { Animated, Easing } from 'react-native';

export function pulseStyle() {
  const v = new Animated.Value(0);
  Animated.loop(Animated.timing(v, { toValue:1, duration:900, easing:Easing.inOut(Easing.quad), useNativeDriver:false })).start();
  const scale = v.interpolate({ inputRange:[0,1], outputRange:[1,1.04] });
  return { transform:[{ scale }] };
}

export function floatStyle(range=8, dur=1400) {
  const v = new Animated.Value(0);
  Animated.loop(Animated.sequence([
    Animated.timing(v, { toValue:1, duration:dur, useNativeDriver:false }),
    Animated.timing(v, { toValue:0, duration:dur, useNativeDriver:false }),
  ])).start();
  return { transform:[{ translateY: v.interpolate({ inputRange:[0,1], outputRange:[0,-range] }) }] };
}

export const playSFX = () => {}; // no-op on web (you can wire expo-av later)
export const haptic = () => {};  // no-op on web
