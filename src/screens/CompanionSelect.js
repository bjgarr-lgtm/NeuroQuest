
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, neon } from '../theme';
import Button from '../components/Button';
import { loadState, getState, setState } from '../state/store';

const OPTIONS = [
  {key:'Bird', src: require('../../assets/comp-bird.png')},
  {key:'Star', src: require('../../assets/comp-star.png')},
  {key:'Fox', src: require('../../assets/comp-fox.png')},
];

export default function CompanionSelect({ navigation }){
  const [sel, setSel] = useState(null);
  useEffect(()=>{ loadState().then(()=>setSel(getState().companion)); },[]);
  return (
    <ScrollView style={{flex:1, backgroundColor:colors.bg}} contentContainerStyle={{padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:12}}>Choose a companion</Text>
        <View style={styles.grid}>
          {OPTIONS.map(o=>(
            <TouchableOpacity key={o.key} style={[styles.card, sel===o.key && styles.selected]}
              onPress={()=>{ setSel(o.key); setState({companion:o.key}); }}>
              <Image source={o.src} style={{width:'100%', height:160, resizeMode:'contain'}} />
              <Text style={styles.name}>{o.key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection:'row', gap:10, marginTop:12}}>
          <Button title="← Back" onPress={()=>navigation.goBack()} />
          <Button title="Start Day →" variant="primary" onPress={()=>navigation.navigate('StartDay')} />
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:{ width:'48%', borderWidth:2, borderColor:'#2d2450', borderRadius:10, padding:10, backgroundColor:colors.card },
  selected:{ borderColor: colors.teal },
  name:{ color:colors.ink, textAlign:'center', marginTop:6 }
});
