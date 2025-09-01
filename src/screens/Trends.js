import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import TopNav from '../ui/TopNav';
import { Panel, colors } from '../ui/Skin';

export default function Trends() {
  return (
    <View style={s.screen}>
      <TopNav />
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>
        <Panel title="Trends (14–30d)">
          <Text style={s.item}>Tasks: — • Focus minutes: — • Stuck events: —</Text>
          <Text style={s.item}>Best time: afternoon • Top category: main • Daily completion: 60%</Text>
        </Panel>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg },
  item:{ color:'#c9cbe0', marginBottom:6 },
});
