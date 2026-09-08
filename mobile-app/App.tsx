import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

import HomeScreen from './screens/HomeScreen';
import StaffMembersScreen from './screens/StaffMembersScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import DogProfilesScreen from './screens/DogProfilesScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import CancellationScreen from './screens/CancellationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    if (isSignUp) {
      // Check if email is in the allowed beta testers table
      const { data: betaCheck, error: betaError } = await supabase
        .from('beta_testers')
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      if (betaError || !betaCheck) {
        Alert.alert('Access Denied', 'This email is not authorized as a beta tester.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password.trim(),
      });
      if (error) {
        Alert.alert('Sign Up Failed', error.message);
      } else {
        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password.trim(),
      });
      if (error) Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  }

  if (!session) {
    return (
      <View style={loginStyles.container}>
        <Text style={loginStyles.title}>Groomer Safety System</Text>
        <Text style={loginStyles.subtitle}>Beta Access: {isSignUp ? 'Create an account' : 'Sign in'}</Text>
        
        <TextInput
          style={loginStyles.input}
          placeholder="Email"
          placeholderTextColor="#a0aec0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={loginStyles.input}
          placeholder="Password"
          placeholderTextColor="#a0aec0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={loginStyles.button} onPress={handleAuth} disabled={loading}>
          <Text style={loginStyles.buttonText}>
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={loginStyles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={loginStyles.switchText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="StaffMembers" component={StaffMembersScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="DogProfiles" component={DogProfilesScreen} />
        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
        <Stack.Screen name="Cancellation" component={CancellationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a202c', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#4a5568', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, padding: 12, backgroundColor: '#fff', marginBottom: 15, color: '#1a202c' },
  button: { backgroundColor: '#3182ce', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchButton: { alignItems: 'center', padding: 10 },
  switchText: { color: '#3182ce', fontSize: 14, fontWeight: '600' }
});