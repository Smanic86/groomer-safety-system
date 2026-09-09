import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

type ReportProblemScreenProps = {
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
    backgroundColor: '#dd6b20', 
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

export default function ReportProblemScreen({ navigation, businessId, onSuccess }: ReportProblemScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReportProblem() {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please enter a title and description of the problem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('maintenance_issues').insert([
      {
        title: title,
        description: description,
        status: 'open',
        business_id: businessId || null
      }
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('Error submitting report', error.message);
    } else {
      Alert.alert('Success', 'Problem reported successfully.');
      setTitle('');
      setDescription('');
      if (onSuccess) onSuccess();
      if (navigation && navigation.goBack) navigation.goBack();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack ? navigation.goBack() : null}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Report Equipment / Facility Problem</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Issue Title / Equipment Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g., Grooming Table 2 Hydraulic Leak" 
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Problem Description</Text>
        <TextInput 
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]} 
          placeholder="Describe the issue in detail..." 
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.button} onPress={handleReportProblem} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Maintenance Report'}</Text>
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