import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

import HomeScreen from './screens/HomeScreen';
import StaffMembersScreen from './screens/StaffMembersScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import DogProfilesScreen from './screens/DogProfilesScreen';
import CancellationScreen from './screens/CancellationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    if (error) Alert.alert('Login Failed', error.message);
    setLoading(false);
  }

  if (!session) {
    return (
      <View style={loginStyles.container}>
        <Text style={loginStyles.title}>Groomer Safety System</Text>
        <Text style={loginStyles.subtitle}>Please sign in to continue</Text>
        
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
        
        <TouchableOpacity style={loginStyles.button} onPress={handleLogin} disabled={loading}>
          <Text style={loginStyles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
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
  button: { backgroundColor: '#3182ce', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});