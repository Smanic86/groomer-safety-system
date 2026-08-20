/**
 * Copyright (c) 2026. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

const PRESET_TRIGGERS = [
  'Nail Clipping',
  'Paw Handling',
  'Clippers / Noise',
  'High-Velocity Dryer',
  'Ear Cleaning',
  'Rear / Tail Sensitive',
  'Resource Guarding',
  'Sudden Movements',
  'Table / Restraints',
  'Face Trimming',
];

interface AddTriggerModalProps {
  visible: boolean;
  petId: string;
  businessId?: string;
  petName: string;
  currentTriggers: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTriggerModal({
  visible,
  petId,
  businessId,
  petName,
  currentTriggers = [],
  onClose,
  onSuccess,
}: AddTriggerModalProps) {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setSelectedTriggers(currentTriggers);
  }, [currentTriggers, visible]);

  function toggleTrigger(trigger: string) {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  }

  async function handleSaveTriggers() {
    if (!petId) {
      Alert.alert('Error', 'Missing valid pet identifier.');
      return;
    }

    setSaving(true);
    try {
      // Query array response to safely handle zero or multiple rows without throwing 406
      const { data: existingRecords, error: fetchErr } = await supabase
        .from('risk_assessments')
        .select('id')
        .eq('pet_id', petId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchErr) throw fetchErr;

      const targetId = existingRecords && existingRecords.length > 0 ? existingRecords[0].id : null;

      if (targetId) {
        // Update existing record
        const { error: updateErr } = await supabase
          .from('risk_assessments')
          .update({
            active_triggers: selectedTriggers,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetId);

        if (updateErr) throw updateErr;
      } else {
        // Create initial record if missing
        const { error: insertErr } = await supabase
          .from('risk_assessments')
          .insert({
            pet_id: petId,
            business_id: businessId || null,
            active_triggers: selectedTriggers,
            temperament_rating: 'Unassessed',
            bite_risk: 'Unassessed',
            overall_risk_level: 'LOW',
          });

        if (insertErr) throw insertErr;
      }

      onSuccess();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>➕ Add Trigger / Flag</Text>
          <Text style={styles.modalSub}>Select sensitive triggers for {petName}:</Text>

          <ScrollView style={styles.scrollArea}>
            <View style={styles.chipGrid}>
              {PRESET_TRIGGERS.map((trigger, idx) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleTrigger(trigger)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {isSelected ? `✓ ${trigger}` : trigger}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTriggers} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveText}>Save Triggers</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  modalSub: { fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 16 },
  scrollArea: { maxHeight: 300 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
  chipText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextSelected: { color: '#ffffff', fontWeight: '700' },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#cbd5e1' },
  cancelText: { color: '#334155', fontWeight: '700', fontSize: 13 },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#0284c7' },
  saveText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});