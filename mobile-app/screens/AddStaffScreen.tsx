/**
 * Copyright (c) 2026 Groomer Safety System. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function StaffScreen() {
  const navigation: any = useNavigation();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*');

      if (error) throw error;
      setStaffList(data || []);
    } catch (err: any) {
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = async () => {
    if (!staffName.trim()) {
      Alert.alert('Error', 'Please enter staff name.');
      return;
    }

    try {
      const { error } = await supabase.from('staff').insert([
        {
          name: staffName.trim(),
        },
      ]);

      if (error) throw error;

      setStaffName('');
      setStaffEmail('');
      fetchStaff();
      Alert.alert('Success', 'Staff member added successfully!');
    } catch (err: any) {
      Alert.alert('Error', 'Could not add staff: ' + err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Salon Staff Management</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.subTitle}>Add New Staff Member</Text>
        <TextInput
          style={styles.input}
          placeholder="Staff Name"
          placeholderTextColor="#94a3b8"
          value={staffName}
          onChangeText={setStaffName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address (Optional)"
          placeholderTextColor="#94a3b8"
          value={staffEmail}
          onChangeText={setStaffEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddStaff}>
          <Text style={styles.addBtnText}>+ Add Staff Member</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subTitle}>Current Team</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0284c7" />
        ) : (
          <FlatList
            data={staffList}
            keyExtractor={(item) => item.id || item.name}
            ListEmptyComponent={<Text style={styles.emptyText}>No staff members added yet.</Text>}
            renderItem={({ item }) => (
              <View style={styles.staffCard}>
                <View>
                  <Text style={styles.staffName}>{item.name}</Text>
                  {item.email ? <Text style={styles.staffEmail}>{item.email}</Text> : null}
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{item.role || 'Groomer'}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginBottom: 8 },
  backBtnText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  formCard: { backgroundColor: '#ffffff', margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  subTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 10, color: '#0f172a' },
  addBtn: { backgroundColor: '#16a34a', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  emptyText: { color: '#94a3b8', fontSize: 13, fontStyle: 'italic', marginTop: 4 },
  staffCard: { backgroundColor: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  staffName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  staffEmail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  roleBadge: { backgroundColor: '#e0f2fe', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  roleText: { fontSize: 11, color: '#0369a1', fontWeight: '800' },
});