import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

type LoginScreenProps = {
  navigation?: any;
  onSuccess?: () => void;
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5',
    position: 'relative'
  },
  contentContainer: {
    paddingBottom: 80
  },
  header: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1a202c', 
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 40
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 24,
    textAlign: 'center'
  },
  form: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#4a5568', 
    marginTop: 10, 
    marginBottom: 5 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#cbd5e0', 
    borderRadius: 6, 
    padding: 10, 
    fontSize: 14, 
    backgroundColor: '#fff',
    color: '#1a202c' 
  },
  button: { 
    backgroundColor: '#3182ce', 
    padding: 14, 
    borderRadius: 6, 
    alignItems: 'center', 
    marginTop: 20 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  copyrightContainer: { 
    marginTop: 30, 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  copyrightText: { 
    fontSize: 12, 
    color: '#9ca3af', 
    textAlign: 'center' 
  }
});

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      if (onSuccess) {
        onSuccess();
      } else if (data.session) {
        // Forces a clean web reload to seamlessly transition into the authenticated dashboard view
        window.location.reload();
      }
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to access the Groomer Safety System</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your email" 
          placeholderTextColor="#a0aec0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your password" 
          placeholderTextColor="#a0aec0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System
        </Text>
      </View>

      <ReportButton />
    </ScrollView>
  );
}