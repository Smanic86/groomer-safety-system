import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

/**
 * Groomer Safety Management System - Sign Up Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [salonName, setSalonName] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || !password.trim() || !salonName.trim() || !fullName.trim()) {
      Alert.alert('Missing Fields', 'Please complete all text fields.');
      return;
    }
    if (!acceptPolicies) {
      Alert.alert('Privacy Policy Required', 'You must accept the UK GDPR privacy policy and terms to register.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
          salon_name: salonName.trim(),
          policy_accepted_at: new Date().toISOString(),
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      Alert.alert('Success', 'Account created successfully!', [
        { 
          text: 'Continue to App', 
          onPress: () => navigation.replace('Schedule') 
        }
      ]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Groomer Account</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Full Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name..."
          placeholderTextColor="#a0aec0"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Salon Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Star Grooming..."
          placeholderTextColor="#a0aec0"
          value={salonName}
          onChangeText={setSalonName}
        />

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
          placeholder="At least 6 characters..."
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.switchRow}>
          <Switch
            value={acceptPolicies}
            onValueChange={setAcceptPolicies}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
          <Text style={styles.switchText}>
            I agree to UK GDPR data handling terms, salon safety policies, and client privacy guidelines.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleSignUp}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkButtonText}>Already have an account? Log in here</Text>
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
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 5 },
  switchText: { flex: 1, fontSize: 12, color: '#4a5568', lineHeight: 16 },
  submitButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6, marginTop: 5 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  linkButton: { marginTop: 10, alignItems: 'center' },
  linkButtonText: { color: '#3182ce', fontSize: 13, fontWeight: '600' }
});