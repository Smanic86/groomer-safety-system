import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';

export default function IncidentReportScreen({ route, navigation }: any) {
  const { petId, petName } = route.params || {};

  const [severity, setSeverity] = useState<'low' | 'moderate' | 'high' | 'severe'>('low');
  const [biteOccurred, setBiteOccurred] = useState(false);
  const [biteLocation, setBiteLocation] = useState('');
  const [medicalAttentionRequired, setMedicalAttentionRequired] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Helper function to compress image before state storage / upload
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      return uri; // Fallback to original URI if compression fails
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setImageUri(compressedUri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setImageUri(compressedUri);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description of the incident.');
      return;
    }

    try {
      setUploading(true);
      let uploadedImageUrl: string | null = null;

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('incident-photos')
          .getPublicUrl(uploadData.path);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const { data: userResponse } = await supabase.auth.getUser();
      const userId = userResponse.user?.id;

      const { error: insertError } = await supabase.from('incident_reports').insert([
        {
          pet_id: petId,
          reporter_id: userId,
          severity,
          bite_occurred: biteOccurred,
          bite_location: biteOccurred ? biteLocation : null,
          medical_attention_required: medicalAttentionRequired,
          description,
          image_urls: uploadedImageUrl ? [uploadedImageUrl] : [],
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      Alert.alert('Success', 'Incident report logged successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit incident report.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Log Incident — {petName || 'Pet'}</Text>

      <Text style={styles.label}>Severity Level</Text>
      <View style={styles.chipRow}>
        {(['low', 'moderate', 'high', 'severe'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.chip, severity === level && styles.chipSelected]}
            onPress={() => setSeverity(level)}
          >
            <Text style={[styles.chipText, severity === level && styles.chipTextSelected]}>
              {level.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setBiteOccurred(!biteOccurred)}
      >
        <Text style={styles.toggleLabel}>Bite Occurred?</Text>
        <Text style={styles.toggleValue}>{biteOccurred ? 'YES' : 'NO'}</Text>
      </TouchableOpacity>

      {biteOccurred && (
        <View>
          <Text style={styles.label}>Bite Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Left hand, Right forearm"
            value={biteLocation}
            onChangeText={setBiteLocation}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setMedicalAttentionRequired(!medicalAttentionRequired)}
      >
        <Text style={styles.toggleLabel}>Medical Attention Required?</Text>
        <Text style={styles.toggleValue}>{medicalAttentionRequired ? 'YES' : 'NO'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what happened..."
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Attach Photo</Text>
      <View style={styles.photoButtonRow}>
        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
          <Text style={styles.photoButtonText}>Choose Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Incident Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  chipSelected: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#fff' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  toggleValue: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  photoButtonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: { color: '#374151', fontWeight: '600' },
  imagePreviewContainer: { marginTop: 12, alignItems: 'center' },
  imagePreview: { width: 200, height: 200, borderRadius: 8 },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});