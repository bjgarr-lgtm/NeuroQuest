import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EndDay from '../screens/EndDay';
import Splash from '../screens/Splash';
import Character from '../screens/CharacterSelect';
import Companion from '../screens/CompanionSelect';
import Start from '../screens/StartDay';
import Home from '../screens/Home';            // ← make sure this file exists
import QuestBoard from '../screens/QuestBoard';

const Stack = createNativeStackNavigator();

export default function RootNav({ appFontFamily }) {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0a17' },
        headerTintColor: '#fff',
        headerTitleStyle: appFontFamily ? { fontFamily: appFontFamily } : undefined,
        contentStyle: { backgroundColor: '#0d0a17' },
      }}
    >
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown:false }} />
      <Stack.Screen name="Character" component={Character} />
      <Stack.Screen name="Companion" component={Companion} />
      <Stack.Screen name="Start" component={Start} />
      <Stack.Screen name="EndDay" component={EndDay} options={{ title:'End of Day' }} />
      <Stack.Screen name="Home" component={Home} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="QuestBoard" component={QuestBoard} options={{ title:'Daily Quests' }} />
    </Stack.Navigator>
  );
}
