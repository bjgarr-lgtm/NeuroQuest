// App.js — non-blocking fonts (no splash guard), plays nice on Cloudflare Pages
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// keep your existing imports:
import RootNav from './src/navigation';      // your stack/tab nav
// import { colors } from './src/theme';     // optional if you use a theme

// OPTION A (keep @expo-google-fonts; will show system font if fetch fails on web)
// import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// --- OPTION B (recommended for web): bundle a local TTF ---
// 1) download "PressStart2P-Regular.ttf" and place at ./assets/fonts/PressStart2P-Regular.ttf
// 2) comment OPTION A import above, and uncomment the two lines below:
import { useFonts } from 'expo-font';
const localFont = { PressStart2P_400Regular: require('./assets/fonts/PressStart2P-Regular.ttf') };

export default function App() {
  // Load fonts WITHOUT blocking UI. If web static export can’t fetch the TTF,
  // we just fall back to system fonts and the app still renders.
  const [fontsLoaded] = useFonts(
    // OPTION A:
    { PressStart2P_400Regular }
    // OPTION B:
    // localFont
  );

  // Use the pixel font when available; otherwise let the platform default render.
  const appFontFamily = fontsLoaded ? 'PressStart2P_400Regular' : undefined;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {/* Pass the font family down if your screens/components accept it; or set it inline in headers */}
      <RootNav appFontFamily={appFontFamily} />
    </NavigationContainer>
  );
}
