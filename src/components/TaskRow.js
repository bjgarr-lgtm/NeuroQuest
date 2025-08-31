
import React from 'react';
import { View, TextInput, StyleSheet, Switch } from 'react-native';
import { colors } from '../theme';

export default function TaskRow({ task, onToggle, onChange }){
  return (
    <View style={styles.row}>
      <Switch value={!!task.done} onValueChange={onToggle}/>
      <TextInput value={task.txt} onChangeText={onChange} placeholder='task'
        placeholderTextColor={colors.muted} style={styles.input}/>
    </View>
  );
}
const styles = StyleSheet.create({
  row:{ flexDirection:'row', alignItems:'center', gap:8, borderWidth:2, borderColor:'#2d2450', borderRadius:10, padding:6, backgroundColor:'#150f2c', marginBottom:6 },
  input:{ flex:1, color: colors.ink }
});
