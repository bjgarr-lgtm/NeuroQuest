import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Alert } from 'react-native';
import { HEROES } from './CharacterSelect';

const P = 'https://dummyimage.com/600x420/1b1731/ffffff.png&text=';

// Molly is always available as a companion:
const EXTRA_COMPANIONS = [{ key:'molly', label:'Molly 🐶', uri: P + 'Molly' }];

export default function CompanionSelect({ navigation, route }) {
  const heroKey = route?.params?.heroKey ?? null;

  // companions = all heroes except the chosen one, plus Molly
  const options = useMemo(() => {
    const base = HEROES.filter(c => c.key !== heroKey);
    return [...base, ...EXTRA_COMPANIONS];
  }, [heroKey]);

  const [selected, setSelected] = useState(null);

  const goStart = () => {
    if (!selected) return Alert.alert('Pick a companion');
    navigation.navigate('Start', { heroKey, companionKey: selected });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>Choose a companion</Text>
      <View style={styles.grid}>
        {options.map(c => (
          <TouchableOpacity key={c.key} onPress={() => setSelected(c.key)} style={[styles.card, selected === c.key && styles.sel]}>
            <Image source={{ uri: c.uri }} style={styles.img} />
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={() => navigation.goBack()}><Text style={styles.ghostText}>← Back</Text></Pressable>
        <Pressable style={[styles.btn, !selected && {opacity:0.5}]} disabled={!selected} onPress={goStart}><Text style={styles.btnText}>Start Day →</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h2:{ color:'#fff', fontSize:18, marginBottom:10 },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:{ flexGrow:1, minWidth:220, backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:8, alignItems:'center' },
  sel:{ borderColor:'#B887FF' },
  img:{ width:'100%', aspectRatio:4/3, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  label:{ color:'#fff', marginTop:6 },
  row:{ flexDirection:'row', gap:10, marginTop:12 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnGhost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
