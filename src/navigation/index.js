import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Onboarding
import Splash from '../screens/Splash';
import Welcome from '../screens/Welcome';
import CharacterSelect from '../screens/CharacterSelect';
import CompanionSelect from '../screens/CompanionSelect';

// Core
import Home from '../screens/Home';            // aliased as Dashboard
import Activities from '../screens/Activities';
import PetRoom from '../screens/PetRoom';
import Shop from '../screens/Shop';
import Trends from '../screens/Trends';
import EndDay from '../screens/EndDay';

const Stack = createNativeStackNavigator();
const Dashboard = Home;

export default function RootNav() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown:false, animation:'fade' }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Character" component={CharacterSelect} />
      <Stack.Screen name="Companion" component={CompanionSelect} />

      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Quests" component={Activities} />
      <Stack.Screen name="PetRoom" component={PetRoom} />
      <Stack.Screen name="Shop" component={Shop} />
      <Stack.Screen name="Trends" component={Trends} />
      <Stack.Screen name="EndDay" component={EndDay} />
    </Stack.Navigator>
  );
}
