import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function DogProfilesScreen() {
  const navigation = useNavigation<any>();
  const [dogs, setDogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDogs();
  }, []);

  async function fetchDogs() {
    const { data } = await supabase.from('dog_profiles').select('*');
    if (data) setDogs(data);
  }

  const filteredDogs = dogs.filter(dog => 
    dog.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Dog Profiles</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search dogs..."
        placeholderTextColor="#a0aec0"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredDogs}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('PetDetail', { dogId: item.id })}
          >
            <Image 
              source={{ uri: item.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' }} 
              style={styles.dogImage} 
            />
            <View style={styles.infoContainer}>
              <Text style={styles.dogName}>{item.name}</Text>
              <Text style={styles.breedText}>{item.breed || 'Unknown Breed'}</Text>
            </View>
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
  searchBox: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', marginBottom: 15, color: '#1a202c' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  dogImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#cbd5e0' },
  infoContainer: { marginLeft: 15, flex: 1 },
  dogName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  breedText: { fontSize: 14, color: '#718096', marginTop: 2 }
});