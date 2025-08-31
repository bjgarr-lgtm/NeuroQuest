
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import RootNav from './src/navigation';
import { colors } from './src/theme';

export default function App(){
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  if (!fontsLoaded) return null;
  return (<>
    <StatusBar style="light" backgroundColor={colors.bg}/>
    <RootNav/>
  </>);
}
