import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

export default function Splash({ navigation }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.panel}>
        <Text style={styles.logo}>NEUROQUEST</Text>
        <Text style={styles.tag}>Questing for focus, powered by snacks & spite.</Text>
        <Image
          source={{ uri: 'https://dummyimage.com/600x420/1b1731/ffffff.png&text=Splash+Art' }}
          style={styles.img}
        />
        <Pressable style={styles.btn} onPress={() => navigation.navigate('Character')}>
          <Text style={styles.btnText}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ flex:1, backgroundColor:'#0d0a17', padding:16, justifyContent:'center' },
  panel:{ backgroundColor:'#131024', borderWidth:2, borderColor:'#2d2450', borderRadius:16, padding:16 },
  logo:{ color:'#fff', fontSize:26, marginBottom:6 },
  tag:{ color:'#b9bfd3', marginBottom:12 },
  img:{ width:'100%', height:260, borderRadius:12, borderWidth:2, borderColor:'#2d2450', marginBottom:16 },
  btn:{ backgroundColor:'#fff', paddingVertical:14, borderRadius:14, alignItems:'center' },
  btnText:{ color:'#0d0a17', fontWeight:'700' },
});
