// src/navigation/index.js — NO NavigationContainer here
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// update paths if your files live elsewhere
import Splash from '../screens/Splash';
import Character from '../screens/CharacterSelect';
import Companion from '../screens/CompanionSelect';
import Start from '../screens/StartDay';
import Activities from '../screens/Activities';
import End from '../screens/EndDay';
import Trends from '../screens/Trends';

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
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Character" component={Character} />
      <Stack.Screen name="Companion" component={Companion} />
      <Stack.Screen name="Start" component={Start} />
      <Stack.Screen name="Activities" component={Activities} />
      <Stack.Screen name="End" component={End} />
      <Stack.Screen name="Trends" component={Trends} />
    </Stack.Navigator>
  );
}
