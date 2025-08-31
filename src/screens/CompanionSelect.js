// src/screens/CompanionSelect.js — guaranteed "Start Day" navigation
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Btn } from '../components/UI';

const P = 'https://dummyimage.com/300x200/1b1731/ffd166.png&text='; // placeholder art

const COMPANIONS = [
  { key: 'bird', label: 'Bird', uri: P + 'Bird' },
  { key: 'star', label: 'Star', uri: P + 'Star' },
  { key: 'fox', label: 'Fox', uri: P + 'Fox' },
];

export default function CompanionSelect({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>Companion</Text>
      <View style={styles.grid}>
        {COMPANIONS.map(c => (
          <TouchableOpacity
            key={c.key}
            onPress={() => setSelected(c.key)}
            style={[styles.card, selected === c.key && styles.sel]}
          >
            <Image source={{ uri: c.uri }} style={styles.img} />
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.row}>
        <Btn onPress={() => navigation.goBack()}>← Back</Btn>
        <Btn onPress={() => navigation.navigate('Start')}>Start Day →</Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: '#0d0a17' },
  h2: { color: '#fff', fontSize: 18, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexGrow: 1,
    minWidth: 220,
    backgroundColor: '#1b1731',
    borderWidth: 2,
    borderColor: '#2d2450',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  sel: { borderColor: '#B887FF' },
  img: { width: 180, height: 140, borderRadius: 10, borderWidth: 2, borderColor: '#2d2450' },
  label: { color: '#fff', marginTop: 6 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
