import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const TABS = [
  { key: 'Dashboard', label: 'Home' },
  { key: 'QuestBoard', label: 'Quests' },
  { key: 'PetRoom', label: 'Pet' },
  { key: 'Shop', label: 'Shop' },
  { key: 'Trends', label: 'Trends' },
];

export default function TopNav({ navigation, active }) {
  // `navigation` is optional; we fallback to nav from context if not passed
  const nav = navigation;
  return (
    <View style={s.bar}>
      {TABS.map(t => {
        const isActive = active === t.key || active === t.label;
        const onPress = () => nav?.navigate?.(t.key) ?? nav?.navigate?.(t.label);
        return (
          <Pressable key={t.key} onPress={onPress} style={[s.tab, isActive && s.active]}>
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
