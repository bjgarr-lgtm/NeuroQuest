import React from 'react';
import { Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, Platform } from 'react-native';

export default function Welcome({ navigation }) {
  const start = () => navigation.navigate('Character');
  const win = Dimensions.get('window');
  const heroHeight = Platform.OS === 'web'
    ? Math.min(Math.max(520, Math.round(win.height * 0.62)), 820)
    : 420;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>NEUROQUEST</Text>
      <Text style={styles.tag}>Questing for focus, powered by snacks & spite.</Text>

      <Image
        source={require('../../assets/welcome-rules.png')}
        style={[styles.heroImg, { height: heroHeight }]}
        resizeMode="contain"
      />

      <Pressable style={styles.btn} onPress={start}>
        <Text style={styles.btnText}>Start</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17' },
  title:  { color: '#fff', fontSize: 28, fontWeight: '800' },
  tag:    { color: '#c9cbe0', marginTop: 4, marginBottom: 14 },
  heroImg:{ width: '100%' },
  btn:    { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText:{ color: '#0d0a17', fontWeight: '800' },
});
