/**
 * Screen: Home
 * Application: Groomer Safety System
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ReportButton from '../components/ReportButton';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groomer Safety System</Text>
        <Text style={styles.subtitle}>Welcome back! Select a section below:</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Staff')}>
          <Text style={styles.primaryButtonText}>Staff Rota & Daily Dogs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Schedule')}>
          <Text style={styles.secondaryButtonText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('DogProfiles')}>
          <Text style={styles.secondaryButtonText}>Dog Profiles</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Cancellations')}>
          <Text style={styles.secondaryButtonText}>Cancellation List</Text>
        </TouchableOpacity>
      </View>

      <ReportButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a202c', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#718096' },
  buttonContainer: { gap: 12, marginBottom: 20 },
  primaryButton: { backgroundColor: '#3182ce', padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  secondaryButtonText: { color: '#2d3748', fontSize: 15, fontWeight: '600' }
});