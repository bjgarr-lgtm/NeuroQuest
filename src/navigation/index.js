// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from '../screens/Splash';
import Welcome from '../screens/Welcome';
import Home from '../screens/Home';

import CharacterSelect from '../screens/CharacterSelect';
import CompanionSelect from '../screens/CompanionSelect';
import StartDay from '../screens/StartDay';

import QuestBoard from '../screens/QuestBoard';
import Activities from '../screens/Activities'; // alias that re-exports QuestBoard
import EndDay from '../screens/EndDay';
import Trends from '../screens/Trends';

const Stack = createNativeStackNavigator();

export default function RootNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: '#0d0a17' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#0d0a17' },
        }}
      >
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown:false }} />
        <Stack.Screen name="Welcome" component={Welcome} options={{ title: 'Welcome' }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Dashboard' }} />

        <Stack.Screen name="Character" component={CharacterSelect} options={{ title:'Choose Character' }} />
        <Stack.Screen name="Companion" component={CompanionSelect} options={{ title:'Choose Companion' }} />
        <Stack.Screen name="Start" component={StartDay} options={{ title:'Start Day' }} />

        <Stack.Screen name="QuestBoard" component={QuestBoard} options={{ title: 'Daily Activities' }} />
        <Stack.Screen name="Activities" component={Activities} options={{ title: 'Daily Activities' }} />

        <Stack.Screen name="EndDay" component={EndDay} options={{ title: 'End of Day' }} />
        <Stack.Screen name="Trends" component={Trends} options={{ title: 'Trends' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
