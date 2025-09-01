// src/navigation/index.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Core flow screens
import Splash from '../screens/Splash';
import Welcome from '../screens/Welcome';
import CharacterSelect from '../screens/CharacterSelect';
import CompanionSelect from '../screens/CompanionSelect';
import StartDay from '../screens/StartDay';

// Home/Dashboard + game screens
import Home from '../screens/Home';          // we’ll alias this as Dashboard
import Activities from '../screens/Activities';
import QuestBoard from '../screens/QuestBoard'; // ok if you have it; otherwise remove
import PetRoom from '../screens/PetRoom';
import Shop from '../screens/Shop';
import Trends from '../screens/Trends';
import EndDay from '../screens/EndDay';

const Stack = createNativeStackNavigator();
const Dashboard = Home; // <- alias resolves "Dashboard is not defined"

export default function RootNav() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {/* onboarding */}
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Character" component={CharacterSelect} />
      <Stack.Screen name="Companion" component={CompanionSelect} />
      <Stack.Screen name="StartDay" component={StartDay} />

      {/* app core */}
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Quests" component={Activities} />
      {/* keep this if you’re using a board view; otherwise remove the line */}
      <Stack.Screen name="QuestBoard" component={QuestBoard} />
      <Stack.Screen name="PetRoom" component={PetRoom} />
      <Stack.Screen name="Shop" component={Shop} />
      <Stack.Screen name="Trends" component={Trends} />
      <Stack.Screen name="EndDay" component={EndDay} />
    </Stack.Navigator>
  );
}
