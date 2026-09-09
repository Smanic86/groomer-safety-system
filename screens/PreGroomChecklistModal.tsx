import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import ReportButton from '../components/ReportButton';

type PreGroomChecklistModalProps = {
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
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#3182ce',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checked: {
    backgroundColor: '#3182ce'
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  checkText: {
    fontSize: 15,
    color: '#2d3748',
    flex: 1
  },
  button: { 
    backgroundColor: '#3182ce', 
    padding: 14, 
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

export default function PreGroomChecklistModal({ navigation, onSuccess }: PreGroomChecklistModalProps) {
  const [checkedItems, setCheckedItems] = useState({
    healthCheck: false,
    mattedCoat: false,
    parasites: false,
    behaviorAssessment: false
  });

  const toggleCheck = (key: keyof typeof checkedItems) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompleteChecklist = () => {
    const allChecked = Object.values(checkedItems).every(Boolean);
    if (!allChecked) {
      Alert.alert('Incomplete', 'Please verify all pre-groom safety items before proceeding.');
      return;
    }

    Alert.alert('Success', 'Pre-groom checklist completed successfully.');
    if (onSuccess) onSuccess();
    if (navigation && navigation.goBack) navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack ? navigation.goBack() : null}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Pre-Groom Safety Checklist</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('healthCheck')}>
          <View style={[styles.checkbox, checkedItems.healthCheck && styles.checked]}>
            {checkedItems.healthCheck && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>General physical health & injury check</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('mattedCoat')}>
          <View style={[styles.checkbox, checkedItems.mattedCoat && styles.checked]}>
            {checkedItems.mattedCoat && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>Coat condition & matting evaluation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('parasites')}>
          <View style={[styles.checkbox, checkedItems.parasites && styles.checked]}>
            {checkedItems.parasites && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>Flea, tick, and skin parasite inspection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck('behaviorAssessment')}>
          <View style={[styles.checkbox, checkedItems.behaviorAssessment && styles.checked]}>
            {checkedItems.behaviorAssessment && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>Temperament & behavioral trigger review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCompleteChecklist}>
          <Text style={styles.buttonText}>Confirm & Proceed</Text>
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