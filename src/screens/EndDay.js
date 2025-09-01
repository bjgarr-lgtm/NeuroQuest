import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';
import { useGame } from '../game/store';

const GOODS = [
  { id:'skin-neon-hoodie', name:'Neon Hoodie', cost:80 },
  { id:'skin-star-cloak',  name:'Star Cloak',  cost:60 },
  { id:'trinket-fox-ears', name:'Fox Ears',   cost:30 },
];

export default function EndDay({ navigation }) {
  const { state, actions } = useGame();
  const coins = state.coins;
  const owned = new Set(state.cosmetics.owned);

  const buy = (g) => { if (!owned.has(g.id) && coins >= g.cost) actions.purchase(g); };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Day Summary">
          <Text style={s.txt}>+{state.today.xpGain} XP · +{state.today.coinGain}g · Streak {state.streak}</Text>
          <View style={{ height:8 }} />
          <Pressable style={s.btn} onPress={()=>{ actions.endDay(); actions.startDay(); navigation.replace('Dashboard'); }}>
            <Text style={s.btnTxt}>Roll Tomorrow →</Text>
          </Pressable>
        </Panel>

        <Panel title={`Shop • Coins: ${coins}`} style={{ marginTop:12 }}>
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
  txt:{ color:'#c9cbe0' },
  btn:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', borderRadius:12, paddingVertical:12, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'800' },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderColor:'#2d2450' },
  name:{ color:'#fff', fontWeight:'800' },
  buy:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', borderRadius:10, paddingVertical:8, paddingHorizontal:12 },
  buyTxt:{ color:'#46FFC8', fontWeight:'800' },
});
