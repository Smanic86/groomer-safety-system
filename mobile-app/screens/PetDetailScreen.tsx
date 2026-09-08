/**
 * Screen: Dog Profiles
 * Application: Groomer Safety System
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function PetListScreen() {
  const navigation = useNavigation<any>();
  const [dogs, setDogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDog, setSelectedDog] = useState<any>(null);

  useEffect(() => {
    fetchDogs();
  }, []);

  async function fetchDogs() {
    const { data } = await supabase.from('dogs').select('*').order('name', { ascending: true });
    if (data) setDogs(data);
  }

  const filteredDogs = dogs.filter(dog => 
    dog.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dog.breed?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedDog) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDog(null)}>
          <Text style={styles.backButtonText}>← Back to Dog List</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.profileTitle}>{selectedDog.name}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Breed:</Text> {selectedDog.breed || 'Unknown'}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Notes:</Text> {selectedDog.notes || 'No notes added.'}</Text>
        </View>
        <ReportButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Dog Profiles</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search dogs by name or breed..."
        placeholderTextColor="#a0aec0"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredDogs}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.dogItem} onPress={() => setSelectedDog(item)}>
            <Text style={styles.dogName}>{item.name}</Text>
            <Text style={styles.dogBreed}>{item.breed || 'Standard Breed'}</Text>
          </TouchableOpacity>
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
  searchInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, fontSize: 14, backgroundColor: '#fff', marginBottom: 15, color: '#1a202c' },
  dogItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  dogName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  dogBreed: { fontSize: 13, color: '#718096' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  profileTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a202c', marginBottom: 10 },
  detailText: { fontSize: 15, color: '#4a5568', marginBottom: 8 },
  bold: { fontWeight: 'bold', color: '#2d3748' }
});