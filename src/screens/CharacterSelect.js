import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Pressable, Alert } from 'react-native';
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
    <View style={styles.wrap}>
      <Text style={styles.h2}>Choose your character</Text>
      <FlatList
        data={HEROES}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        keyExtractor={(it) => it.key}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelected(item.key)} style={[styles.card, selected === item.key && styles.sel]}>
            <Image source={item.img} style={styles.img} />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={() => navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={[styles.btn, !selected && {opacity:0.5}]} disabled={!selected} onPress={next}><Text style={styles.btnText}>Next →</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h2:{ color:'#fff', fontSize:18, marginBottom:10 },
  card:{ flex:1, backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:8, alignItems:'center' },
  sel:{ borderColor:'#B887FF' },
  img:{ width:'100%', aspectRatio:4/3, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  label:{ color:'#fff', marginTop:6 },
  row:{ flexDirection:'row', gap:10, marginTop:12 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnGhost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
