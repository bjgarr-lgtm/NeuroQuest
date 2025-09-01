import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import Sprite from '../ui/Sprite';
import { heroArt } from '../art';

export const HEROES = [
  { key:'bambi', label:'Bambi', img: heroArt.bambi },
  { key:'ash',   label:'Ash',   img: heroArt.ash },
  { key:'odin',  label:'Odin',  img: heroArt.odin },
  { key:'fox',   label:'Fox',   img: heroArt.fox },
];

export default function CharacterSelect({ navigation }) {
  const [selected, setSelected] = useState(null);
  const next = () => {
    if (!selected) return Alert.alert('Pick a character first');
    navigation.navigate('Companion', { heroKey: selected });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h2}>Choose your character</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {HEROES.map((item)=>(
          <TouchableOpacity key={item.key}
            onPress={()=>setSelected(item.key)}
            style={[styles.card, selected===item.key && styles.sel]}>
            <Sprite source={item.img} label={item.label} style={styles.img}/>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <Pressable style={styles.ghost} onPress={()=>navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={[styles.btn, !selected && {opacity:0.5}]} disabled={!selected} onPress={next}>
          <Text style={styles.btnText}>Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CARD_W = 260;

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h2:{ color:'#fff', fontSize:18, marginBottom:10, letterSpacing:0.5 },
  grid:{
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent:'center',
    alignItems:'flex-start',       // ← stop stretching
    alignContent:'flex-start',     // ← stop line stretching
    gap:16,
    paddingBottom:24,
  },
  card:{
    width:CARD_W,
    alignSelf:'flex-start',        // ← don’t stretch to row height
    backgroundColor:'#1b1731',
    borderWidth:2, borderColor:'#2d2450',
    borderRadius:12, padding:10, alignItems:'center'
  },
  sel:{ borderColor:'#B887FF', shadowColor:'#B887FF', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:2} },
  img:{ width:'100%', height:undefined, aspectRatio:2/3, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  label:{ color:'#fff', marginTop:6 },
  row:{ flexDirection:'row', gap:10, marginTop:12, justifyContent:'space-between' },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  ghost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
