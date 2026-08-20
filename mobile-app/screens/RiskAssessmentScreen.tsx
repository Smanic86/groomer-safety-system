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
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function RiskAssessmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const petId = route?.params?.petId;

  const [temperament, setTemperament] = useState<string>('Calm');
  const [skinCondition, setSkinCondition] = useState<string>('Clear');
  const [earsEyes, setEarsEyes] = useState<string>('Normal');
  const [mattingLevel, setMattingLevel] = useState<string>('None');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('PetDetailScreen', { petId });
    }
  };

  const handleSave = async () => {
    if (!petId) {
      Alert.alert('Error', 'No pet selected for risk assessment.');
      return;
    }

    setSaving(true);
    try {
      const formattedNotes = `Ears/Eyes: ${earsEyes} | Notes: ${notes}`.trim();

      const { error } = await supabase.from('risk_assessments').upsert({
        pet_id: petId,
        temperament_rating: temperament,
        skin_condition: skinCondition,
        matting_level: mattingLevel,
        notes: formattedNotes,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert('Success', 'Pre-groom check saved successfully!', [
        { text: 'OK', onPress: () => handleGoBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Save Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
            <Text style={styles.backBtnText}>← Back to Details</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pre-Groom Check</Text>
        </View>

        <Text style={styles.sectionTitle}>Temperament / Behavior</Text>
        <View style={styles.chipGroup}>
          {['Calm', 'Nervous', 'Aggressive', 'Excited'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, temperament === option && styles.chipActive]}
              onPress={() => setTemperament(option)}
            >
              <Text style={[styles.chipText, temperament === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Skin & Coat Condition</Text>
        <View style={styles.chipGroup}>
          {['Clear', 'Dry/Flaky', 'Fleas/Ticks', 'Irritated'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, skinCondition === option && styles.chipActive]}
              onPress={() => setSkinCondition(option)}
            >
              <Text style={[styles.chipText, skinCondition === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ears & Eyes</Text>
        <View style={styles.chipGroup}>
          {['Normal', 'Dirty/Infected', 'Discharge', 'Sensitive'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, earsEyes === option && styles.chipActive]}
              onPress={() => setEarsEyes(option)}
            >
              <Text style={[styles.chipText, earsEyes === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Matting Level</Text>
        <View style={styles.chipGroup}>
          {['None', 'Minor', 'Moderate', 'Severe'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, mattingLevel === option && styles.chipActive]}
              onPress={() => setMattingLevel(option)}
            >
              <Text style={[styles.chipText, mattingLevel === option && styles.chipTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Additional Safety Notes</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Note any pre-existing injuries, warts, or sensitive spots..."
          placeholderTextColor="#94a3b8"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Complete & Save Check</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  backBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 8 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#ffffff', fontWeight: '700' },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});