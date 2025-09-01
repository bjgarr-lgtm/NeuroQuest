// src/navigation/index.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ✅ Import every screen explicitly from the correct paths
import Welcome from '../screens/Welcome';
import CharacterSelect from '../screens/CharacterSelect';
import CompanionSelect from '../screens/CompanionSelect';
import StartDay from '../screens/StartDay';
import QuestBoard from '../screens/QuestBoard';
import EndDay from '../screens/EndDay';

const Stack = createNativeStackNavigator();

export default function RootNav({ appFontFamily }) {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0a17' },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#fff',
          fontWeight: '800',
          // uses the pixel font if App loaded it
          ...(appFontFamily ? { fontFamily: appFontFamily } : {}),
        },
        contentStyle: { backgroundColor: '#0d0a17' },
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} options={{ title: 'Welcome' }} />
      <Stack.Screen name="Character" component={CharacterSelect} options={{ title: 'Character' }} />
      <Stack.Screen name="Companion" component={CompanionSelect} options={{ title: 'Companion' }} />
      <Stack.Screen name="Start" component={StartDay} options={{ title: 'Start Day' }} />
      <Stack.Screen name="QuestBoard" component={QuestBoard} options={{ title: 'Daily Activities' }} />
      <Stack.Screen name="EndDay" component={EndDay} options={{ title: 'End of Day' }} />
    </Stack.Navigator>
  );
}
