import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

/**
 * Groomer Safety System - Pet Detail & Incident History Screen
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

export default function PetDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { dogId, dog: passedDog } = route.params || {};

  const [dog, setDog] = useState<any>(passedDog || null);
  const [loadingDog, setLoadingDog] = useState(!passedDog && !!dogId);
  const [dogIncidents, setDogIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  useEffect(() => {
    if (!passedDog && dogId) {
      fetchDogDetails(dogId);
    }
  }, [dogId, passedDog]);

  useEffect(() => {
    if (dog?.name) {
      fetchDogIncidents(dog.name);
    }
  }, [dog]);

  async function fetchDogDetails(id: string) {
    setLoadingDog(true);
    const { data, error } = await supabase
      .from('dog_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('Error fetching dog details:', error.message);
    } else if (data) {
      setDog(data);
    }
    setLoadingDog(false);
  }

  async function fetchDogIncidents(dogName: string) {
    setLoadingIncidents(true);
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('dog_name', dogName)
      .order('date', { ascending: false });

    if (error) {
      console.log('Error fetching dog incidents:', error.message);
    } else if (data) {
      setDogIncidents(data);
    }
    setLoadingIncidents(false);
  }

  if (loadingDog) {
    return (
      <View style={styles.container}>
        <Text style={styles.subText}>Loading dog profile...</Text>
      </View>
    );
  }

  if (!dog) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No dog profile selected.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Profiles</Text>
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <Text style={styles.dogName}>🐶 {dog.name}</Text>
        <Text style={styles.dogMeta}>Breed: {dog.breed || 'Unknown'} | Age: {dog.age || 'N/A'} yrs</Text>
        <Text style={styles.dogMeta}>Owner: {dog.owner_name || 'N/A'} ({dog.owner_phone || 'No phone'})</Text>
        <Text style={styles.dogMeta}>Postcode: {dog.postcode || 'N/A'}</Text>

        <View style={styles.notesSection}>
          <Text style={styles.notesHeader}>📋 Grooming & Care Notes</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesContent}>
              {dog.notes || dog.grooming_notes || 'No specific care notes added for this dog yet.'}
            </Text>
          </View>
        </View>

        {dog.temperament ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesHeader}>⚡ Temperament & Handling</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesContent}>{dog.temperament}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>⚠️ Safety & Behavior Incident History</Text>
        <TouchableOpacity 
          style={styles.logButton} 
          onPress={() => navigation.navigate('LogIncident', { dogName: dog.name })}
          activeOpacity={0.7}
        >
          <Text style={styles.logButtonText}>+ Log New</Text>
        </TouchableOpacity>
      </View>

      {loadingIncidents ? (
        <Text style={styles.subText}>Loading incident history...</Text>
      ) : dogIncidents.length === 0 ? (
        <View style={styles.safeBanner}>
          <Text style={styles.safeBannerText}>✅ No safety incidents recorded for {dog.name}. Safe to groom!</Text>
        </View>
      ) : (
        dogIncidents.map((incident) => (
          <View key={incident.id} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <Text style={styles.severityBadge}>{incident.severity}</Text>
              <Text style={styles.dateText}>{new Date(incident.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.triggerText}>Trigger: {incident.behavioral_trigger || 'General Handling'}</Text>
            <Text style={styles.incidentNotes}>"{incident.notes}"</Text>
            <Text style={styles.staffText}>Logged by: {incident.staff_name}</Text>
          </View>
        ))
      )}

      <ReportButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 14, color: '#e53e3e', marginBottom: 15, fontWeight: '600' },
  profileCard: { backgroundColor: '#fff', padding: 18, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, gap: 6 },
  dogName: { fontSize: 22, fontWeight: 'bold', color: '#1a202c' },
  dogMeta: { fontSize: 14, color: '#4a5568' },
  notesSection: { marginTop: 10 },
  notesHeader: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  notesBox: { backgroundColor: '#f7fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#edf2f7' },
  notesContent: { fontSize: 13, color: '#4a5568', lineHeight: 18 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  logButton: { backgroundColor: '#3182ce', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  logButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  subText: { textAlign: 'center', color: '#718096', marginVertical: 10 },
  safeBanner: { backgroundColor: '#f0fff4', borderColor: '#c6f6d5', borderWidth: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  safeBannerText: { color: '#22543d', fontWeight: '600', fontSize: 14 },
  incidentCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#e53e3e', gap: 6 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  severityBadge: { color: '#e53e3e', fontWeight: 'bold', fontSize: 13 },
  dateText: { fontSize: 12, color: '#a0aec0' },
  triggerText: { fontSize: 13, fontWeight: '600', color: '#2d3748' },
  incidentNotes: { fontSize: 13, color: '#4a5568', fontStyle: 'italic' },
  staffText: { fontSize: 11, color: '#718096', marginTop: 2 }
});