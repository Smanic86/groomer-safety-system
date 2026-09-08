import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groomer Safety System</Text>
      <Text style={styles.subtitle}>Welcome back! Select a section below:</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StaffList')}>
        <Text style={styles.buttonText}>Staff Members</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Schedule')}>
        <Text style={styles.buttonText}>Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DogProfiles')}>
        <Text style={styles.buttonText}>Dog Profiles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cancellation')}>
        <Text style={styles.buttonText}>Cancellations</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1a202c', 
    marginBottom: 5, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#4a5568', 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  button: { 
    backgroundColor: '#3182ce', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 15, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  }
});