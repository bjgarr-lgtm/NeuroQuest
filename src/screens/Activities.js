import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, ShinyButton, colors } from '../ui/Skin';
import { useGame } from '../game/store';
import { toast } from '../ui/Toasts';

export default function Activities({ navigation }) {
  const { state, actions } = useGame();
  const list = state.daily || [];

  const complete = (q) => { actions.completeQuest(q); toast(`+${q.reward.xp}xp +${q.reward.coins}g`); };

  const goEnd = () => navigation.navigate('EndDay');

  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Daily Quests">
          {list.map(q => {
            const done = state.today.done.includes(q.id);
            return (
              <Pressable key={q.id} onPress={()=>!done && complete(q)} style={[s.row, done && s.rowDone]}>
                <Text style={s.title}>{q.title}</Text>
                <Text style={s.rew}>+{q.reward.xp}xp · +{q.reward.coins}g</Text>
                <Text style={[s.tag, done && { color:'#46FFC8' }]}>{done ? 'DONE' : 'TAP'}</Text>
              </Pressable>
            );
          })}
          <ShinyButton style={{ marginTop:12 }} onPress={goEnd}>Finish Day →</ShinyButton>
        </Panel>
      </ScrollView>
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
});
