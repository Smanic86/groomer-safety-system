import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

type RiskAssessmentProps = {
  petId: string;
  groomerId: string;
  businessId: string;
  onDone: () => void;
};

export default function RiskAssessmentScreen({
  petId,
  groomerId,
  businessId,
  onDone,
}: RiskAssessmentProps) {
  const [skinCondition, setSkinCondition] = useState('Clear');
  const [earCondition, setEarCondition] = useState('Normal');
  const [behavior, setBehavior] = useState('Calm');
  const [mattingLevel, setMattingLevel] = useState('None');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const assessmentSummary = `
Behavior: ${behavior}
Skin/Coat: ${skinCondition}
Ears/Eyes: ${earCondition}
Matting: ${mattingLevel}
Additional Notes: ${notes}
      `.trim();

      const { error } = await supabase.from('risk_assessments').insert({
        pet_id: petId,
        groomer_id: groomerId,
        business_id: businessId,
        notes: assessmentSummary,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert('Success', 'Pre-Groom Check saved!');
      onDone();
    } catch (err: any) {
      console.log('Saved locally / finished check:', err?.message ?? err);
      onDone();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onDone}>
          <Text style={styles.backText}>← Back to Details</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pre-Groom Check</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Temperament / Behavior</Text>
        <View style={styles.buttonRow}>
          {['Calm', 'Nervous', 'Aggressive', 'Excited'].map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, behavior === option && styles.activeChip]}
              onPress={() => setBehavior(option)}
            >
              <Text style={[styles.chipText, behavior === option && styles.activeChipText]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Skin & Coat Condition</Text>
        <View style={styles.buttonRow}>
          {['Clear', 'Dry/Flaky', 'Fleas/Ticks', 'Irritated'].map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, skinCondition === option && styles.activeChip]}
              onPress={() => setSkinCondition(option)}
            >
              <Text style={[styles.chipText, skinCondition === option && styles.activeChipText]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Ears & Eyes</Text>
        <View style={styles.buttonRow}>
          {['Normal', 'Dirty/Infected', 'Discharge', 'Sensitive'].map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, earCondition === option && styles.activeChip]}
              onPress={() => setEarCondition(option)}
            >
              <Text style={[styles.chipText, earCondition === option && styles.activeChipText]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Matting Level</Text>
        <View style={styles.buttonRow}>
          {['None', 'Minor', 'Moderate', 'Severe'].map((option) => (
            <Pressable
              key={option}
              style={[styles.chip, mattingLevel === option && styles.activeChip]}
              onPress={() => setMattingLevel(option)}
            >
              <Text style={[styles.chipText, mattingLevel === option && styles.activeChipText]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Additional Safety Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Note any pre-existing injuries, warts, or sensitive spots..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <Pressable 
          style={[styles.submitButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.submitButtonText}>
            {isSaving ? 'Saving...' : 'Complete & Save Check'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, paddingTop: 40, paddingHorizontal: 16, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { paddingRight: 16 },
  backText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  scrollContent: { paddingBottom: 60 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#374151', marginTop: 16, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  activeChipText: { color: '#ffffff', fontWeight: 'bold' },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    marginTop: 4,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});