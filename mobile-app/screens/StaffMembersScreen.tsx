import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function StaffMembersScreen() {
  const navigation = useNavigation<any>();
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  async function fetchStaffMembers() {
    const { data } = await supabase.from('staff_members').select('*');
    if (data) setStaffMembers(data);
  }

  async function handleAddStaff() {
    if (!staffName.trim()) return;
    const { data, error } = await supabase.from('staff_members').insert([
      { name: staffName.trim(), role: role.trim() || 'Groomer' }
    ]).select();

    if (!error && data) {
      setStaffMembers([...staffMembers, data[0]]);
      setStaffName('');
      setRole('');
    }
  }

  async function handleRemoveStaff(id: any) {
    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    if (!error) {
      setStaffMembers(staffMembers.filter(item => item.id !== id));
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Members Management</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Staff Member Name..."
          placeholderTextColor="#a0aec0"
          value={staffName}
          onChangeText={setStaffName}
        />
        <TextInput
          style={styles.input}
          placeholder="Role (e.g., Senior Groomer)..."
          placeholderTextColor="#a0aec0"
          value={role}
          onChangeText={setRole}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
          <Text style={styles.addButtonText}>Add Staff Member</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staffMembers}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowText}>{item.name}</Text>
              <Text style={styles.subText}>Role: {item.role}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveStaff(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <ReportButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formContainer: { marginBottom: 20, gap: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  addButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  rowText: { fontSize: 16, color: '#2d3748', fontWeight: '600' },
  subText: { fontSize: 13, color: '#718096', marginTop: 3 },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 }
});