import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*');

      if (error) throw error;
      setStaffList(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Universal logout handler that works seamlessly across web and mobile
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (Platform.OS === 'web') {
        window.location.href = window.location.origin;
      } else {
        navigation.replace('Login');
      }
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Your Salon Staff</Text>
        
        {Platform.OS === 'web' ? (
          // Direct raw HTML button for web to guarantee click execution
          // @ts-ignore
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff3b30',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        ) : (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={styles.centerText}>Loading staff...</Text>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.text}>Role: {item.role || 'Not specified'}</Text>
              <Text style={styles.text}>Emergency Contact: {item.emergency_contact || 'None'}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.centerText}>No staff members found for this salon.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold' },
  logoutButton: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#ff3b30', borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  card: { padding: 15, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  text: { color: '#555', fontSize: 14 },
  centerText: { textAlign: 'center', color: '#888', marginTop: 40 }
});