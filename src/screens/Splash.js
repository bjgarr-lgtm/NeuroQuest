
import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Button from '../components/Button'; import { colors, neon, spacing } from '../theme';

export default function Splash({ navigation }){
  return (
    <View style={[styles.wrap]}>
      <View style={neon.panel}>
        <Text style={styles.logo}>NEUROQUEST</Text>
        <Text style={styles.tag}>Questing for focus, powered by snacks & spite.</Text>
        <Image source={require('../../assets/hero-bambi.png')} style={styles.img}/>
        <Button title="Start" variant="primary" size="xl" onPress={()=>navigation.navigate('Character')} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor: colors.bg, alignItems:'center', justifyContent:'center', padding:16 },
  logo:{ fontSize:28, color:colors.ink, marginBottom:8 },
  tag:{ color:colors.muted, marginBottom:12 },
  img:{ width:220, height:280, resizeMode:'contain', alignSelf:'center', marginBottom:16 }
});
