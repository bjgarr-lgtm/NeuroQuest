// src/screens/Splash.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated, Pressable } from 'react-native';
import { colors } from '../ui/Skin';

export default function Splash({ navigation }) {
  const [imgOk, setImgOk] = useState(true);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // fade in → hold → fade out → Welcome
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver:false }),
      Animated.delay(1600),
      Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver:false }),
    ]).start(() => navigation.replace('Welcome'));
  }, [fade, navigation]);

  const goNow = () => navigation.replace('Welcome');

  return (
    <Pressable onPress={goNow} style={styles.screen}>
      <Animated.View style={[styles.card, { opacity: fade }]}>
        {imgOk ? (
          <Image
            source={require('../../assets/splash.png')} // ensure this file exists
            onError={()=>setImgOk(false)}
            style={styles.hero}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.hero,{ alignItems:'center', justifyContent:'center' }]}>
            <Text style={{ color:'#fff', fontSize:28, fontWeight:'800' }}>NEUROQUEST</Text>
            <Text style={{ color:'#c9cbe0', marginTop:6 }}>Questing for focus, powered by snacks & spite.</Text>
          </View>
        )}
        <Text style={styles.hint}>tap to skip</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen:{ flex:1, backgroundColor: colors.bg, alignItems:'center', justifyContent:'center' },
  card:{
    width:'90%', maxWidth:900,
    backgroundColor:'#131024', borderRadius:18, borderWidth:2, borderColor:'#2d2450',
    padding:16, alignItems:'center'
  },
  hero:{ width:'100%', height:260 },
  hint:{ color:'#8c89a6', marginTop:8, fontSize:12 },
});
