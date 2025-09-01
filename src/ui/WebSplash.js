import React, { useEffect, useRef, useState } from 'react';
import { Platform, Animated, StyleSheet, Image, View } from 'react-native';

export default function WebSplash() {
  const [visible, setVisible] = useState(Platform.OS === 'web');
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const timer = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: false }).start(() => setVisible(false));
    }, 800); // show briefly; doesn’t block app
    return () => clearTimeout(timer);
  }, [fade]);

  if (!visible) return null;
  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/splash.png')}
          style={{ width: 320, height: 320 }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed', zIndex: 9999, inset: 0,
    backgroundColor: '#0d0a17', alignItems: 'center', justifyContent: 'center'
  },
  card: {
    borderRadius: 16, borderWidth: 2, borderColor: '#2d2450',
    padding: 12, backgroundColor: '#131024'
  }
});
