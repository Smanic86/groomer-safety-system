/**
 * Application: Groomer Safety System (Mobile App)
 * Author: smanic86
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import DogProfilesScreen from './screens/PetListScreen';
import StaffScreen from './screens/StaffScreen';
import ReportProblemScreen from './screens/ReportProblemScreen';
import LoginScreen from './screens/LoginScreen';
import CancellationsScreen from './screens/CancellationScreen';

const Stack = createNativeStackNavigator();
const CURRENT_VERSION = "1.0.5";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    checkForUpdates();
    return () => subscription.unsubscribe();
  }, []);

  async function checkForUpdates() {
    try {
      const response = await fetch(`https://mobile-1985ovmlb-smanic87.vercel.app/version.json?t=${new Date().getTime()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          setUpdateAvailable(true);
        }
      }
    } catch (error) {}
  }

  const handleRefresh = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      setUpdateAvailable(false);
      checkForUpdates();
    }
  };

  async function handlePasswordReset() {
    if (!resetEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'https://mobile-1985ovmlb-smanic87.vercel.app',
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
      setResetModalVisible(false);
      setResetEmail('');
    }
  }

  if (loadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Groomer Safety System...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {updateAvailable && (
        <View style={styles.updateBanner}>
          <Text style={styles.updateText}>✨ A fix has been deployed!</Text>
          <TouchableOpacity style={styles.updateButton} onPress={handleRefresh}>
            <Text style={styles.updateButtonText}>Click to Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {!session ? (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="DogProfiles" component={DogProfilesScreen} />
            <Stack.Screen name="Staff" component={StaffScreen} />
            <Stack.Screen name="Cancellations" component={CancellationsScreen} />
            <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      )}

      <View style={styles.footerBar}>
        {!session ? (
          <TouchableOpacity onPress={() => setResetModalVisible(true)}>
            <Text style={styles.resetTriggerText}>Forgot your password? Click here to reset</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Text style={[styles.resetTriggerText, { color: '#e53e3e' }]}>Sign Out</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.copyrightText}>© 2026 Groomer Safety System. All rights reserved.</Text>
      </View>

      {resetModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Enter your account email to receive a password reset link.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email..."
              placeholderTextColor="#a0aec0"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setResetModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handlePasswordReset}>
                <Text style={styles.submitButtonText}>Send Reset Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { fontSize: 14, color: '#718096', fontWeight: '600' },
  updateBanner: { backgroundColor: '#3182ce', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 9999 },
  updateText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  updateButton: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  updateButtonText: { color: '#3182ce', fontWeight: 'bold', fontSize: 12 },
  footerBar: { padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderColor: '#e2e8f0', gap: 4 },
  resetTriggerText: { color: '#3182ce', fontSize: 12, fontWeight: '600' },
  copyrightText: { color: '#a0aec0', fontSize: 10 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a202c', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#718096', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, fontSize: 14, marginBottom: 15, backgroundColor: '#fff', color: '#1a202c' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#e2e8f0', borderRadius: 4 },
  cancelButtonText: { color: '#4a5568', fontWeight: '600', fontSize: 13 },
  submitButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#3182ce', borderRadius: 4 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});