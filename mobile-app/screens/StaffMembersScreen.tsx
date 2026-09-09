import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

/**
 * Groomer Safety System - Staff Management Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

const ROLES = ['groomer', 'receptionist', 'manager'];

export default function StaffMembersScreen() {
  const navigation = useNavigation<any>();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data, error } = await supabase.from('staff_members').select('*').order('name');
    if (error) console.log('Error fetching staff:', error.message);
    else if (data) setStaffList(data);
  }

  async function handleAddStaff() {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a staff member name.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.from('staff_members').insert([
      {
        name: name.trim(),
        role: role,
        phone: phone.trim() || 'No phone provided'
      }
    ]).select();

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to add staff member: ' + error.message);
    } else {
      if (data) {
        setStaffList(prev => [...prev, data[0]]);
      }
      Alert.alert('Success', 'Staff member added successfully.');
      setName('');
      setPhone('');
    }
  }

  async function handleDeleteStaff(id: any) {
    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    if (!error) {
      setStaffList(staffList.filter(item => item.id !== id));
    } else {
      Alert.alert('Error', 'Could not delete staff member.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Management & Roles</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Staff Full Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Sarah Jenkins"
          placeholderTextColor="#a0aec0"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>System Role / Permissions:</Text>
        <View style={styles.chipsRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, role === r && styles.selectedChip]}
              onPress={() => setRole(r)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, role === r && styles.selectedChipText]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Contact Phone:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 07123 456789"
          placeholderTextColor="#a0aec0"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleAddStaff}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving...' : 'Add Staff Member'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Active Salon Staff Roster</Text>
        {staffList.length === 0 ? (
          <Text style={styles.emptyText}>No staff members found.</Text>
        ) : (
          staffList.map((member) => (
            <View key={member.id} style={styles.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>
                  👤 {member.name} {member.role === 'receptionist' ? '⭐' : '✂️'}
                </Text>
                <Text style={styles.subText}>Role: {member.role} | Phone: {member.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteStaff(member.id)} activeOpacity={0.7}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <ReportButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 12, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  chip: { backgroundColor: '#edf2f7', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e0' },
  selectedChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { color: '#4a5568', fontSize: 13, fontWeight: '500' },
  selectedChipText: { color: '#fff' },
  submitButton: { backgroundColor: '#3182ce', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  rowText: { fontSize: 15, color: '#2d3748', fontWeight: '600' },
  subText: { fontSize: 13, color: '#4a5568', marginTop: 3 },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 15, fontSize: 15 }
});