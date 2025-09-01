// src/screens/EndDay.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin'; // named exports
import { useGame } from '../game/store';
import * as FX from '../ui/FX';
const playSFX = FX.playSFX || (()=>{}); const haptic = FX.haptic || (()=>{});

const GOODS = [
  { id:'skin-neon-hoodie', name:'Neon Hoodie', cost:80 },
  { id:'skin-star-cloak',  name:'Star Cloak',  cost:60 },
  { id:'trinket-fox-ears', name:'Fox Ears',    cost:30 },
  { id:'skin-aurora-cape', name:'Aurora Cape', cost:100 },
];

export default function EndDay({ navigation }) {
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
      {/* Top navigation so this page isn’t a trap */}
      <TopNav />

      <ScrollView contentContainerStyle={{ paddingHorizontal:16, paddingBottom:24 }}>
        <Panel title="Day Summary">
          <Text style={styles.txt}>+{state?.today?.xpGain ?? 0} XP  •  +{state?.today?.coinGain ?? 0}g  •  Streak {state?.streak ?? 0}</Text>
        </Panel>

        <Panel title={`Shop • Cosmetics Only (Coins: ${coins})`} style={{ marginTop:12 }}>
          {GOODS.map((g) => {
            const isOwned = owned.has(g.id);
            return (
              <View key={g.id} style={styles.row}>
                <Text style={styles.name}>{g.name}</Text>
                <Pressable
                  disabled={isOwned}
                  onPress={()=>buy(g)}
                  style={[styles.buy, isOwned && { opacity:0.5 }]}
                >
                  <Text style={styles.buyTxt}>{isOwned ? 'Owned' : `Buy ${g.cost}g`}</Text>
                </Pressable>
              </View>
            );
          })}
          <Text style={[styles.txt,{ marginTop:12 }]}>Coins are earned from quests & timers. No pay-to-win.</Text>
        </Panel>

        <View style={{ flexDirection:'row', marginTop:16 }}>
          <Pressable style={[styles.navBtn,{ marginRight:8 }]} onPress={()=>navigation.navigate('Dashboard')}>
            <Text style={styles.navBtnTxt}>Back to Home</Text>
          </Pressable>
          <Pressable style={[styles.navBtn,{ marginLeft:8 }]} onPress={()=>actions?.startDay?.()}>
            <Text style={styles.navBtnTxt}>Roll Tomorrow</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  txt:{ color:'#c9cbe0' },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderColor:'#2d2450' },
  name:{ color:'#fff', fontWeight:'800' },
  buy:{ backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450', borderRadius:10, paddingVertical:8, paddingHorizontal:12 },
  buyTxt:{ color:'#46FFC8', fontWeight:'800' },
  navBtn:{ flex:1, alignItems:'center', paddingVertical:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b' },
  navBtnTxt:{ color:'#fff', fontWeight:'800' },
});
