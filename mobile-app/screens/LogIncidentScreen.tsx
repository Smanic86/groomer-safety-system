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
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

export default function LogIncidentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams: any = route?.params || {};

  const petId = routeParams.petId;
  const petName = routeParams.petName || 'Unknown Pet';
  const breed = routeParams.breed || 'Unknown Breed';
  const businessId = routeParams.businessId;

  const [severity, setSeverity] = useState<string>('MEDIUM');
  const [description, setDescription] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleBack = () => {
    if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to attach photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('incident-photos')
        .upload(filePath, blob);

      if (uploadError) {
        console.warn('Bucket upload failed:', uploadError.message);
        return null; 
      }

      const { data } = supabase.storage.from('incident-photos').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.warn('Image upload error:', err.message);
      return null;
    }
  };

  const generateAndSharePDF = async (incidentData: {
    severity: string;
    description: string;
    actionTaken: string;
    localImageUri: string | null;
    date: string;
  }) => {
    try {
      let imageBase64Html = '';
      if (incidentData.localImageUri) {
        const base64 = await FileSystem.readAsStringAsync(incidentData.localImageUri, {
          encoding: 'base64',
        });
        imageBase64Html = `
          <div class="section">
            <div class="label">Incident Photo</div>
            <img class="incident-img" src="data:image/jpeg;base64,${base64}" />
          </div>
        `;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
              h1 { color: #b91c1c; font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              .meta { background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
              .badge { display: inline-block; background: #fef3c7; color: #b45309; padding: 4px 10px; font-weight: bold; border-radius: 6px; }
              .section { margin-bottom: 16px; }
              .label { font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase; }
              .value { font-size: 14px; color: #0f172a; margin-top: 4px; }
              .incident-img { max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 8px; border: 1px solid #cbd5e1; object-fit: contain; }
            </style>
          </head>
          <body>
            <h1>🚨 Safety Incident Report</h1>
            <div class="meta">
              <p><strong>Pet:</strong> ${petName} (${breed})</p>
              <p><strong>Date Logged:</strong> ${incidentData.date}</p>
              <p><strong>Severity:</strong> <span class="badge">${incidentData.severity}</span></p>
            </div>
            <div class="section">
              <div class="label">What Happened</div>
              <div class="value">${incidentData.description}</div>
            </div>
            <div class="section">
              <div class="label">Action Taken</div>
              <div class="value">${incidentData.actionTaken || 'None specified'}</div>
            </div>
            ${imageBase64Html}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Incident Report PDF' });
      }
    } catch (err: any) {
      console.error('PDF generation error:', err);
      Alert.alert('PDF Error', err?.message || 'Failed to generate PDF document.');
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please describe what happened before saving.');
      return;
    }

    if (!petId) {
      Alert.alert('Error', 'Missing pet record reference. Cannot save incident.');
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl = null;
      if (imageUri) {
        photoUrl = await uploadImageToSupabase(imageUri);
      }

      const currentDate = new Date().toISOString();

      const insertPayload: any = {
        pet_id: petId,
        severity: severity.toUpperCase(),
        description: description.trim(),
        created_at: currentDate,
      };

      if (businessId) insertPayload.business_id = businessId;
      if (actionTaken.trim()) insertPayload.action_taken = actionTaken.trim();
      if (photoUrl) insertPayload.photo_url = photoUrl;

      const { error } = await supabase.from('incidents').insert([insertPayload]);
      if (error) throw error;

      await generateAndSharePDF({
        severity: severity.toUpperCase(),
        description: description.trim(),
        actionTaken: actionTaken.trim(),
        localImageUri: imageUri,
        date: new Date().toLocaleDateString('en-GB'),
      });

      Alert.alert('Success', 'Incident logged and PDF report generated successfully.', [
        {
          text: 'OK',
          onPress: () => {
            if (navigation.canGoBack?.()) {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save incident: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>🚨 Log Safety Incident</Text>
          <Text style={styles.petSubtitle}>
            Pet: {petName} ({breed})
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.severityRow}>
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.severityBtn,
                  severity === lvl && styles.severityBtnSelected,
                ]}
                onPress={() => setSeverity(lvl)}
              >
                <Text
                  style={[
                    styles.severityText,
                    severity === lvl && styles.severityTextSelected,
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>What Happened? *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Attempted to bite when drying rear legs, displayed sudden body stiffness..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Action Taken</Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g. Applied soft muzzle, paused session for 5 mins, switched to hand drying..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={actionTaken}
            onChangeText={setActionTaken}
          />

          <Text style={styles.label}>Attach Incident Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoPickerBtn} onPress={pickImage}>
            <Text style={styles.photoPickerText}>
              {imageUri ? '📷 Change Photo' : '📷 Select Photo from Library'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setImageUri(null)}>
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleBack}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={submitting}
          >
            <Text style={styles.saveBtnText}>
              {submitting ? 'Saving & Generating...' : 'Save & Generate PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  headerContainer: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  petSubtitle: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 10 },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  severityBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', backgroundColor: '#f8fafc' },
  severityBtnSelected: { backgroundColor: '#fef3c7', borderColor: '#b45309' },
  severityText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  severityTextSelected: { color: '#b45309', fontWeight: '800' },
  textArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 13, color: '#0f172a', textAlignVertical: 'top', minHeight: 90 },
  photoPickerBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  photoPickerText: { fontSize: 13, fontWeight: '600', color: '#0284c7' },
  previewContainer: { marginTop: 10, alignItems: 'center' },
  previewImage: { width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover' },
  removePhotoText: { color: '#b91c1c', fontSize: 12, fontWeight: '700', marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: '#b91c1c', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});