import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

type AccidentReportScreenProps = {
  navigation: any;
  businessId?: string;
  onSuccess?: () => void;
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
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1a202c', 
    marginBottom: 15 
  },
  form: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#4a5568', 
    marginTop: 10, 
    marginBottom: 5 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#cbd5e0', 
    borderRadius: 6, 
    padding: 10, 
    fontSize: 14, 
    backgroundColor: '#fff' 
  },
  button: { 
    backgroundColor: '#e53e3e', 
    padding: 12, 
    borderRadius: 6, 
    alignItems: 'center', 
    marginTop: 20 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
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

export default function AccidentReportScreen({ navigation, businessId, onSuccess }: AccidentReportScreenProps) {
  const [dogName, setDogName] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReportAccident() {
    if (!dogName.trim() || !incidentDetails.trim()) {
      Alert.alert('Error', 'Please fill in the dog name and incident details.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('incidents').insert([
      {
        dog_name: dogName,
        details: incidentDetails,
        actions_taken: actionsTaken,
        type: 'accident',
        business_id: businessId || null
      }
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error submitting report', error.message);
    } else {
      Alert.alert('Success', 'Accident report logged successfully.');
      setDogName('');
      setIncidentDetails('');
      setActionsTaken('');
      if (onSuccess) onSuccess();
      if (navigation && navigation.goBack) navigation.goBack();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack ? navigation.goBack() : null}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>File Accident Report</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Dog Name / ID</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter dog name" 
          value={dogName}
          onChangeText={setDogName}
        />

        <Text style={styles.label}>Incident Details</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          placeholder="Describe what happened..." 
          multiline
          value={incidentDetails}
          onChangeText={setIncidentDetails}
        />

        <Text style={styles.label}>Actions Taken / First Aid</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          placeholder="First aid administered, vet contacted..." 
          multiline
          value={actionsTaken}
          onChangeText={setActionsTaken}
        />

        <TouchableOpacity style={styles.button} onPress={handleReportAccident} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Accident Report'}</Text>
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