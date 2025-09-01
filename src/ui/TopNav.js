import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CORE = ['Dashboard','Quests','PetRoom','Shop','Trends','EndDay'];

export default function TopNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const name = route?.name || '';
  if (!CORE.includes(name)) return null; // hide on Splash/Welcome/Character/Companion

  const tabs = [
    { key:'Dashboard', label:'Home' },
    { key:'Quests',    label:'Quests' },
    { key:'PetRoom',   label:'Pet' },
    { key:'Shop',      label:'Shop' },
    { key:'Trends',    label:'Trends' },
  ];

  return (
    <View style={s.bar}>
      {tabs.map(t => {
        const is = name === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={()=>navigation.navigate(t.key)}
            hitSlop={{ top:8, bottom:8, left:8, right:8 }}
            style={[s.tab, is && s.active]}>
            <Text style={[s.txt, is && s.txtA]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar:{ flexDirection:'row', backgroundColor:'#130f23', borderBottomWidth:2, borderColor:'#2d2450', zIndex:10 },
  tab:{ flex:1, paddingVertical:12, alignItems:'center' },
  txt:{ color:'#d7d5e6', fontWeight:'700' },
  active:{ backgroundColor:'#1a1530' },
  txtA:{ color:'#fff' },
});
