import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { toast } from '../ui/Toasts';
import { Sparkle } from '../ui/FX';

export default function Activities({ navigation }) {
  const { state, actions } = useGame();
  const list = state.daily || [];
  const [burst, setBurst] = React.useState(null);

  const complete = (q, i) => {
    actions.completeQuest(q);
    toast(`+${q.reward.xp}xp +${q.reward.coins}g`);
    setBurst(i);
    setTimeout(()=>setBurst(null), 500);
  };

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:96 }}>
        <Panel title="Daily Quests">
          {list.map((q, i) => {
            const done = state.today.done.includes(q.id);
            return (
              <View key={q.id} style={{ position:'relative' }}>
                <Pressable onPress={()=>!done && complete(q,i)} style={[s.row, done && s.rowDone]}>
                  <Text style={s.title}>{q.title}</Text>
                  <Text style={s.rew}>+{q.reward.xp}xp · +{q.reward.coins}g</Text>
                  <Text style={[s.tag, done && { color:'#46FFC8' }]}>{done ? 'DONE' : 'TAP'}</Text>
                </Pressable>
                <Sparkle show={burst===i} x={12} y={-6} />
              </View>
            );
          })}
        </Panel>
      </ScrollView>

      <View style={s.footer}>
        <ShinyButton onPress={()=>navigation.navigate('EndDay')}>Finish Day →</ShinyButton>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  row:{ padding:12, borderRadius:12, borderWidth:2, borderColor:'#2d2450', backgroundColor:'#17132b', marginBottom:10 },
  rowDone:{ backgroundColor:'#10231e', borderColor:'#1f6f59' },
  title:{ color:'#fff', fontWeight:'800' },
  rew:{ color:'#c9cbe0', marginTop:4 },
  tag:{ position:'absolute', right:12, top:12, color:'#FFD166', fontWeight:'800' },
  footer:{ position:'fixed', left:0, right:0, bottom:0, padding:16, backgroundColor:'rgba(13,10,23,0.9)', borderTopWidth:2, borderColor:'#2d2450' },
});
