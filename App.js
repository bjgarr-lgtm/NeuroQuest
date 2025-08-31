// App.js — single NavigationContainer at root + non-blocking font load
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';

// Optional local font (safe on static hosting). If you don't have the TTF yet,
// leave the map empty — the app will still render.
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    // PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf'),
  });
  const appFontFamily = fontsLoaded ? 'PressStart2P_400Regular' : undefined;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNav appFontFamily={appFontFamily} />
    </NavigationContainer>
  );
}
