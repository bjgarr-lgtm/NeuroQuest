// App.js — single root: GameProvider + ToastHost + RootNav. No NavigationContainer here.
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNav from './src/navigation';
import { GameProvider } from './src/game/store';

// (optional) keep your font loader if you want; leaving out here to stay minimal/safe.
// import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { ToastHost } from './src/ui/Toasts';

export default function App() {
  // If you re-enable fonts, don't block UI if they fail on web. Keep non-blocking.
  // const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  return (
    <GameProvider>
      <StatusBar style="light" />
      {/* Global FX overlay for pop-ups */}
      <ToastHost />
      <RootNav />
    </GameProvider>
  );
}
