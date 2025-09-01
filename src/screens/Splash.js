import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../ui/Skin';

export default function Splash({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue:1, duration:900, useNativeDriver:false }),
      Animated.delay(1600),
      Animated.timing(fade, { toValue:0, duration:500, useNativeDriver:false }),
    ]).start(() => navigation.replace('Welcome'));
  }, [fade, navigation]);

  return (
    <View style={s.wrap}>
      <Animated.Image
        source={require('../../assets/splash.png')}
        style={[s.img, { opacity:fade }]}
        resizeMode="contain"
        onError={()=>navigation.replace('Welcome')}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:colors.bg, alignItems:'center', justifyContent:'center', padding:16 },
  img:{ width:'100%', maxWidth:960, height:360, backgroundColor:'transparent' },
});
