/**
 * Project: Dog Grooming Management & Safety App
 * File: LoginScreen.tsx
 * Description: Authentication and beta registration screen with access code verification.
 * 
 * Copyright (c) 2026 Smanic86. All rights reserved.
 * Proprietary and Confidential.
 */

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Constants for Beta Tester Access
  const REQUIRED_BETA_CODE = 'BETAGROOMER2026';
  const ASSIGNED_TESTER_BADGE = 'BetaGroomer';

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    if (isRegistering) {
      // Validate Beta Tester Invite Code during registration
      if (inviteCode.trim() !== REQUIRED_BETA_CODE) {
        setLoading(false);
        Alert.alert('Access Denied', 'Invalid or missing beta invitation code.');
        return;
      }

      try {
        // Register user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              badge: ASSIGNED_TESTER_BADGE,
            },
          },
        });

        if (error) throw error;

        Alert.alert(
          'Registration Successful', 
          `Welcome aboard! You have been granted the ${ASSIGNED_TESTER_BADGE} badge.`
        );
      } catch (err: any) {
        Alert.alert('Registration Failed', err.message || 'An unexpected error occurred.');
      }
    } else {
      // Standard Sign In Logic
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) throw error;
      } catch (err: any) {
        Alert.alert('Sign In Failed', err.message || 'Check your credentials.');
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.formCard}>
        <Text style={styles.title}>
          {isRegistering ? 'Beta Registration' : 'Groomer Login'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Enter your exclusive beta code to join.' : 'Access your salon dashboard.'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Beta Invite Code (e.g., BETAGROOMER2026)"
            placeholderTextColor="#888"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
          />
        )}

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleAuthAction}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsRegistering(!isRegistering)}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isRegistering ? 'Already have an account? Sign In' : 'Need beta access? Register here'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  primaryButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#3182ce',
    fontSize: 14,
  },
});