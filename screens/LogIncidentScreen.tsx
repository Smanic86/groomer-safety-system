import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const BEHAVIORAL_TRIGGERS = [
  'Paw Handling / Nails',
  'Facial Trimming / Clippers',
  'Dryer Noise / Air',
  'Muzzle / Restraint',
  'Bath / Water Sensitivity',
  'General Touch'
];

export default function LogIncidentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { dogName: initialDogName } = route.params || {};

  const [dogName, setDogName] = useState(initialDogName || '');
  const [staffName, setStaffName] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [trigger, setTrigger] = useState(BEHAVIORAL_TRIGGERS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSaveIncident() {
    if (!dogName.trim() || !staffName.trim() || !notes.trim()) {
      Alert.alert('Missing Fields', 'Please fill in the dog name, staff name, and description notes.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('incident_reports').insert([
      {
        dog_name: dogName.trim(),
        staff_name: staffName.trim(),
        severity: severity,
        behavioral_trigger: trigger,
        notes: notes.trim(),
        date: new Date().toISOString()
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.log('Error saving incident:', error.message);
      Alert.alert('Database Error', 'Could not save the incident report. Check logs.');
    } else {
      Alert.alert('Success', 'Safety incident logged successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>⚠️ Log Safety or Behavior Incident</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Dog Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter dog's name..."
          placeholderTextColor="#a0aec0"
          value={dogName}
          onChangeText={setDogName}
        />

        <Text style={styles.label}>Staff Member Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name..."
          placeholderTextColor="#a0aec0"
          value={staffName}
          onChangeText={setStaffName}
        />

        <Text style={styles.label}>Severity Level:</Text>
        <View style={styles.chipsContainer}>
          {SEVERITY_LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.chip, severity === lvl && styles.selectedChip]}
              onPress={() => setSeverity(lvl)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, severity === lvl && styles.selectedChipText]}>{lvl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Behavioral Trigger:</Text>
        <View style={styles.chipsContainer}>
          {BEHAVIORAL_TRIGGERS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, trigger === t && styles.selectedChip]}
              onPress={() => setTrigger(t)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, trigger === t && styles.selectedChipText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Incident Details & Notes:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what happened during the grooming session..."
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleSaveIncident}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving...' : 'Save Incident Report'}</Text>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 12, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  textArea: { height: 90, textAlignVertical: 'top' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#edf2f7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e0' },
  selectedChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { color: '#4a5568', fontSize: 13, fontWeight: '500' },
  selectedChipText: { color: '#fff' },
  submitButton: { backgroundColor: '#e53e3e', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6, marginTop: 5 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});