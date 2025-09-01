import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';
import { GameProvider } from './src/game/store';
import { useFonts } from 'expo-font';
import WebSplash from './src/ui/WebSplash';

export default function App() {
  const [loaded] = useFonts({
    PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <GameProvider>
        <RootNav appFontFamily={loaded ? 'PressStart2P_400Regular' : undefined} />
      </GameProvider>
      <WebSplash />
    </NavigationContainer>
  );
}
