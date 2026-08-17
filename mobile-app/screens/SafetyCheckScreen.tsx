import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import RiskAssessmentScreen from './RiskAssessmentScreen';
import IncidentReportScreen from './IncidentReportScreen';

type SafetyCheckProps = {
  pet?: any;
  onBack?: () => void;
  onStartAssessment?: () => void;
  onLogIncident?: () => void;
  groomerId?: string;
  businessId?: string;
};

export default function SafetyCheckScreen({
  pet,
  onBack,
  onStartAssessment,
  onLogIncident,
  groomerId = 'demo-groomer',
  businessId = 'default-business-id',
}: SafetyCheckProps) {
  const [internalMode, setInternalMode] = useState<'detail' | 'assessment' | 'incident'>('detail');

  const handleStartAssessment = () => {
    if (typeof onStartAssessment === 'function') {
      onStartAssessment();
    } else {
      setInternalMode('assessment');
    }
  };

  const handleLogIncident = () => {
    if (typeof onLogIncident === 'function') {
      onLogIncident();
    } else {
      setInternalMode('incident');
    }
  };

  if (internalMode === 'assessment') {
    return (
      <RiskAssessmentScreen
        petId={pet?.id ?? 'unknown-pet'}
        groomerId={groomerId}
        businessId={businessId}
        onDone={() => setInternalMode('detail')}
      />
    );
  }

  if (internalMode === 'incident') {
    return (
      <IncidentReportScreen
        petId={pet?.id ?? 'unknown-pet'}
        groomerId={groomerId}
        businessId={businessId}
        onDone={() => setInternalMode('detail')}
        onCancel={() => setInternalMode('detail')}
      />
    );
  }

  return (
    <View style={styles.outerContainer}>
      {onBack ? (
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.link}>← Back to list</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.petName}>{pet?.name ?? 'Pet Profile'}</Text>
        <Text style={styles.subText}>Breed: {pet?.breed ?? 'Unknown'}</Text>
        <Text style={styles.subText}>Owner: {pet?.clients?.full_name ?? 'Unknown'}</Text>
        {pet?.clients?.phone && <Text style={styles.subText}>Phone: {pet.clients.phone}</Text>}

        {pet?.trigger_flags && pet.trigger_flags.length > 0 && (
          <View style={styles.flagsBox}>
            <Text style={styles.flagsTitle}>Trigger Flags / Safety Warnings:</Text>
            {pet.trigger_flags.map((flag: string, index: number) => (
              <Text key={index} style={styles.flagItem}>• {flag}</Text>
            ))}
          </View>
        )}

        {pet?.vet_notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Vet Notes:</Text>
            <Text style={styles.notesText}>{pet.vet_notes}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleStartAssessment}
          >
            <Text style={styles.buttonText}>Start Pre-Groom Check</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.secondaryButton,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleLogIncident}
          >
            <Text style={styles.secondaryButtonText}>Log Incident</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, paddingTop: 40, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 60 },
  backButton: { paddingVertical: 10, marginBottom: 10, alignSelf: 'flex-start' },
  link: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  petName: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subText: { fontSize: 15, color: '#444', marginBottom: 4 },
  flagsBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 16 },
  flagsTitle: { color: '#991b1b', fontWeight: 'bold', marginBottom: 6 },
  flagItem: { color: '#991b1b', fontSize: 14, marginBottom: 2 },
  notesBox: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginTop: 12 },
  notesTitle: { fontWeight: 'bold', marginBottom: 4 },
  notesText: { color: '#374151' },
  actionsContainer: { marginTop: 28, gap: 12 },
  primaryButton: { 
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { 
    backgroundColor: '#fee2e2', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  secondaryButtonText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 16 },
});