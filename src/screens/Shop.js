import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';

const GOODS = [
  { id:'skin-nightcloak', name:'Night Cloak', cost:40 },
  { id:'frame-arcane',    name:'Arcane Frame', cost:25 },
  { id:'sticker-star',    name:'Prismatic Star', cost:15 },
];

export default function Shop() {
  const { state, actions } = useGame();
  const coins = state.coins;
  const owned = new Set(state.cosmetics.owned);
  const buy = (g) => { if (!owned.has(g.id) && coins >= g.cost) actions.purchase(g); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title={`Shop • Coins: ${coins}`}>
          {GOODS.map(g => {
            const isOwned = owned.has(g.id);
            return (
              <View key={g.id} style={s.row}>
                <Text style={s.name}>{g.name}</Text>
                <Pressable onPress={()=>buy(g)} disabled={isOwned || coins < g.cost} style={[s.buy, (isOwned || coins < g.cost) && { opacity:0.5 }]}>
                  <Text style={s.buyTxt}>{isOwned ? 'Owned' : `Buy ${g.cost}g`}</Text>
                </Pressable>
              </View>
            );
          })}
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#2d2450' },
  name:{ color:'#fff', fontWeight:'800' },
  buy:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', borderRadius:10, paddingVertical:8, paddingHorizontal:12 },
  buyTxt:{ color:'#46FFC8', fontWeight:'800' },
});
