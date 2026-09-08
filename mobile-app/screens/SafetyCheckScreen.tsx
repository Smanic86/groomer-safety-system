import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ReportButton from '../components/ReportButton';

type SafetyCheckScreenProps = {
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
    backgroundColor: '#2b6cb0', 
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

export default function SafetyCheckScreen({ navigation }: SafetyCheckScreenProps) {
  const [dogName, setDogName] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Pre-Groom Safety Evaluation</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Dog Name / ID</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter dog name" 
          value={dogName}
          onChangeText={setDogName}
        />

        <Text style={styles.label}>Behavior & Safety Notes</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          placeholder="Note any triggers, muzzling needs, or sensitivities..." 
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Submit Safety Check</Text>
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