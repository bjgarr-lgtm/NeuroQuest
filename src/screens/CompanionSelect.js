import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Alert } from 'react-native';
import { CHARACTERS } from './CharacterSelect';

const P = 'https://dummyimage.com/600x420/1b1731/ffffff.png&text=';

export default function CompanionSelect({ navigation, route }) {
  const heroKey = route?.params?.heroKey ?? null;

  // Everyone except the selected hero
  const options = useMemo(() => {
    const base = CHARACTERS.map(c => ({ ...c }));
    return heroKey ? base.filter(c => c.key !== heroKey) : base;
  }, [heroKey]);

  const [selected, setSelected] = useState(null);

  const goStart = () => {
    if (!selected) return Alert.alert('Pick a companion');
    navigation.navigate('Start', { heroKey, companionKey: selected });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.h2}>Companion</Text>
      <View style={styles.grid}>
        {options.map(c => (
          <TouchableOpacity key={c.key} onPress={() => setSelected(c.key)} style={[styles.card, selected === c.key && styles.sel]}>
            <Image source={{ uri: c.uri || (P + c.label) }} style={styles.img} />
            <Text style={styles.label}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btnGhost} onPress={() => navigation.goBack()}>
          <Text style={styles.ghostText}>← Back</Text>
        </Pressable>
        <Pressable style={[styles.btn, !selected && styles.btnDisabled]} onPress={goStart} disabled={!selected}>
          <Text style={styles.btnText}>Start Day →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16 },
  h2:{ color:'#fff', fontSize:18, marginBottom:10 },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:{ flexGrow:1, minWidth:240, backgroundColor:'#1b1731', borderWidth:2, borderColor:'#2d2450', borderRadius:12, padding:8, alignItems:'center' },
  sel:{ borderColor:'#B887FF' },
  img:{ width:'100%', aspectRatio:4/3, borderRadius:10, borderWidth:2, borderColor:'#2d2450' },
  label:{ color:'#fff', marginTop:6 },
  row:{ flexDirection:'row', gap:10, marginTop:12 },
  btn:{ backgroundColor:'#fff', paddingVertical:12, paddingHorizontal:16, borderRadius:12 },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
  btnDisabled:{ opacity:0.5 },
  btnGhost:{ paddingVertical:12, paddingHorizontal:16, borderRadius:12, borderWidth:2, borderColor:'#2d2450' },
  ghostText:{ color:'#c9cbe0' },
});
