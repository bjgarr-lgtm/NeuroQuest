
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, neon } from '../theme';
import Button from '../components/Button';
import { loadState, getState, setState } from '../state/store';

const OPTIONS = [
  {key:'Bambi', src: require('../../assets/hero-bambi.png')},
  {key:'Ash', src: require('../../assets/hero-ash.png')},
  {key:'Odin', src: require('../../assets/hero-odin.png')},
  {key:'Fox', src: require('../../assets/hero-fox.png')},
];

export default function CharacterSelect({ navigation }){
  const [sel, setSel] = useState(null);
  useEffect(()=>{ loadState().then(()=>setSel(getState().character)); },[]);
  return (
    <ScrollView style={{flex:1, backgroundColor:colors.bg}} contentContainerStyle={{padding:16}}>
      <View style={neon.panel}>
        <Text style={{color:colors.ink, fontSize:18, marginBottom:12}}>Choose your character</Text>
        <View style={styles.grid}>
          {OPTIONS.map(o=>(
            <TouchableOpacity key={o.key} style={[styles.card, sel===o.key && styles.selected]}
              onPress={()=>{ setSel(o.key); setState({character:o.key}); }}>
              <Image source={o.src} style={{width:'100%', height:160, resizeMode:'contain'}} />
              <Text style={styles.name}>{o.key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection:'row', gap:10, marginTop:12}}>
          <Button title="← Back" onPress={()=>navigation.goBack()} />
          <Button title="Next →" variant="primary" onPress={()=>navigation.navigate('Companion')} />
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:{ width:'48%', borderWidth:2, borderColor:'#2d2450', borderRadius:10, padding:10, backgroundColor:colors.card },
  selected:{ borderColor: colors.vio },
  name:{ color:colors.ink, textAlign:'center', marginTop:6 }
});
