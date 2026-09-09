/**
 * @file StaffManager.tsx
 * @description Component for salon owners to manage their team members.
 * @copyright Copyright (c) 2026 Shaun Hancock. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function StaffManager({ ownerId }: { ownerId: string }) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [ownerId]);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('salon_staff')
      .select('*')
      .eq('owner_id', ownerId);

    if (!error && data) {
      setStaffList(data);
    }
  };

  const handleAddStaff = async () => {
    if (!staffName || !staffEmail) {
      Alert.alert('Error', 'Please enter both staff name and email.');
      return;
    }

    const { error } = await supabase.from('salon_staff').insert([
      {
        owner_id: ownerId,
        staff_name: staffName.trim(),
        staff_email: staffEmail.trim(),
      },
    ]);

    if (error) {
      Alert.alert('Error adding staff', error.message);
    } else {
      Alert.alert('Success', 'Staff member added to your salon directory!');
      setStaffName('');
      setStaffEmail('');
      fetchStaff();
    }
  };

  const handleDeleteStaff = async (staffId: string, staffMemberName: string) => {
    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${staffMemberName} from your salon roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('salon_staff')
              .delete()
              .eq('id', staffId)
              .eq('owner_id', ownerId);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              fetchStaff();
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Salon Staff</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Staff Member Name"
        placeholderTextColor="#94a3b8"
        value={staffName}
        onChangeText={setStaffName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Staff Email Address"
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        value={staffEmail}
        onChangeText={setStaffEmail}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
        <Text style={styles.addButtonText}>+ Add Staff Member</Text>
      </TouchableOpacity>

      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.staffCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName}>{item.staff_name}</Text>
              <Text style={styles.staffEmail}>{item.staff_email}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => handleDeleteStaff(item.id, item.staff_name)}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, width: '100%' },
  header: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8, width: '100%' },
  addButton: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  staffCard: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 6, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  staffName: { fontWeight: '700', color: '#1e293b', fontSize: 13 },
  staffEmail: { color: '#64748b', fontSize: 12 },
  deleteButton: { backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 11 },
});