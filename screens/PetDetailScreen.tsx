import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

/**
 * Groomer Safety Management System - Pet Detail & Vet Info Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function PetDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const petId = route.params?.petId;

  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  
  // Veterinarian fields
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [vetAddress, setVetAddress] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  async function fetchPetDetails() {
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', petId)
      .single();

    if (error) {
      Alert.alert('Error', 'Could not load pet details.');
    } else if (data) {
      setPetName(data.name || '');
      setBreed(data.breed || '');
      setOwnerName(data.owner_name || '');
      setOwnerPhone(data.owner_phone || '');
      setVetName(data.vet_name || '');
      setVetPhone(data.vet_phone || '');
      setVetAddress(data.vet_address || '');
    }
  }

  async function handleSave() {
    if (!petName.trim() || !ownerName.trim()) {
      Alert.alert('Missing Info', 'Please enter at least the pet name and owner name.');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: petName.trim(),
      breed: breed.trim(),
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      vet_name: vetName.trim(),
      vet_phone: vetPhone.trim(),
      vet_address: vetAddress.trim(),
    };

    let error;
    if (petId) {
      // Update existing record
      const res = await supabase.from('dogs').update(payload).eq('id', petId);
      error = res.error;
    } else {
      // Insert new record
      const res = await supabase.from('dogs').insert([payload]);
      error = res.error;
    }

    setIsSaving(false);

    if (error) {
      Alert.alert('Save Error', error.message);
    } else {
      Alert.alert('Success', 'Pet and veterinary details saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Schedule</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{petId ? 'Edit Pet & Vet Profile' : 'Add New Pet Profile'}</Text>

      <View style={styles.formContainer}>
        <Text style={styles.sectionHeader}>Client & Pet Information</Text>

        <Text style={styles.label}>Pet Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Buster..."
          placeholderTextColor="#a0aec0"
          value={petName}
          onChangeText={setPetName}
        />

        <Text style={styles.label}>Breed / Description:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Cocker Spaniel..."
          placeholderTextColor="#a0aec0"
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Owner Full Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Jane Doe..."
          placeholderTextColor="#a0aec0"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <Text style={styles.label}>Owner Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 07123456789..."
          placeholderTextColor="#a0aec0"
          keyboardType="phone-pad"
          value={ownerPhone}
          onChangeText={setOwnerPhone}
        />

        <Text style={[styles.sectionHeader, { marginTop: 15 }]}>Veterinary Emergency Details</Text>

        <Text style={styles.label}>Vet Practice Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Oak Tree Veterinary Surgery..."
          placeholderTextColor="#a0aec0"
          value={vetName}
          onChangeText={setVetName}
        />

        <Text style={styles.label}>Vet Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 01744123456..."
          placeholderTextColor="#a0aec0"
          keyboardType="phone-pad"
          value={vetPhone}
          onChangeText={setVetPhone}
        />

        <Text style={styles.label}>Vet Clinic Address:</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="Enter surgery address..."
          placeholderTextColor="#a0aec0"
          multiline
          value={vetAddress}
          onChangeText={setVetAddress}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSaving && { opacity: 0.6 }]} 
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSaving ? 'Saving Profile...' : 'Save Pet Profile'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, marginBottom: 40 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#2d3748', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  submitButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6, marginTop: 10 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});