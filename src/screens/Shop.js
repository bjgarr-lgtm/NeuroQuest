// src/screens/Shop.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const ConfettiBurst = FX.ConfettiBurst || (()=>null);
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const ITEMS = [
  { id:'hoodie', name:'Neon Hoodie', price:80, icon:'🧥' },
  { id:'cloak',  name:'Star Cloak',  price:60, icon:'🧥' },
  { id:'ears',   name:'Fox Ears',    price:30, icon:'🪄' },
  { id:'cape',   name:'Aurora Cape', price:100,icon:'🧥' },
];

export default function Shop() {
  const [burstKey, setBurstKey] = useState(0);
  let coins = 0, owned = new Set();
  try {
    const { useGame } = require('../game/store');
    const s = useGame.getState?.().state;
    coins = s?.coins ?? 0;
    owned = new Set(s?.skins ?? []);
  } catch {}

  const buy = (item) => {
    if (owned.has(item.id) || coins < item.price) { playSFX('cheer'); return; }
    try {
      const { useGame } = require('../game/store');
      const a = useGame.getState?.().actions;
      a?.buySkin?.(item.id, item.price);
    } catch {}
    setBurstKey(k=>k+1); playSFX('coin'); haptic('medium');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:32 }}>
        <Panel title="Shop • Cosmetics Only">
          <View style={FX.fxStyles?.portal || { position:'absolute', inset:0 }}><ConfettiBurst burstKey={burstKey} /></View>
          <View style={styles.row}>
            {ITEMS.map(it => (
              <Pressable key={it.id} onPress={()=>buy(it)} style={[styles.card, owned.has(it.id) && styles.owned]}>
                <Text style={styles.icon}>{it.icon}</Text>
                <Text style={styles.name}>{it.name}</Text>
                <Text style={styles.price}>{owned.has(it.id) ? 'Owned' : `🪙 ${it.price}`}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.note}>Coins from quests & timers. No pay-to-win.</Text>
        </Panel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  row:{ flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:6 },
  card:{ flexBasis:'48%', backgroundColor:'#18122c', borderRadius:16, borderWidth:2, borderColor:'#2d2450', alignItems:'center', paddingVertical:14 },
  owned:{ borderColor:'#46FFC8', backgroundColor:'#10231e' },
  icon:{ fontSize:34, marginBottom:6 },
  name:{ color:'#fff', fontWeight:'900' },
  price:{ color:'#c9cbe0', marginTop:4 },
  note:{ color:'#c9cbe0', marginTop:10 },
});
