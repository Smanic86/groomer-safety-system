import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ReportButton from '../components/ReportButton';

export default function DashboardScreen({ route, navigation }: { navigation: any; route: any }) {
  const salonName = route?.params?.salonName || 'St Helens Salon';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.salonTitle}>{salonName}</Text>
        <Text style={styles.subTitle}>Dashboard & Safety Management</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DogProfiles')}>
          <Text style={styles.cardTitle}>🐶 Dog Profiles & Triggers</Text>
          <Text style={styles.cardDesc}>View, add, and manage shared dog behavioral notes.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Staff')}>
          <Text style={styles.cardTitle}>👥 Staff Members</Text>
          <Text style={styles.cardDesc}>Manage local staff rosters and secure contact details.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Schedule')}>
          <Text style={styles.cardTitle}>📅 Staff Rota & Schedule</Text>
          <Text style={styles.cardDesc}>View working hours, shifts, and weekly salon rotas.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SafetyCheck')}>
          <Text style={styles.cardTitle}>⚠️ Safety Pre-Check</Text>
          <Text style={styles.cardDesc}>Run quick risk evaluations before grooming sessions.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Incidents')}>
          <Text style={styles.cardTitle}>🚨 Incident Reports</Text>
          <Text style={styles.cardDesc}>Log and track safety events securely.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System
        </Text>
      </View>

      <ReportButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  contentContainer: { paddingBottom: 80 },
  headerContainer: { marginBottom: 25, marginTop: 10 },
  salonTitle: { fontSize: 24, fontWeight: 'bold', color: '#2b6cb0' },
  subTitle: { fontSize: 16, color: '#4a5568', marginTop: 4 },
  menuGrid: { gap: 15 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a202c', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#4a5568' },
  copyrightContainer: { marginTop: 40, marginBottom: 20, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' }
});