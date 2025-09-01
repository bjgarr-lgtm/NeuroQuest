import React from 'react';
import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import TopNav from '../ui/TopNav';
import { colors, Panel } from '../ui/Skin';

export default function Welcome({ navigation }) {
  const start = () => navigation.replace('Character');
  return (
    <View style={s.screen}>
      <TopNav />
      <View style={{ padding:16 }}>
        <Panel title="Welcome to NeuroQuest">
          <Pressable onPress={start} style={s.card}>
            {/* Swap to your rules art if you prefer: require('../../assets/welcome-rules.png') */}
            <Image source={require('../../assets/splash.png')} style={s.img} resizeMode="contain" />
            <View style={s.tapBadge}><Text style={s.tapTxt}>TAP TO START</Text></View>
          </Pressable>
        </Panel>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  card:{ borderWidth:2, borderColor:'#2d2450', borderRadius:16, overflow:'hidden', backgroundColor:'#131024' },
  img:{ width:'100%', height:340, backgroundColor:'transparent' },
  tapBadge:{ position:'absolute', right:12, bottom:12, backgroundColor:'#ffffff', paddingVertical:8, paddingHorizontal:12, borderRadius:12 },
  tapTxt:{ color:'#0d0a17', fontWeight:'800' },
});

