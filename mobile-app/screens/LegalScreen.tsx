import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ReportButton from '../components/ReportButton';

type LegalScreenProps = {
  navigation: any;
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5',
    position: 'relative'
  },
  contentContainer: {
    paddingBottom: 80
  },
  backButton: { 
    marginBottom: 10 
  },
  backText: { 
    color: '#3182ce', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1a202c', 
    marginBottom: 15 
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 15,
    marginBottom: 5
  },
  body: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 22
  },
  copyrightContainer: { 
    marginTop: 30, 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  copyrightText: { 
    fontSize: 12, 
    color: '#9ca3af', 
    textAlign: 'center' 
  }
});

export default function LegalScreen({ navigation }: LegalScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack ? navigation.goBack() : null}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Legal & Privacy Policy</Text>

      <View style={styles.card}>
        <Text style={styles.subHeader}>Terms of Service</Text>
        <Text style={styles.body}>
          By using the Groomer Safety System, you agree to adhere to all workplace safety protocols, accurately log pre-groom assessments, and maintain confidentiality regarding client and pet safety records.
        </Text>

        <Text style={styles.subHeader}>Data Privacy</Text>
        <Text style={styles.body}>
          All data including staff profiles, dog behavior notes, and incident reports are securely stored and encrypted via Supabase in compliance with applicable data protection guidelines.
        </Text>
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