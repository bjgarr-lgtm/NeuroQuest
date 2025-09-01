import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, ScrollView } from 'react-native';
import { ShinyButton, colors } from '../ui/Skin';

export default function Welcome({ navigation }) {
  const win = Dimensions.get('window');
  const heroH = Math.min(Math.max(560, Math.round(win.height * 0.7)), 900);

  const start = () => navigation.navigate('Character');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding:16, paddingBottom:32 }}>
      <Text style={styles.title}>NEUROQUEST</Text>
      <Text style={styles.tag}>Questing for focus, powered by snacks & spite.</Text>

      {/* Image with invisible pressable "Start" zone */}
      <View style={[styles.heroWrap, { height: heroH }]}>
        <Image source={require('../../assets/welcome-rules.png')} resizeMode="contain" style={styles.heroImg} />
        {/* Click zone: bottom center of the graphic (adjust if your text moves) */}
        <Pressable
          onPress={start}
          style={styles.startHotspot}
          accessibilityRole="button"
          accessibilityLabel="Start"
        />
      </View>

      {/* Extra physical button for accessibility/keyboard */}
      <ShinyButton onPress={start} style={{ marginTop: 16, borderWidth:2, borderColor: colors.border }}>
        Start
      </ShinyButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor:'#0d0a17' },
  title:{ color:'#fff', fontSize:28, fontWeight:'800' },
  tag:{ color:'#c9cbe0', marginTop:4, marginBottom:14 },
  heroWrap:{ position:'relative', width:'100%', backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:16, overflow:'hidden' },
  heroImg:{ position:'absolute', inset:0, width:'100%', height:'100%' },
  // hotspot: tweak these % to match where "Start" is printed in the art
  startHotspot:{
    position:'absolute',
    left:'35%', right:'35%', bottom:'6%', height:'12%',
    // optional tap feedback outline:
    // borderWidth:1, borderColor:'#ffffff22'
  },
});
