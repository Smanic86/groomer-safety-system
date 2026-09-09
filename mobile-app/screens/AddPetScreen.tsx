import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

/**
 * Groomer Safety System - Add Dog & Owner Profile Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function AddPetScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSaveDog() {
    if (!name.trim() || !ownerName.trim()) {
      Alert.alert('Missing Fields', 'Please provide at least the dog name and owner name.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('dog_profiles').insert([
      {
        name: name.trim(),
        breed: breed.trim() || 'Unknown',
        age: age.trim() ? parseInt(age.trim(), 10) : null,
        owner_name: ownerName.trim(),
        owner_phone: ownerPhone.trim() || 'No phone',
        notes: notes.trim()
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to save dog profile: ' + error.message);
    } else {
      Alert.alert('Success', 'Dog profile registered successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Register New Dog & Client</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Dog's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Buster"
          placeholderTextColor="#a0aec0"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Breed:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Shih Tzu / Poodle Cross"
          placeholderTextColor="#a0aec0"
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Age (Years):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 3"
          placeholderTextColor="#a0aec0"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Owner's Full Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Jane Doe"
          placeholderTextColor="#a0aec0"
          value={ownerName}
          onChangeText={setOwnerName}
        />

        <Text style={styles.label}>Owner's Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 07123 456789"
          placeholderTextColor="#a0aec0"
          keyboardType="phone-pad"
          value={ownerPhone}
          onChangeText={setOwnerPhone}
        />

        <Text style={styles.label}>General Care & Handling Notes:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any specific behavioral quirks, medical notes, or preferences..."
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleSaveDog}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving Profile...' : 'Save Dog Profile'}</Text>
        </TouchableOpacity>
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
  textArea: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c', textAlignVertical: 'top', height: 100 },
  submitButton: { backgroundColor: '#3182ce', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});