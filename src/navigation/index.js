
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from '../screens/Splash';
import CharacterSelect from '../screens/CharacterSelect';
import CompanionSelect from '../screens/CompanionSelect';
import StartDay from '../screens/StartDay';
import Activities from '../screens/Activities';
import EndDay from '../screens/EndDay';
import Trends from '../screens/Trends';

const Stack = createNativeStackNavigator();

export default function RootNav(){
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Character" component={CharacterSelect} />
        <Stack.Screen name="Companion" component={CompanionSelect} />
        <Stack.Screen name="StartDay" component={StartDay} />
        <Stack.Screen name="Activities" component={Activities} />
        <Stack.Screen name="EndDay" component={EndDay} />
        <Stack.Screen name="Trends" component={Trends} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
