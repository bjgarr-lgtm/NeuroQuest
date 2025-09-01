// src/screens/Welcome.js
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, ScrollView } from 'react-native';
import { ShinyButton, colors } from '../ui/Skin';

export default function Welcome({ navigation }) {
  const win = Dimensions.get('window');
  const heroH = Math.min(Math.max(640, Math.round(win.height * 0.78)), 1000);

  const start = () => navigation.navigate('Character');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding:16, paddingBottom:32 }}>
      <Text style={styles.title}>NEUROQUEST</Text>
      <Text style={styles.tag}>Finch-like focus game • neon storybook</Text>

      {/* Graphic-only: your rules are printed in the image */}
      <View style={[styles.heroWrap, { height: heroH }]}>
        <Image source={require('../../assets/welcome-rules.png')} resizeMode="contain" style={styles.heroImg} />
        {/* Transparent hotspot aligned to the printed START region */}
        <Pressable onPress={start} style={styles.startHotspot} accessibilityRole="button" accessibilityLabel="Start" />
      </View>

      {/* Backup button for keyboard/AT users */}
      <ShinyButton onPress={start} style={{ marginTop: 16, borderWidth:2, borderColor:'#2d2450' }}>
        Start
      </ShinyButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17' },
  title:{ color:'#fff', fontSize:28, fontWeight:'900' },
  tag:{ color:'#c9cbe0', marginTop:4, marginBottom:14 },
  heroWrap:{ position:'relative', width:'100%', backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:16, overflow:'hidden' },
  heroImg:{ position:'absolute', inset:0, width:'100%', height:'100%' },
  // Tweak these % to match your printed START button in the art
  startHotspot:{ position:'absolute', left:'34%', right:'34%', bottom:'6%', height:'12%' },
});
