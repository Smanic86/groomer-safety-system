import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ReportButton() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity 
      style={styles.bugButton} 
      onPress={() => navigation.navigate('ReportBug')}
      activeOpacity={0.8}
    >
      <Text style={styles.bugButtonText}>🐞 Report Bug / Issue</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bugButton: { 
    backgroundColor: '#718096', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginVertical: 20 
  },
  bugButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});