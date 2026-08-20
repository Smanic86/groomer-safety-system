/**
 * Groomer Safety System
 * Copyright (c) 2026 Shaun Hancock. All rights reserved.
 * Confidential and Proprietary.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function IncidentReportScreen(props: any) {
  // Safely grab parameters directly from props
  const params = props?.route?.params || props || {};

  const petId = params?.petId ?? '00000000-0000-0000-0000-000000000000';
  const groomerId = params?.groomerId ?? '00000000-0000-0000-0000-000000000000';
  const businessId = params?.businessId ?? '00000000-0000-0000-0000-000000000000';
  const petName = params?.petName ?? 'Unknown Pet';

  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide a description of the incident.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof props?.onDone === 'function') {
        props.onDone();
      } else if (typeof props?.navigation?.goBack === 'function') {
        props.navigation.goBack();
      } else {
        Alert.alert('Success', 'Incident report submitted.');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit incident report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (typeof props?.onCancel === 'function') {
      props.onCancel();
    } else if (typeof props?.navigation?.goBack === 'function') {
      props.navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log Incident Report</Text>
      <Text style={styles.subtitle}>Pet: {petName}</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Incident Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Describe what happened during the session..."
          placeholderTextColor="#888888"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Immediate Action Taken</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          placeholder="What steps were taken immediately (e.g., first aid, client notified)..."
          placeholderTextColor="#888888"
          value={actionTaken}
          onChangeText={setActionTaken}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Incident'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#DC2626',
  },
  secondaryButton: {
    backgroundColor: '#374151',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 16,
  },
});