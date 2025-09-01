import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Alert } from 'react-native';
import Sprite from '../ui/Sprite';
import { HEROES } from './CharacterSelect';
import { heroArt, companionArt } from '../art';

export default function CompanionSelect({ navigation, route }) {
  const heroKey = route?.params?.heroKey ?? null;
  const base = HEROES.filter(h => h.key !== heroKey)
    .map(h => ({ key:h.key, label:h.label, img: companionArt[h.key] || heroArt[h.key] }));
  const extras = [
    { key:'molly', label:'Molly 🐶', img: companionArt.molly },
    { key:'bird',  label:'Bird',     img: companionArt.bird  },
    { key:'star',  label:'Star',     img: companionArt.star  },
  ];
  const options = useMemo(()=>{
    const seen=new Set(), out=[]; [...base, ...extras].forEach(x=>{ if(!seen.has(x.key)){seen.add(x.key); out.push(x);} });
    return out;
  }, [heroKey]);

  const [selected, setSelected] = useState(null);
  const goStart = () => {
    if (!selected) return Alert.alert('Pick a companion');
    navigation.navigate('Start', { heroKey, companionKey: selected });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h2}>Choose a companion</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {options.map(c => (
          <TouchableOpacity key={c.key}
            onPress={()=>setSelected(c.key)}
            style={[styles.card, selected===c.key && styles.sel]}>
            <Sprite source={c.img} label={c.label} style={styles.img}/>
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.row}>
        <Pressable style={styles.ghost} onPress={()=>navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={[styles.btn, !selected && {opacity:0.5}]} disabled={!selected} onPress={goStart}>
          <Text style={styles.btnText}>Start Day →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CARD_W = 260;
const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h2:{ color:'#fff', fontSize:18, marginBottom:10 },
  grid:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'center', gap:16, paddingBottom:24 },
  card:{ width:CARD_W, backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:10, alignItems:'center' },
  sel:{ borderColor:'#B887FF', shadowColor:'#B887FF', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:2} },
  img:{ width:'100%', height:undefined, aspectRatio:3/4, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  label:{ color:'#fff', marginTop:6 },
  row:{ flexDirection:'row', gap:10, marginTop:12, justifyContent:'space-between' },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  ghost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
