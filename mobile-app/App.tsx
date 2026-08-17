import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={styles.container}>
      <HomeScreen session={session} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});