
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, neon } from '../theme';
import NeonCard from '../components/NeonCard'; import Button from '../components/Button'; import TaskRow from '../components/TaskRow';
import { loadState, getState, addQuest, toggleQuest, addTx } from '../state/store';

export default function StartDay({ navigation }){
  const [S, setS] = useState(null);
  const refresh = async()=>{ await loadState(); setS({...getState()}); }
  useEffect(()=>{ refresh(); },[]);

  if (!S) return null;
  const lists = [
    ['main','Main Quest','red'],
    ['side','Side Quests','yellow'],
    ['bonus','Bonus Loot','green']
  ];

  return (
    <ScrollView style={{flex:1, backgroundColor:colors.bg}} contentContainerStyle={{padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:8}}>Daily Quests</Text>
        {lists.map(([key,label])=>(
          <NeonCard key={key} style={{marginBottom:10}}>
            <Text style={{color:colors.ink, marginBottom:6}}>{label}</Text>
            {S.quests[key].map((t,i)=>(
              <TaskRow key={i} task={t} onToggle={(v)=>{ toggleQuest(key, i, v).then(refresh); }} onChange={(txt)=>{ t.txt=txt; toggleQuest(key,i,t.done).then(refresh); }} />
            ))}
            <Button title={`+ add ${key}`} size="sm" onPress={()=>addQuest(key,'New task').then(refresh)} />
          </NeonCard>
        ))}

        <NeonCard style={{marginBottom:10}}>
          <Text style={{color:colors.ink, marginBottom:6}}>Budget Tracker</Text>
          <View style={{flexDirection:'row', gap:8}}>
            <Button title="+ income" size="sm" onPress={()=>addTx('Income', 50).then(refresh)} />
            <Button title="+ expense" size="sm" onPress={()=>addTx('Expense', -12).then(refresh)} />
          </View>
        </NeonCard>

        <View style={{alignItems:'center', marginTop:10}}>
          <Button title="Begin Activities" variant="primary" onPress={()=>navigation.navigate('Activities')} />
        </View>
      </View>
    </ScrollView>
  );
}
