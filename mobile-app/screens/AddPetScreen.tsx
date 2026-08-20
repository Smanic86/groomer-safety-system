/**
 * Copyright (c) 2026. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function AddPetScreen() {
  const navigation: any = useNavigation();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [postcode, setPostcode] = useState('');
  const [ownerPrivacy, setOwnerPrivacy] = useState('🔒 Protected');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSavePet = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a dog name.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('pets').insert([
        {
          name: name.trim(),
          breed: breed.trim(),
          postcode: postcode.trim(),
          owner_privacy: ownerPrivacy,
          image_url: imageUri, // Stores local URI or can be adapted for Supabase storage URL
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Dog profile added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Could not add dog: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🐾 Add New Dog Profile</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Dog Photo</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.imagePickerText}>📷 Tap to select photo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Dog Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Buster"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Cocker Spaniel"
            placeholderTextColor="#94a3b8"
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={styles.label}>Area / Postcode</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. SW1A"
            placeholderTextColor="#94a3b8"
            value={postcode}
            onChangeText={setPostcode}
          />

          <Text style={styles.label}>Owner Privacy / Contact Note</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 🔒 Protected"
            placeholderTextColor="#94a3b8"
            value={ownerPrivacy}
            onChangeText={setOwnerPrivacy}
          />

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSavePet}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Dog Profile'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 12 },
  imagePickerBtn: {
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  previewImage: { width: '100%', height: '100%' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});