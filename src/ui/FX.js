// src/ui/FX.js
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform } from 'react-native';

/* -------------------- Confetti -------------------- */
export function ConfettiBurst({ burstKey = 0, count = 18, size = 18, spread = 90, duration = 900 }) {
  const parts = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      k: i,
      emo: ['✨','⭐','🪙','💥','🎉','🍬'][i % 6],
      dx: (Math.random() - 0.5) * spread,
      dy: -Math.random() * spread - 30,
      rot: (Math.random() - 0.5) * 90,
      delay: Math.round(Math.random() * 80),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );
  const anims = useRef(parts.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((a, idx) => {
      a.setValue(0);
      Animated.timing(a, { toValue: 1, duration, delay: parts[idx].delay, useNativeDriver: false }).start();
    });
  }, [burstKey]);

  return parts.map((p, i) => {
    const a = anims[i];
    const x = a.interpolate({ inputRange:[0,1], outputRange:[0, p.dx] });
    const y = a.interpolate({ inputRange:[0,1], outputRange:[0, p.dy] });
    const op = a.interpolate({ inputRange:[0,1], outputRange:[1, 0] });
    const sc = a.interpolate({ inputRange:[0,1], outputRange:[1, 0.8] });
    return (
      <Animated.Text
        key={p.k}
        style={{
          position:'absolute',
          left:'50%', top:'50%',
          transform:[{ translateX: x },{ translateY: y },{ rotate: `${p.rot}deg` },{ scale: sc }],
          opacity: op, fontSize: size, pointerEvents:'none',
        }}
      >
        {p.emo}
      </Animated.Text>
    );
  });
}

export const fxStyles = { portal: { position:'absolute', inset:0, pointerEvents:'none' } };

/* -------------------- Sounds (WAV) -------------------- */
const WAV = {
  select:  () => require('../../assets/sfx/select.wav'),
  coin:    () => require('../../assets/sfx/coin.wav'),
  cheer:   () => require('../../assets/sfx/cheer.wav'),
  levelup: () => require('../../assets/sfx/levelup.wav'),
};

export async function playSFX(name) {
  const get = WAV[name];
  if (!get) return;
  try {
    const mod = get();
    if (Platform.OS === 'web') {
      const url = typeof mod === 'string' ? mod : (mod?.default ?? mod?.uri ?? '');
      if (!url) return;
      const a = new Audio(url);
      a.volume = 0.9;
      a.play().catch(()=>{});
    } else {
      let AV; try { AV = require('expo-av'); } catch {}
      if (AV?.Audio) {
        const { Sound } = AV.Audio;
        const snd = new Sound();
        await snd.loadAsync(mod);
        await snd.playAsync();
        snd.unloadAsync();
      }
    }
  } catch {}
}

/* -------------------- Haptics (optional) -------------------- */
export function haptic(kind='selection') {
  try {
    const H = require('expo-haptics');
    const map = {
      selection: H.selectionAsync,
      success:   () => H.notificationAsync(H.NotificationFeedbackType.Success),
      light:     () => H.impactAsync(H.ImpactFeedbackStyle.Light),
      medium:    () => H.impactAsync(H.ImpactFeedbackStyle.Medium),
      heavy:     () => H.impactAsync(H.ImpactFeedbackStyle.Heavy),
    };
    (map[kind] || map.selection)();
  } catch {}
}

/* -------------------- Pulse border helper -------------------- */
export function usePulse(duration = 800) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration, useNativeDriver:false }),
        Animated.timing(a, { toValue: 0, duration, useNativeDriver:false }),
      ])
    );
    loop.start(); return () => loop.stop();
  }, []);
  const borderColor = a.interpolate({
    inputRange:[0,1],
    outputRange:['#ffffff22', '#ffffff66'],
  });
  return { borderColor };
}
