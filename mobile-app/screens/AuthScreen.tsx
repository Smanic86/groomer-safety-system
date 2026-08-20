import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

type AuthScreenProps = {
  onLoginSuccess: (businessId: string, userEmail: string) => void;
};

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);

    if (isRegistering) {
      if (!salonName.trim()) {
        Alert.alert('Error', 'Please enter your salon name.');
        setLoading(false);
        return;
      }

      // 1. Create new Salon entry in businesses table
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert([{ name: salonName.trim() }])
        .select()
        .single();

      if (businessError || !businessData) {
        setLoading(false);
        Alert.alert('Registration Error', businessError?.message || 'Could not create salon.');
        return;
      }

      // 2. Sign up user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError || !authData.user) {
        setLoading(false);
        Alert.alert('Auth Error', authError?.message || 'Failed to register account.');
        return;
      }

      // 3. Link profile to the newly created Salon business_id
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        business_id: businessData.id,
        full_name: `${salonName.trim()} Manager`,
        role: 'manager',
      });

      setLoading(false);
      Alert.alert('Salon Account Created!', `Welcome, ${salonName}!`);
      onLoginSuccess(businessData.id, email.trim());
    } else {
      // Login existing user/salon
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError || !authData.user) {
        setLoading(false);
        Alert.alert('Login Error', authError?.message || 'Invalid credentials.');
        return;
      }

      // Fetch salon business_id associated with this account
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', authData.user.id)
        .single();

      setLoading(false);

      const assignedBusinessId = profile?.business_id || '00000000-0000-0000-0000-000000000000';
      onLoginSuccess(assignedBusinessId, email.trim());
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isRegistering ? 'Register New Salon' : 'Salon Login'}</Text>

      {isRegistering && (
        <>
          <Text style={styles.label}>Salon / Business Name *</Text>
          <TextInput
            style={styles.input}
            value={salonName}
            onChangeText={setSalonName}
            placeholder="e.g., Paws & Claws Grooming"
          />
        </>
      )}

      <Text style={styles.label}>Email Address *</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="salon@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <View style={styles.buttonSpacing}>
        <Button
          title={loading ? 'Processing...' : isRegistering ? 'Register Salon' : 'Sign In'}
          onPress={handleAuth}
          disabled={loading}
          color="#2563eb"
        />
      </View>

      <Button
        title={isRegistering ? 'Already have an account? Sign In' : "Don't have a salon account? Register"}
        onPress={() => setIsRegistering(!isRegistering)}
        color="#6b7280"
      />

      {/* Copyright Footer */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: '#1e293b' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 16 },
  buttonSpacing: { marginTop: 8, marginBottom: 16 },
  copyrightContainer: { marginTop: 40, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});