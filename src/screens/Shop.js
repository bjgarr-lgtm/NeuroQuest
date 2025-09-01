// src/screens/Shop.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import TopNav from '../ui/TopNav';
import { useGame } from '../game/store';
import { Panel, colors } from '../ui/Skin';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const GOODS = [
  { id:'skin-nightcloak', name:'Night Cloak', cost:40 },
  { id:'frame-arcane',    name:'Arcane Frame', cost:25 },
  { id:'sticker-star',    name:'Prismatic Star', cost:15 },
];

export default function Shop() {
  const { state, actions } = useGame();
  const coins = state?.coins ?? 0;
  const owned = new Set(state?.cosmetics?.owned || []);
  const buy = (g) => {
    const ok = actions?.purchase?.(g);
    if (ok) { playSFX('coin'); haptic('medium'); }
    else    { playSFX('deny'); haptic('error'); }
  };

  return (
    <View style={styles.screen}>
      <TopNav active="Shop" />
      <ScrollView contentContainerStyle={{ paddingHorizontal:16, paddingBottom:24 }}>
        <Panel title={`Shop • Coins: ${coins}`}>
          {GOODS.map(g => {
            const isOwned = owned.has(g.id);
            return (
              <View key={g.id} style={styles.row}>
                <Text style={styles.name}>{g.name}</Text>
                <Pressable style={[styles.buy, isOwned && { opacity:0.5 }]} onPress={()=>buy(g)} disabled={isOwned}>
                  <Text style={styles.buyTxt}>{isOwned ? 'Owned' : `Buy ${g.cost}g`}</Text>
                </Pressable>
              </View>
            );
          })}
        </Panel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#2d2450' },
  name:{ color:'#fff', fontWeight:'800' },
  buy:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', borderRadius:10, paddingVertical:8, paddingHorizontal:12 },
  buyTxt:{ color:'#46FFC8', fontWeight:'800' },
});
