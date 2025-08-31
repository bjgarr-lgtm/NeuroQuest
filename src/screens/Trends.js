
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { colors, neon } from '../theme';
import Button from '../components/Button';
import { computeTrends } from '../state/store';

export default function Trends({ navigation }){
  const [t, setT] = useState(null);
  useEffect(()=>{ setT(computeTrends(30)); },[]);

  if (!t) return null;
  return (
    <View style={{flex:1, backgroundColor:colors.bg, padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:8}}>Trends & Tips (30d)</Text>
        <View style={{gap:6}}>
          <Text style={{color:colors.ink}}>Tasks: {t.done}</Text>
          <Text style={{color:colors.ink}}>Focus minutes: {t.minutes}</Text>
          <Text style={{color:colors.ink}}>Stuck events: {t.stuck}</Text>
          <Text style={{color:colors.ink}}>Best time: {t.timeName}</Text>
          <Text style={{color:colors.ink}}>Top category: {t.topCat}</Text>
          <Text style={{color:colors.ink}}>Daily completion: {t.rate}%</Text>
        </View>
        <View style={{marginTop:12}}>
          <Button title="Close" onPress={()=>navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}
