// App.js — single NavigationContainer at root + non-blocking font load
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';

// ✅ Local font recommended for static hosting.
//    Put PressStart2P-Regular.ttf at: assets/fonts/PressStart2P-Regular.ttf
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf'),
  });
  const appFontFamily = fontsLoaded ? 'PressStart2P_400Regular' : undefined;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {/* RootNav must NOT include another NavigationContainer */}
      <RootNav appFontFamily={appFontFamily} />
    </NavigationContainer>
  );
}
