/**
 * Copyright (c) 2026 Groomer Safety System. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const BETA_TESTER_CODE = 'MASTERS2026';

export default function AuthScreen() {
  const navigation = useNavigation<any>();

  // Toggle between 'signin' and 'register'
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'signin') {
        // Sign In logic
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        navigation.navigate('Dashboard');
      } else {
        // Register logic
        if (!fullName.trim()) {
          Alert.alert('Missing Name', 'Please enter your full name.');
          setLoading(false);
          return;
        }

        // Verify beta tester code
        if (betaCode.trim() !== BETA_TESTER_CODE) {
          Alert.alert(
            'Beta Access Restricted 🔒',
            'This app is currently in closed beta testing. A valid tester code is required to create an account.'
          );
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;

        const user = authData.user;
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: fullName.trim(),
                business_name: businessName.trim(),
                badge: 'Masters',
                is_beta_tester: true,
                created_at: new Date().toISOString(),
              },
            ]);

          if (profileError) {
            console.warn('Profile insert warning:', profileError.message);
          }
        }

        Alert.alert(
          'Welcome, Master Tester! 🎉',
          'Account successfully created with the Masters badge.',
          [{ text: 'Continue to App', onPress: () => navigation.navigate('Dashboard') }]
        );
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'signin'
              ? 'Groomer Safety & Incident Management System'
              : 'Closed Beta Registration (Masters Access Required)'}
          </Text>

          {mode === 'register' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Sarah Jenkins"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Business / Salon Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Paws & Claws Grooming"
                placeholderTextColor="#94a3b8"
                value={businessName}
                onChangeText={setBusinessName}
              />
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {mode === 'register' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.label}>Beta Tester Invite Code 🔑</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="Enter tester code..."
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                value={betaCode}
                onChangeText={setBetaCode}
              />
              <Text style={styles.codeHint}>Required to unlock access & receive the Masters badge.</Text>
            </>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleAuthAction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>
                {mode === 'signin' ? 'Sign In' : 'Register & Claim Masters Badge'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => setMode(mode === 'signin' ? 'register' : 'signin')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signin'
                ? "New Beta Tester? Create Account →"
                : "Already have an account? Sign In →"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20, justifyContent: 'center', flexGrow: 1 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', maxWidth: 440, width: '100%', alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 14, color: '#0f172a' },
  codeInput: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  codeHint: { fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  actionBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  actionBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  switchModeBtn: { marginTop: 16, alignItems: 'center', padding: 8 },
  switchModeText: { color: '#2563eb', fontWeight: '700', fontSize: 13 },
});