import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/Welcome';
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
   <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown:true }}>
    <Stack.Screen name="Welcome" component={Welcome} options={{ title:'Welcome' }} />
    <Stack.Screen name="Character" component={CharacterSelect} options={{ title:'Character' }} />
    <Stack.Screen name="Companion" component={CompanionSelect} options={{ title:'Companion' }} />
    <Stack.Screen name="Start" component={StartDay} options={{ title:'Start Day' }} />
    <Stack.Screen name="QuestBoard" component={QuestBoard} options={{ title:'Daily Activities' }} />
    <Stack.Screen name="EndDay" component={EndDay} options={{ title:'End of Day' }} />
   </Stack.Navigator>
  );
}
