import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ReportBugScreen() {
  const navigation = useNavigation<any>();
  const [featureArea, setFeatureArea] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmitBug() {
    if (!featureArea.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please tell us what screen or feature has a bug and describe what happened.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('bug_reports').insert([
      {
        feature_area: featureArea.trim(),
        description: description.trim(),
        status: 'Open',
        date: new Date().toISOString()
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.log('Error reporting bug:', error.message);
      Alert.alert('Submission Error', 'Could not send bug report. Please try again.');
    } else {
      Alert.alert('Thank You', 'Bug report submitted successfully to development.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🐞 Report App Bug or Issue</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Feature or Screen Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Schedule Screen, Pet Details..."
          placeholderTextColor="#a0aec0"
          value={featureArea}
          onChangeText={setFeatureArea}
        />

        <Text style={styles.label}>Describe the Bug or Unresponsive Button:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What were you trying to do and what happened instead?"
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleSubmitBug}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Sending...' : 'Submit Bug Report'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  textArea: { height: 110, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2b6cb0', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6, marginTop: 5 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});