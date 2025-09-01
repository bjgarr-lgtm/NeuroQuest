import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const TABS = [
  { key: 'Dashboard', label: 'Home' },
  { key: 'Quests',    label: 'Quests' },
  { key: 'PetRoom',   label: 'Pet' },
  { key: 'Shop',      label: 'Shop' },
  { key: 'Trends',    label: 'Trends' },
];

export default function TopNav() {
  const navigation = useNavigation();
  const route = useRoute();
  return (
    <View style={s.bar}>
      {TABS.map(t => {
        const isActive = route?.name === t.key;
        return (
          <Pressable key={t.key} onPress={() => navigation.navigate(t.key)} style={[s.tab, isActive && s.active]}>
            <Text style={[s.tabTxt, isActive && s.activeTxt]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar:{ flexDirection:'row', backgroundColor:'#130f23', borderBottomWidth:2, borderColor:'#2d2450' },
  tab:{ flex:1, paddingVertical:12, alignItems:'center' },
  tabTxt:{ color:'#d7d5e6', fontWeight:'700' },
  active:{ backgroundColor:'#1a1530' },
  activeTxt:{ color:'#fff' },
});

