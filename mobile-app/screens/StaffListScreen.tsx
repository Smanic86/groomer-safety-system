import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function StaffListScreen() {
  const navigation = useNavigation<any>();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const { data } = await supabase.from('daily_allocations').select('*');
    if (data) setStaffList(data);
  }

  async function handleAddStaff() {
    if (!staffName.trim()) return;
    const { data, error } = await supabase.from('daily_allocations').insert([{ staff_name: staffName.trim(), assigned_dogs: '' }]).select();
    if (!error && data) {
      setStaffList([...staffList, data[0]]);
      setStaffName('');
    }
  }

  async function handleRemove(id: any) {
    const { error } = await supabase.from('daily_allocations').delete().eq('id', id);
    if (!error) {
      setStaffList(staffList.filter(item => item.id !== id));
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Rota & Allocations</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add staff member name..."
          placeholderTextColor="#a0aec0"
          value={staffName}
          onChangeText={setStaffName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
          <Text style={styles.addButtonText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowText}>{item.staff_name}</Text>
              <Text style={styles.subText}>Assigned Dogs: {item.assigned_dogs || 'None'}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
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
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  addButton: { backgroundColor: '#3182ce', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  rowText: { fontSize: 16, color: '#2d3748', fontWeight: '600' },
  subText: { fontSize: 13, color: '#718096', marginTop: 3 },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 }
});