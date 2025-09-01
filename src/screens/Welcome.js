import React from 'react';
import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import { colors, Panel } from '../ui/Skin';
import TopNav from '../ui/TopNav';

export default function Welcome({ navigation }) {
  return (
    <View style={s.screen}>
      <TopNav />
      <View style={{ padding:16 }}>
        <Panel title="Welcome to NeuroQuest">
          <Pressable onPress={()=>navigation.replace('Character')} style={s.card}>
            <Image source={require('../../assets/welcome-rules.png')} style={s.img} resizeMode="contain" />
            <View style={s.tag}><Text style={s.tagTxt}>TAP TO START</Text></View>
          </Pressable>
        </Panel>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  card:{ borderWidth:2, borderColor:'#2d2450', borderRadius:16, overflow:'hidden', backgroundColor:'#131024' },
  img:{ width:'100%', height:360, backgroundColor:'transparent' },
  tag:{ position:'absolute', right:12, bottom:12, backgroundColor:'#fff', paddingVertical:8, paddingHorizontal:12, borderRadius:12 },
  tagTxt:{ color:'#0d0a17', fontWeight:'800' },
});
