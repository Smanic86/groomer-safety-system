import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function PetDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { dogId } = route.params || {};
  const [dog, setDog] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (dogId) {
      fetchDogDetails();
    }
  }, [dogId]);

  async function fetchDogDetails() {
    const { data, error } = await supabase.from('dog_profiles').select('*').eq('id', dogId).single();
    if (error) {
      console.log('Error fetching dog details:', error.message);
    } else if (data) {
      setDog(data);
    }
  }

  async function handleAddToCancellations() {
    if (!dog) return;
    setAdding(true);
    setSuccessMessage('');
    
    const { error } = await supabase.from('cancellations_backup').insert([
      { name: dog.name, breed: dog.breed || 'Unknown' }
    ]);

    if (error) {
      setSuccessMessage(`Error: ${error.message}`);
    } else {
      setSuccessMessage(`Success! ${dog.name} has been added to the cancellations backup list.`);
    }
    setAdding(false);
  }

  if (!dog) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>Loading dog details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Profiles</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Image 
          source={{ uri: dog.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1' }} 
          style={styles.dogImage} 
        />
        <Text style={styles.dogName}>{dog.name}</Text>
        <Text style={styles.breedText}>Breed: {dog.breed || 'Unknown Breed'}</Text>
        {dog.notes ? <Text style={styles.notesText}>Notes: {dog.notes}</Text> : null}

        {successMessage ? (
          <View style={[styles.banner, successMessage.startsWith('Error') ? styles.errorBanner : styles.successBanner]}>
            <Text style={styles.bannerText}>{successMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleAddToCancellations}
          disabled={adding}
        >
          <Text style={styles.cancelButtonText}>
            {adding ? 'Adding...' : 'Add to Cancellations List'}
          </Text>
        </TouchableOpacity>
      </View>

      <ReportButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  dogImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#cbd5e0', marginBottom: 15 },
  dogName: { fontSize: 22, fontWeight: 'bold', color: '#2d3748', marginBottom: 5 },
  breedText: { fontSize: 16, color: '#718096', marginBottom: 10 },
  notesText: { fontSize: 14, color: '#4a5568', textAlign: 'center', marginBottom: 15 },
  banner: { padding: 10, borderRadius: 6, width: '100%', marginBottom: 15, alignItems: 'center' },
  successBanner: { backgroundColor: '#c6f6d5', borderColor: '#9ae6b4', borderWidth: 1 },
  errorBanner: { backgroundColor: '#fed7d7', borderColor: '#feb2b2', borderWidth: 1 },
  bannerText: { color: '#22543d', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  cancelButton: { backgroundColor: '#3182ce', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, width: '100%', alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 30, fontSize: 15 }
});