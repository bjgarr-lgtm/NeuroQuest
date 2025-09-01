// src/ui/Toasts.js
import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const Ctx = createContext({ push: () => {} });

export function ToastHost() {
  const [items, setItems] = useState([]);
  const idRef = useRef(1);

  const push = (text = '+5 XP', opts = {}) => {
    const id = idRef.current++;
    const a = new Animated.Value(0);
    const life = opts.life ?? 1200;
    const x = opts.x ?? (Dimensions.get('window').width / 2 - 40);
    const y = opts.y ?? 140;
    const color = opts.color ?? '#fff';

    setItems(arr => [...arr, { id, text, a, x, y, color }]);
    Animated.timing(a, { toValue: 1, duration: 280, useNativeDriver: false }).start(() => {
      Animated.timing(a, { toValue: 2, duration: life, useNativeDriver: false }).start(() => {
        Animated.timing(a, { toValue: 3, duration: 260, useNativeDriver: false }).start(() => {
          setItems(arr => arr.filter(t => t.id !== id));
        });
      });
    });
  };

  const v = useMemo(() => ({ push }), []);

  return (
    <Ctx.Provider value={v}>
      <View pointerEvents="none" style={styles.portal}>
        {items.map(t => {
          const top = t.a.interpolate({ inputRange:[0,3], outputRange:[t.y, t.y - 36, t.y - 44, t.y - 52] });
          const op  = t.a.interpolate({ inputRange:[0,0.2,2.7,3], outputRange:[0,1,1,0] });
          return (
            <Animated.Text
              key={t.id}
              style={[styles.toast, { top, left:t.x, opacity:op, color:t.color }]}
            >
              {t.text}
            </Animated.Text>
          );
        })}
      </View>
      {/* Render children via portal pattern (top-level host sits in App.js) */}
    </Ctx.Provider>
  );
}

export function useToasts() {
  return useContext(Ctx);
}

const styles = StyleSheet.create({
  portal:{ position:'absolute', left:0, right:0, top:0, bottom:0, zIndex: 9999 },
  toast:{
    position:'absolute',
    fontSize:18, fontWeight:'900',
    textShadowColor:'#000', textShadowRadius:6,
  },
});
