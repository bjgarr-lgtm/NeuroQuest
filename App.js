// App.js — single root container (SafeArea + GameProvider + NavigationContainer + RootNav)
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNav from './src/navigation';
import { GameProvider } from './src/game/store';
import { ToastHost } from './src/ui/Toasts';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          {/* Global FX overlay for pop-ups */}
          <ToastHost />
          <RootNav />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}
