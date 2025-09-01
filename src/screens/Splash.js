// Long, cozy splash with safe fade + optional tap to continue
import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Pressable, Text } from 'react-native';
import { colors } from '../ui/Skin'; // import colors ONCE

export default function Splash({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 1800, useNativeDriver: true }).start();
    const t1 = setTimeout(() => setCanContinue(true), 2200);
    const t2 = setTimeout(() => navigation.replace('Welcome'), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [fade, navigation]);

  const go = () => navigation.replace('Welcome');

  return (
    <View style={s.wrap}>
      <Animated.View style={{ opacity: fade }}>
        <Image
          source={require('../../assets/splash.png')}
          style={s.img}
          resizeMode="contain"
          onError={() => setCanContinue(true)}
        />
      </Animated.View>

      {canContinue && (
        <Pressable onPress={go} style={s.cta}>
          <Text style={s.ctaTxt}>Tap to continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 },
  img: { width: '100%', maxWidth: 960, height: 360 },
  cta: { marginTop: 24, backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  ctaTxt: { color: '#0d0a17', fontWeight: '800' },
});
