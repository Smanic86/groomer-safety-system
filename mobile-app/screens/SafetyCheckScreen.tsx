import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

type SafetyCheckProps = {
  pet: any;
  groomerId: string;
  businessId: string;
  onBack: () => void;
  onStartAssessment: () => void;
  onLogIncident: () => void;
};

export default function SafetyCheckScreen({
  pet,
  onBack,
  onStartAssessment,
  onLogIncident,
}: SafetyCheckProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button title="← Back to Pets" onPress={onBack} />
      </View>

      <Text style={styles.title}>{pet.name}</Text>
      <Text style={styles.subtitle}>Breed: {pet.breed ?? 'Unknown'}</Text>
      <Text style={styles.subtitle}>
        Temperament: {pet.temperament_rating ?? 'Standard'}
      </Text>

      {/* Trigger Flags */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ Safety & Trigger Flags</Text>
        {pet.trigger_flags && pet.trigger_flags.length > 0 ? (
          pet.trigger_flags.map((flag: string, index: number) => (
            <Text key={index} style={styles.flagItem}>
              • {flag.replace('_', ' ')}
            </Text>
          ))
        ) : (
          <Text style={styles.noneText}>No active trigger flags</Text>
        )}
      </View>

      {/* Vet Notes */}
      {pet.vet_notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Vet & Groomer Notes</Text>
          <Text style={styles.notesText}>{pet.vet_notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <View style={styles.btnSpacing}>
          <Button title="Start Risk Assessment" onPress={onStartAssessment} color="#2563eb" />
        </View>
        <View style={styles.btnSpacing}>
          <Button title="Log Safety Incident" onPress={onLogIncident} color="#dc2626" />
        </View>
      </View>

      {/* Copyright Notice */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  header: { alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#4b5563', marginBottom: 4 },
  card: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  flagItem: { fontSize: 14, color: '#b91c1c', fontWeight: '500', marginVertical: 2 },
  noneText: { fontSize: 14, color: '#6b7280' },
  notesText: { fontSize: 14, color: '#1f2937' },
  buttonGroup: { marginTop: 20, marginBottom: 20 },
  btnSpacing: { marginVertical: 6 },
  copyrightContainer: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});