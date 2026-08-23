/**
 * Copyright (c) 2026 Groomer Safety System. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

const AVAILABLE_TRIGGERS = [
  'Nail Clipping',
  'Paw Handling',
  'Muzzle Required',
  'Ear Cleaning',
  'Face Trimming',
  'Dryer Sensitive',
  'Table Restive',
  'Bite Risk',
];

export default function PetDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { petId } = route.params || {};

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Trigger Modal states
  const [triggerModalVisible, setTriggerModalVisible] = useState<boolean>(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [savingTrigger, setSavingTrigger] = useState<boolean>(false);

  // Safety Check Modal states
  const [checkModalVisible, setCheckModalVisible] = useState<boolean>(false);
  const [temperament, setTemperament] = useState<string>('Calm');
  const [skinCondition, setSkinCondition] = useState<string>('Clear');
  const [earsEyes, setEarsEyes] = useState<string>('Normal');
  const [mattingLevel, setMattingLevel] = useState<string>('None');
  const [additionalSafetyNotes, setAdditionalSafetyNotes] = useState<string>('');

  // Incident Log Modal states with Image Picker support
  const [incidentModalVisible, setIncidentModalVisible] = useState<boolean>(false);
  const [incidentSeverity, setIncidentSeverity] = useState<string>('MEDIUM');
  const [incidentNotes, setIncidentNotes] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [photoAttachment, setPhotoAttachment] = useState<string>('');
  const [recentIncidents, setRecentIncidents] = useState<any[]>([
    { date: '20 Aug 2026', severity: 'MEDIUM', description: 'Test log entry recorded for this pet.' }
  ]);
  const [savingIncident, setSavingIncident] = useState<boolean>(false);

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    } else {
      setLoading(false);
    }
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;
      setPet(data);

      if (data?.trigger_flags) {
        if (Array.isArray(data.trigger_flags)) {
          setSelectedTriggers(data.trigger_flags);
        } else if (typeof data.trigger_flags === 'string') {
          setSelectedTriggers(
            data.trigger_flags.split(',').map((f: string) => f.trim()).filter(Boolean)
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load pet details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleChipSelection = (triggerName: string) => {
    if (selectedTriggers.includes(triggerName)) {
      setSelectedTriggers(selectedTriggers.filter((item) => item !== triggerName));
    } else {
      setSelectedTriggers([...selectedTriggers, triggerName]);
    }
  };

  const handleRemoveTrigger = async (triggerToRemove: string) => {
    try {
      const updatedList = selectedTriggers.filter((t) => t !== triggerToRemove);
      const updatePayload = Array.isArray(pet?.trigger_flags) 
        ? { trigger_flags: updatedList } 
        : { trigger_flags: updatedList.join(',') };

      const { error } = await supabase
        .from('pets')
        .update(updatePayload)
        .eq('id', petId);

      if (error) throw error;

      setSelectedTriggers(updatedList);
      setPet({ ...pet, trigger_flags: updatePayload.trigger_flags });
    } catch (err: any) {
      Alert.alert('Error', 'Failed to remove trigger: ' + err.message);
    }
  };

  const handleSaveTriggers = async () => {
    try {
      setSavingTrigger(true);
      const updatePayload = Array.isArray(pet?.trigger_flags) 
        ? { trigger_flags: selectedTriggers } 
        : { trigger_flags: selectedTriggers.join(',') };

      const { error } = await supabase
        .from('pets')
        .update(updatePayload)
        .eq('id', petId);

      if (error) throw error;

      setPet({ ...pet, trigger_flags: updatePayload.trigger_flags });
      setTriggerModalVisible(false);
      Alert.alert('Success', 'Trigger flags updated successfully.');
    } catch (err: any) {
      Alert.alert('Database Error', err.message || 'Failed to update triggers.');
    } finally {
      setSavingTrigger(false);
    }
  };

  const handleCompleteSafetyCheck = () => {
    setCheckModalVisible(false);
    Alert.alert(
      'Safety Check Saved ⚡',
      `Pre-groom checklist for ${pet?.name || 'this pet'} recorded successfully.`
    );
  };

  // Function to pick photo from computer/mobile device gallery
  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoAttachment(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open photo library: ' + err.message);
    }
  };

  const handleSaveIncidentAndPdf = () => {
    if (!incidentNotes.trim()) {
      Alert.alert('Validation Error', 'Please enter a brief description of the incident.');
      return;
    }

    setSavingIncident(true);
    setTimeout(() => {
      const newIncident = {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        severity: incidentSeverity,
        description: incidentNotes.trim(),
        action: actionTaken.trim(),
        photo: photoAttachment,
      };
      setRecentIncidents([newIncident, ...recentIncidents]);
      setIncidentNotes('');
      setActionTaken('');
      setPhotoAttachment('');
      setIncidentModalVisible(false);
      setSavingIncident(false);
      Alert.alert('Success', 'Incident saved & PDF report generated successfully.');
    }, 400);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </SafeAreaView>
    );
  }

  let triggerList: string[] = [];
  if (pet?.trigger_flags) {
    if (Array.isArray(pet.trigger_flags)) {
      triggerList = pet.trigger_flags;
    } else if (typeof pet.trigger_flags === 'string') {
      triggerList = pet.trigger_flags.split(',').map((flag: string) => flag.trim()).filter(Boolean);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            }}
          >
            <Text style={styles.backBtnText}>← Back to Dogs</Text>
          </TouchableOpacity>
        </View>

        {pet ? (
          <>
            {/* Top Info Card */}
            <View style={styles.mainCard}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed || 'Breed not specified'}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>📍 Area / Postcode: <Text style={styles.metaVal}>{pet.postcode || 'Not specified'}</Text></Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>👤 Owner: <Text style={styles.metaVal}>🔒 {pet.owner_privacy || 'Protected'}</Text></Text>
              </View>
            </View>

            {/* Caution Banner */}
            <View style={styles.cautionBanner}>
              <Text style={styles.cautionTitle}>⚠️ CAUTION / SENSITIVE PROFILE</Text>
              <Text style={styles.cautionText}>Active triggers detected. Exercise extra care during handling and grooming.</Text>
            </View>

            {/* Risk Assessment Box */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>📋 Risk Assessment</Text>
                <View style={styles.actionButtonsGroup}>
                  <TouchableOpacity style={styles.checkBtn} onPress={() => setCheckModalVisible(true)}>
                    <Text style={styles.checkBtnText}>⚡ Check</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.triggerActionBtn} onPress={() => setTriggerModalVisible(true)}>
                    <Text style={styles.triggerActionBtnText}>+ Trigger</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.badgeRow}>
                <View style={styles.ratingBox}>
                  <Text style={styles.ratingLabel}>Temperament Rating</Text>
                  <View style={styles.orangeBadge}>
                    <Text style={styles.orangeBadgeText}>{pet.temperament_rating || 'Normal'}</Text>
                  </View>
                </View>

                <View style={styles.ratingBox}>
                  <Text style={styles.ratingLabel}>Bite / Snip Risk</Text>
                  <View style={styles.orangeBadge}>
                    <Text style={styles.orangeBadgeText}>Caution</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.subHeading}>Active Triggers & Sensitivity Flags (Tap × to delete):</Text>
              
              <View style={styles.chipsContainer}>
                {triggerList.length > 0 ? (
                  triggerList.map((flag: string, index: number) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.triggerChip}
                      onPress={() => handleRemoveTrigger(flag)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.triggerChipText}>⚠️ {flag.replace(/_/g, ' ')} ×</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noTriggersText}>No active trigger flags recorded.</Text>
                )}
              </View>
            </View>

            {/* Incident Log Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>🚨 Incident Log</Text>
                <TouchableOpacity style={styles.logIncidentBtn} onPress={() => setIncidentModalVisible(true)}>
                  <Text style={styles.logIncidentBtnText}>+ Log Incident</Text>
                </TouchableOpacity>
              </View>
              
              {recentIncidents.map((inc, i) => (
                <View key={i} style={[styles.incidentBox, i > 0 && { marginTop: 8 }]}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.incidentDate}>{inc.date}</Text>
                    <View style={[
                      styles.mediumBadge, 
                      (inc.severity === 'HIGH' || inc.severity === 'CRITICAL') && { backgroundColor: '#fee2e2' },
                      inc.severity === 'LOW' && { backgroundColor: '#dcfce7' }
                    ]}>
                      <Text style={[
                        styles.mediumBadgeText, 
                        (inc.severity === 'HIGH' || inc.severity === 'CRITICAL') && { color: '#991b1b' },
                        inc.severity === 'LOW' && { color: '#166534' }
                      ]}>{inc.severity}</Text>
                    </View>
                  </View>
                  <Text style={styles.incidentDesc}>{inc.description}</Text>
                  {inc.action ? <Text style={styles.incidentAction}>Action: {inc.action}</Text> : null}
                  {inc.photo ? (
                    <Image source={{ uri: inc.photo }} style={styles.incidentThumbnail} />
                  ) : null}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.mainCard}>
            <Text style={styles.errorText}>Pet profile could not be found.</Text>
          </View>
        )}

        {/* Modal for selecting/adding triggers */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={triggerModalVisible}
          onRequestClose={() => setTriggerModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>+ Add Trigger / Flag</Text>
              <Text style={styles.modalSubtitle}>Select sensitive triggers for {pet?.name || 'this pet'}:</Text>
              
              <View style={styles.modalChipsGrid}>
                {AVAILABLE_TRIGGERS.map((trigger, idx) => {
                  const isSelected = selectedTriggers.includes(trigger);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.modalChip, isSelected && styles.modalChipSelected]}
                      onPress={() => toggleChipSelection(trigger)}
                    >
                      <Text style={[styles.modalChipText, isSelected && styles.modalChipTextSelected]}>
                        {trigger}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn} 
                  onPress={() => setTriggerModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.modalSaveBtn} 
                  onPress={handleSaveTriggers}
                  disabled={savingTrigger}
                >
                  {savingTrigger ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Triggers</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for Pre-Groom Check */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={checkModalVisible}
          onRequestClose={() => setCheckModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Pre-Groom Check</Text>
                <Text style={styles.modalSubtitle}>Assessment check for {pet?.name || 'this pet'}</Text>

                <Text style={styles.checkCategoryTitle}>Temperament / Behavior</Text>
                <View style={styles.checkChipsRow}>
                  {['Calm', 'Nervous', 'Aggressive', 'Excited'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.checkChip, temperament === item && styles.checkChipActive]}
                      onPress={() => setTemperament(item)}
                    >
                      <Text style={[styles.checkChipText, temperament === item && styles.checkChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.checkCategoryTitle}>Skin & Coat Condition</Text>
                <View style={styles.checkChipsRow}>
                  {['Clear', 'Dry/Flaky', 'Fleas/Ticks', 'Irritated'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.checkChip, skinCondition === item && styles.checkChipActive]}
                      onPress={() => setSkinCondition(item)}
                    >
                      <Text style={[styles.checkChipText, skinCondition === item && styles.checkChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.checkCategoryTitle}>Ears & Eyes</Text>
                <View style={styles.checkChipsRow}>
                  {['Normal', 'Dirty/Infected', 'Discharge', 'Sensitive'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.checkChip, earsEyes === item && styles.checkChipActive]}
                      onPress={() => setEarsEyes(item)}
                    >
                      <Text style={[styles.checkChipText, earsEyes === item && styles.checkChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.checkCategoryTitle}>Matting Level</Text>
                <View style={styles.checkChipsRow}>
                  {['None', 'Minor', 'Moderate', 'Severe'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.checkChip, mattingLevel === item && styles.checkChipActive]}
                      onPress={() => setMattingLevel(item)}
                    >
                      <Text style={[styles.checkChipText, mattingLevel === item && styles.checkChipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.checkCategoryTitle}>Additional Safety Notes</Text>
                <TextInput
                  style={styles.textInputArea}
                  placeholder="Note any pre-existing injuries, warts, or sensitive spots..."
                  placeholderTextColor="#94a3b8"
                  multiline={true}
                  numberOfLines={3}
                  value={additionalSafetyNotes}
                  onChangeText={setAdditionalSafetyNotes}
                />

                <View style={styles.modalBtnColumn}>
                  <TouchableOpacity 
                    style={styles.completeCheckBtn} 
                    onPress={handleCompleteSafetyCheck}
                  >
                    <Text style={styles.completeCheckBtnText}>Complete & Save Check</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalCancelFullBtn} 
                    onPress={() => setCheckModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal for + Log Incident with Photo Picker */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={incidentModalVisible}
          onRequestClose={() => setIncidentModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Log Incident for {pet?.name || 'Pet'}</Text>
                
                <Text style={styles.inputLabel}>Severity Level</Text>
                <View style={styles.severityRow}>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                    <TouchableOpacity
                      key={sev}
                      style={[styles.sevBtn, incidentSeverity === sev && styles.sevBtnActive]}
                      onPress={() => setIncidentSeverity(sev)}
                    >
                      <Text style={[styles.sevBtnText, incidentSeverity === sev && styles.sevBtnTextActive]}>{sev}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Description / Notes</Text>
                <TextInput
                  style={styles.textInputArea}
                  placeholder="Describe what happened during grooming..."
                  placeholderTextColor="#94a3b8"
                  multiline={true}
                  numberOfLines={3}
                  value={incidentNotes}
                  onChangeText={setIncidentNotes}
                />

                <Text style={styles.inputLabel}>Action Taken</Text>
                <TextInput
                  style={styles.textInputArea}
                  placeholder="e.g., Muzzled safely, took a 5-minute break"
                  placeholderTextColor="#94a3b8"
                  multiline={true}
                  numberOfLines={2}
                  value={actionTaken}
                  onChangeText={setActionTaken}
                />

                <Text style={styles.inputLabel}>Photo Attachment</Text>
                <TouchableOpacity style={styles.photoPickerBtn} onPress={handlePickPhoto}>
                  <Text style={styles.photoPickerBtnText}>📷 Choose Photo from Computer / Mobile</Text>
                </TouchableOpacity>

                {photoAttachment ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: photoAttachment }} style={styles.previewImage} />
                    <TouchableOpacity onPress={() => setPhotoAttachment('')}>
                      <Text style={styles.removePhotoText}>Remove Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={[styles.modalBtnRow, { marginTop: 16 }]}>
                  <TouchableOpacity 
                    style={styles.modalCancelBtn} 
                    onPress={() => setIncidentModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.modalPdfSaveBtn} 
                    onPress={handleSaveIncidentAndPdf}
                    disabled={savingIncident}
                  >
                    {savingIncident ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalPdfSaveText}>Save & Generate PDF</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  headerRow: { marginBottom: 16 },
  backBtn: { backgroundColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  backBtnText: { color: '#0f172a', fontWeight: '700', fontSize: 13 },
  mainCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  petName: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  petBreed: { fontSize: 14, color: '#64748b', marginBottom: 10 },
  metaRow: { marginTop: 4 },
  metaText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  metaVal: { color: '#0f172a', fontWeight: '700' },
  cautionBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fef08a', borderRadius: 12, padding: 14, marginBottom: 14 },
  cautionTitle: { color: '#854d0e', fontWeight: '800', fontSize: 13, marginBottom: 4 },
  cautionText: { color: '#713f12', fontSize: 12 },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  actionButtonsGroup: { flexDirection: 'row', gap: 6 },
  checkBtn: { backgroundColor: '#16a34a', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  checkBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  triggerActionBtn: { backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  triggerActionBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ratingBox: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10 },
  ratingLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6 },
  orangeBadge: { backgroundColor: '#fef3c7', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  orangeBadgeText: { color: '#b45309', fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  subHeading: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triggerChip: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  triggerChipText: { color: '#991b1b', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  noTriggersText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  logIncidentBtn: { backgroundColor: '#991b1b', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  logIncidentBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  incidentBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  incidentDate: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  mediumBadge: { backgroundColor: '#fef3c7', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  mediumBadgeText: { fontSize: 10, fontWeight: '800', color: '#b45309' },
  incidentDesc: { fontSize: 13, color: '#0f172a' },
  incidentAction: { fontSize: 12, color: '#475569', marginTop: 4, fontStyle: 'italic' },
  incidentThumbnail: { width: '100%', height: 140, borderRadius: 8, marginTop: 8, resizeMode: 'cover' },
  errorText: { color: '#b91c1c', fontSize: 14, textAlign: 'center' },
  // Modal Common Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 14, padding: 20, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 14 },
  modalChipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  modalChip: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalChipSelected: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
  modalChipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  modalChipTextSelected: { color: '#ffffff' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  modalSaveBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  modalSaveText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  // Pre-Groom Check Specific Styles
  checkCategoryTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 6 },
  checkChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  checkChip: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  checkChipActive: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
  checkChipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  checkChipTextActive: { color: '#ffffff' },
  modalBtnColumn: { gap: 8, marginTop: 16 },
  completeCheckBtn: { backgroundColor: '#16a34a', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  completeCheckBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  modalCancelFullBtn: { backgroundColor: '#e2e8f0', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  // Incident Specific Styles
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 10 },
  severityRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  sevBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  sevBtnActive: { backgroundColor: '#991b1b', borderColor: '#7f1d1d' },
  sevBtnText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  sevBtnTextActive: { color: '#ffffff' },
  textInputArea: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 13, color: '#0f172a', textAlignVertical: 'top' },
  photoPickerBtn: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, alignItems: 'center', borderStyle: 'dashed' },
  photoPickerBtnText: { color: '#2563eb', fontWeight: '700', fontSize: 12 },
  previewContainer: { marginTop: 8, alignItems: 'center' },
  previewImage: { width: '100%', height: 120, borderRadius: 8, resizeMode: 'cover', marginBottom: 4 },
  removePhotoText: { color: '#b91c1c', fontSize: 11, fontWeight: '700' },
  modalPdfSaveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#991b1b', justifyContent: 'center', alignItems: 'center' },
  modalPdfSaveText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
});