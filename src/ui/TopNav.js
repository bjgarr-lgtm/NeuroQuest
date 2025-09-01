// src/ui/TopNav.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TopNav({ active }) {
  const nav = useNavigation();
  const route = useRoute();
  const cur = active || route.name;

  const Item = ({ label, to }) => (
    <Pressable onPress={() => nav.navigate(to)} style={[s.tab, cur===to && s.on]}>
      <Text style={[s.tabTxt, cur===to && s.onTxt]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={s.wrap}>
      <Item label="Home"   to="Home" />
      <Item label="Quests" to="QuestBoard" />
      <Item label="Pet"    to="PetRoom" />
      <Item label="Shop"   to="Shop" />
      <Item label="Trends" to="Trends" />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    backgroundColor:'#17132b', borderWidth:2, borderColor:'#2d2450',
    borderRadius:12, padding:6, margin:16, marginBottom:8,
  },
  tab:{
    paddingVertical:8, paddingHorizontal:12, borderRadius:10,
    borderWidth:2, borderColor:'transparent',
  },
  on:{ borderColor:'#46FFC8', backgroundColor:'#10231e' },
  tabTxt:{ color:'#c9cbe0', fontWeight:'800' },
  onTxt:{ color:'#46FFC8' },
});
