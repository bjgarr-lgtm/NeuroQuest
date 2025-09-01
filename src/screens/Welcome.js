import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';

export default function Welcome({ navigation }) {
  const start = () => navigation.navigate('Character');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={styles.title}>NEUROQUEST</Text>
      <Text style={styles.tag}>Questing for focus, powered by snacks & spite.</Text>

      <View style={styles.heroCard}>
        {/* Use your welcome graphic */}
        <Image
          source={require('../../assets/welcome-rules.png')}
          style={styles.heroImg}
          resizeMode="contain"
        />
      </View>

      <View style={styles.rules}>
        <Text style={styles.rulesH}>How it works</Text>
        <Text style={styles.rule}>1) Pick your character & companion.</Text>
        <Text style={styles.rule}>2) Roll daily quests. Tap to complete for XP & coins.</Text>
        <Text style={styles.rule}>3) End Day to see tips & auto-roll tomorrow.</Text>
      </View>

      <Pressable style={styles.btn} onPress={start}>
        <Text style={styles.btnText}>Start</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0a17' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  tag: { color: '#c9cbe0', marginTop: 4, marginBottom: 12 },
  heroCard: {
    backgroundColor: '#131024',
    borderWidth: 2,
    borderColor: '#2d2450',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  heroImg: { width: '100%', height: 240 },
  rules: {
    backgroundColor: '#131024',
    borderWidth: 2,
    borderColor: '#2d2450',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  rulesH: { color: '#FFD166', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  rule: { color: '#e8e8ee', marginBottom: 6 },
  btn: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#0d0a17', fontWeight: '800' },
});
