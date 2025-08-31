
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { colors, neon } from '../theme';
import Button from '../components/Button';
import { getState, loadState, computeTrends } from '../state/store';

export default function EndDay({ navigation }){
  const [S, setS] = useState(null);
  useEffect(()=>{ loadState().then(()=>setS(getState())); },[]);

  if (!S) return null;
  const d = Object.keys(S.logs).sort().slice(-1)[0];
  const L = d ? S.logs[d] : null;
  const done = L?.done?.length || 0;
  const minutes = L?.minutes || 0;
  const stuck = L?.stuck || 0;
  const t = computeTrends();

  return (
    <View style={{flex:1, backgroundColor:colors.bg, padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:8}}>Daily Summary</Text>
        <View style={{gap:6}}>
          <Text style={{color:colors.ink}}>Tasks done: {done}</Text>
          <Text style={{color:colors.ink}}>Focus minutes: {minutes}</Text>
          <Text style={{color:colors.ink}}>Got stuck: {stuck}</Text>
        </View>
        <Text style={{color:colors.muted, marginVertical:10}}>Tips</Text>
        <View style={{gap:6}}>
          <Text style={{color:colors.ink}}>Best time: {t.timeName}</Text>
          <Text style={{color:colors.ink}}>Top category: {t.topCat}</Text>
          <Text style={{color:colors.ink}}>Daily completion: {t.rate}%</Text>
        </View>
        <View style={{flexDirection:'row', gap:8, marginTop:12}}>
          <Button title="New Day →" variant="primary" onPress={()=>navigation.navigate('StartDay')} />
          <Button title="Trends" onPress={()=>navigation.navigate('Trends')} />
        </View>
      </View>
    </View>
  );
}
