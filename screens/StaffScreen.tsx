/**
 * Screen: Staff Rota & Daily Dog Allocation
 * Application: Groomer Safety System
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function StaffScreen() {
  const navigation = useNavigation<any>();
  const [dailyDogs, setDailyDogs] = useState<any[]>([]);
  const [newDogName, setNewDogName] = useState('');

  useEffect(() => {
    fetchDailyDogs();
  }, []);

  async function fetchDailyDogs() {
    const { data } = await supabase.from('daily_allocations').select('*');
    if (data) setDailyDogs(data);
  }

  async function handleAddDog() {
    if (!newDogName.trim()) return;
    const { data, error } = await supabase.from('daily_allocations').insert([{ dog_name: newDogName.trim() }]).select();
    if (!error && data) {
      setDailyDogs([...dailyDogs, data[0]]);
      setNewDogName('');
    }
  }

  async function handleRemoveDog(id: any) {
    const { error } = await supabase.from('daily_allocations').delete().eq('id', id);
    if (!error) {
      setDailyDogs(dailyDogs.filter(d => d.id !== id));
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff Rota & Daily Dogs</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add dog for today..."
          placeholderTextColor="#a0aec0"
          value={newDogName}
          onChangeText={setNewDogName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddDog}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dailyDogs}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.rowItem}>
            <Text style={styles.rowText}>{item.dog_name}</Text>
            <TouchableOpacity onPress={() => handleRemoveDog(item.id)}>
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
  rowText: { fontSize: 15, color: '#2d3748', fontWeight: '600' },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 }
});