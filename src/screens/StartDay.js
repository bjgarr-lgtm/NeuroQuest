// src/screens/StartDay.js — minimal, guaranteed to navigate
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Btn } from '../components/UI';

export default function StartDay({ navigation }) {
  const goActivities = () => {
    console.log('[StartDay] Begin → Activities');
    navigation.navigate('Activities'); // route name must match your navigator
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Start Day</Text>

      <View style={styles.panel}>
        <Text style={styles.section}>Daily Quests</Text>
        <Text style={styles.item}>• Main Quest (add your own)</Text>
        <Text style={styles.item}>• Side Quest</Text>
        <Text style={styles.item}>• Bonus Loot</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.section}>Cleaning Dungeon</Text>
        <Text style={styles.item}>• Small quests: Dishes, Trash, Quick tidy</Text>
      </View>

      <View style={styles.row}>
        <Btn onPress={() => navigation.goBack()}>← Back</Btn>
        <Btn onPress={goActivities}>Begin →</Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0d0a17' },
  h1: { color: '#fff', fontSize: 20, marginBottom: 12 },
  panel: {
    backgroundColor: '#1b1731',
    borderWidth: 2,
    borderColor: '#2d2450',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  section: { color: '#ffd166', marginBottom: 6 },
  item: { color: '#c9cbe0', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
