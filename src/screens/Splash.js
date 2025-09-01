import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Pressable } from 'react-native';

export default function Splash({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.95)).current;

  const go = () => navigation.replace('Welcome');

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(scale,   { toValue: 1, duration: 900, useNativeDriver: false }),
      ]),
      Animated.delay(3200),                    // 👈 linger here
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: false }),
    ]).start(go);
  }, []);

  return (
    <Pressable onPress={go} style={styles.screen}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/splash.png')}
          resizeMode="contain"
          style={styles.img}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17', alignItems: 'center', justifyContent: 'center', padding: 24 },
  img:    { width: '100%', height: 520, maxWidth: 1100 },
});
