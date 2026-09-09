import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

/**
 * Groomer Safety System - Log Incident Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

const SEVERITY_LEVELS = ['Low (Caution)', 'Medium (Warning)', 'High (Aggression/Bite Risk)'];
const TRIGGERS = [
  'Muzzle Sensitivity',
  'Handling Hind Quarters / Paws',
  'Dryer Noise / Air Velocity',
  'Nail Clipping Resistance',
  'Separation / Table Anxiety'
];

export default function LogIncidentScreen() {
  const navigation = useNavigation<any>();
  const [dogList, setDogList] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pastIncidents, setPastIncidents] = useState<any[]>([]);
  
  const [selectedDog, setSelectedDog] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [severity, setSeverity] = useState(SEVERITY_LEVELS[0]);
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDogs();
    fetchStaff();
    fetchPastIncidents();
  }, []);

  async function fetchDogs() {
    const { data, error } = await supabase.from('dog_profiles').select('*');
    if (error) console.log('Error fetching dogs:', error.message);
    else if (data) setDogList(data);
  }

  async function fetchStaff() {
    const { data, error } = await supabase.from('staff_members').select('*');
    if (error) console.log('Error fetching staff:', error.message);
    else if (data) setStaffList(data);
  }

  async function fetchPastIncidents() {
    const { data, error } = await supabase.from('incident_reports').select('*').order('date', { ascending: false });
    if (error) console.log('Error fetching incidents:', error.message);
    else if (data) setPastIncidents(data);
  }

  async function handleSaveIncident() {
    if (!selectedDog || !selectedStaff || !notes.trim()) {
      Alert.alert('Missing Fields', 'Please select a dog, staff member, and provide incident notes.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.from('incident_reports').insert([
      {
        dog_name: selectedDog,
        staff_name: selectedStaff,
        severity: severity,
        behavioral_trigger: trigger,
        notes: notes.trim(),
        date: new Date().toISOString()
      }
    ]).select();

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to save incident report: ' + error.message);
    } else {
      if (data) {
        setPastIncidents(prev => [data[0], ...prev]);
      }
      Alert.alert('Success', 'Incident logged successfully.');
      setNotes('');
      setSelectedDog('');
    }
  }

  async function handleDeleteIncident(id: any) {
    const { error } = await supabase.from('incident_reports').delete().eq('id', id);
    if (!error) {
      setPastIncidents(pastIncidents.filter(item => item.id !== id));
    } else {
      Alert.alert('Error', 'Could not delete incident report.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Log Safety & Behavior Incident</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Select Dog Profile:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {dogList.map((dog) => (
            <TouchableOpacity
              key={dog.id}
              style={[styles.chip, selectedDog === dog.name && styles.selectedChip]}
              onPress={() => setSelectedDog(dog.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedDog === dog.name && styles.selectedChipText]}>
                🐶 {dog.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Groomer / Staff Involved:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {staffList.map((staff) => (
            <TouchableOpacity
              key={staff.id}
              style={[styles.chip, selectedStaff === staff.name && styles.selectedChip]}
              onPress={() => setSelectedStaff(staff.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedStaff === staff.name && styles.selectedChipText]}>
                👤 {staff.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Severity Level:</Text>
        <View style={styles.verticalGroup}>
          {SEVERITY_LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.optionRow, severity === lvl && styles.selectedOptionRow]}
              onPress={() => setSeverity(lvl)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, severity === lvl && styles.selectedOptionText]}>{lvl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Primary Behavioral Trigger:</Text>
        <View style={styles.verticalGroup}>
          {TRIGGERS.map((trg) => (
            <TouchableOpacity
              key={trg}
              style={[styles.optionRow, trigger === trg && styles.selectedOptionRow]}
              onPress={() => setTrigger(trg)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, trigger === trg && styles.selectedOptionText]}>{trg}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Incident Details & Notes:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe what happened, handling techniques used, or precautions needed next time..."
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
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving Report...' : 'Submit Incident Report'}</Text>
        </TouchableOpacity>
      </View>

      {/* Past Incidents List Section */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Recorded Incidents History</Text>
        {pastIncidents.length === 0 ? (
          <Text style={styles.emptyText}>No safety incidents logged yet.</Text>
        ) : (
          pastIncidents.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>🐶 {item.dog_name} — <Text style={{ color: '#e53e3e' }}>{item.severity}</Text></Text>
                <Text style={styles.subText}>Trigger: {item.behavioral_trigger || 'General'} | Staff: {item.staff_name}</Text>
                <Text style={styles.notesText}>"{item.notes}"</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteIncident(item.id)} activeOpacity={0.7}>
                <Text style={styles.removeText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  chipRow: { flexDirection: 'row', marginBottom: 5 },
  chip: { backgroundColor: '#edf2f7', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e0', marginRight: 8 },
  selectedChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { color: '#4a5568', fontSize: 13, fontWeight: '500' },
  selectedChipText: { color: '#fff' },
  verticalGroup: { gap: 6 },
  optionRow: { padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e0', backgroundColor: '#f8fafc' },
  selectedOptionRow: { backgroundColor: '#ebf8ff', borderColor: '#3182ce' },
  optionText: { fontSize: 13, color: '#4a5568', fontWeight: '500' },
  selectedOptionText: { color: '#2b6cb0', fontWeight: 'bold' },
  textArea: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c', textAlignVertical: 'top', height: 100 },
  submitButton: { backgroundColor: '#e53e3e', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  rowText: { fontSize: 15, color: '#2d3748', fontWeight: '600' },
  subText: { fontSize: 13, color: '#4a5568', marginTop: 3 },
  notesText: { fontSize: 13, color: '#4a5568', fontStyle: 'italic', marginTop: 4 },
  dateText: { fontSize: 11, color: '#a0aec0', marginTop: 4 },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 15, fontSize: 15 }
});