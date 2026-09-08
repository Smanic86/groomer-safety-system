import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const [shifts, setShifts] = useState<any[]>([]);
  const [staffName, setStaffName] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState('');

  useEffect(() => {
    fetchShifts();
  }, []);

  async function fetchShifts() {
    const { data, error } = await supabase.from('staff_schedule').select('*');
    if (error) {
      console.log('Error fetching schedule:', error.message);
    } else if (data) {
      setShifts(data);
    }
  }

  async function handleAddShift() {
    if (!staffName.trim() || !shiftDate.trim()) return;
    const { data, error } = await supabase.from('staff_schedule').insert([
      { 
        staff_name: staffName.trim(), 
        date: shiftDate.trim(), 
        time: shiftTime.trim() || '9:00 AM - 5:00 PM' 
      }
    ]).select();

    if (!error && data) {
      setShifts([...shifts, data[0]]);
      setStaffName('');
      setShiftDate('');
      setShiftTime('');
    } else if (error) {
      console.log('Error adding shift:', error.message);
    }
  }

  async function handleRemoveShift(id: any) {
    const { error } = await supabase.from('staff_schedule').delete().eq('id', id);
    if (!error) {
      setShifts(shifts.filter(item => item.id !== id));
    } else {
      console.log('Error removing shift:', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Rota & Schedule</Text>

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
          placeholder="Date (e.g., Mon, Sep 14)..."
          placeholderTextColor="#a0aec0"
          value={shiftDate}
          onChangeText={setShiftDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Time Slot (e.g., 9:00 AM - 5:00 PM)..."
          placeholderTextColor="#a0aec0"
          value={shiftTime}
          onChangeText={setShiftTime}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddShift}>
          <Text style={styles.addButtonText}>Assign Shift</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowText}>{item.staff_name}</Text>
              <Text style={styles.subText}>{item.date} | {item.time}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveShift(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No shifts scheduled yet.</Text>
        }
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
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 30, fontSize: 15 }
});