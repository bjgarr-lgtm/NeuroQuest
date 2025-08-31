// App.js — single NavigationContainer + GameProvider
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';
import { GameProvider } from './src/game/store';
import { useFonts } from 'expo-font';

export default function App() {
  useFonts({}); // optional; keeps fonts non-blocking
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <GameProvider>
        <RootNav />
      </GameProvider>
    </NavigationContainer>
  );
}
