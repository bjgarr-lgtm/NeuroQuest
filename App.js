// App.js — single NavigationContainer + GameProvider + local font
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';
import { GameProvider } from './src/game/store';
import { useFonts } from 'expo-font';

export default function App() {
  // Use a bundled TTF so Cloudflare doesn't nuke the font
  // Put the TTF at assets/fonts/PressStart2P-Regular.ttf (see Section C below)
  const [loaded] = useFonts({
    PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <GameProvider>
        <RootNav appFontFamily={loaded ? 'PressStart2P_400Regular' : undefined} />
      </GameProvider>
    </NavigationContainer>
  );
}
