import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

/**
 * Groomer Safety Management System - Login Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      navigation.replace('Schedule');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Groomer Sign In</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#a0aec0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Your password..."
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Signing In...' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkButtonText}>Need an account? Sign up here</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 20, textAlign: 'center' },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  submitButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6, marginTop: 5 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  linkButton: { marginTop: 10, alignItems: 'center' },
  linkButtonText: { color: '#3182ce', fontSize: 13, fontWeight: '600' }
});