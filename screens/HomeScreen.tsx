import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('Error signing out:', error.message);
    }
    // Resets to root or reloads the initial entry point cleanly
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groomer Safety System</Text>
      <Text style={styles.subtitle}>Welcome back! Select a section below:</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StaffMembers')}>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a202c', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#4a5568', marginBottom: 30, textAlign: 'center' },
  button: { backgroundColor: '#3182ce', padding: 16, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { backgroundColor: '#e53e3e', padding: 14, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});