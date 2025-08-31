// App.js — no nested NavigationContainer, non-blocking font load
import React from 'react';
import { StatusBar } from 'expo-status-bar';

// Your navigator (it likely already wraps NavigationContainer)
import RootNav from './src/navigation';

// Use google-fonts (safe if it fails; UI still renders)
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// If you prefer a local TTF instead, see the comment below.
export default function App() {
  // Load font but DO NOT block render. If it fails, we fall back.
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular, // from @expo-google-fonts/press-start-2p
    // For a local TTF instead of the package:
    // PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  const appFontFamily = fontsLoaded ? 'PressStart2P_400Regular' : undefined;

  return (
    <>
      <StatusBar style="light" />
      {/* RootNav should contain the single NavigationContainer in your app */}
      <RootNav appFontFamily={appFontFamily} />
    </>
  );
}
