import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';

type PreGroomChecklistModalProps = {
  visible: boolean;
  petName: string;
  onClose: () => void;
  onComplete: () => void;
};

type CheckItem = {
  id: string;
  label: string;
  subtext: string;
};

const CHECKLIST_ITEMS: CheckItem[] = [
  { id: '1', label: 'Ears, Eyes & Skin Check', subtext: 'No visible signs of infection, severe matting, or open sores.' },
  { id: '2', label: 'Restraint & Harness Checked', subtext: 'Table loop, belly strap, or safety harness fitted properly.' },
  { id: '3', label: 'Bite Mitigation Ready', subtext: 'Muzzle, soft hood, or extra handler on standby if required.' },
  { id: '4', label: 'Trigger Flags Reviewed', subtext: 'Reviewed previous sensitive areas (e.g. rear legs, dryer).' },
];

export default function PreGroomChecklistModal({ visible, petName, onClose, onComplete }: PreGroomChecklistModalProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  function toggleCheck(id: string) {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter((item) => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  }

  function handleStartSession() {
    if (checkedIds.length < CHECKLIST_ITEMS.length) {
      Alert.alert(
        'Checklist Incomplete',
        'Please complete all safety checks before commencing the groom session.'
      );
      return;
    }

    Alert.alert('Assessment Passed', `Pre-groom safety assessment complete for ${petName}. Groom session started!`);
    setCheckedIds([]);
    onComplete();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>🛡️ Pre-Groom Safety Check</Text>
          <Text style={styles.subtitle}>Grooming: {petName}</Text>

          <ScrollView style={styles.checklistContainer}>
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkCard, isChecked && styles.checkCardActive]}
                  onPress={() => toggleCheck(item.id)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.checkLabel}>{item.label}</Text>
                    <Text style={styles.checkSubtext}>{item.subtext}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.startBtn} onPress={handleStartSession}>
              <Text style={styles.startBtnText}>Start Groom</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: 2 },
  checklistContainer: { marginBottom: 16 },
  checkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  checkCardActive: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#94a3b8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 13 },
  textContainer: { flex: 1 },
  checkLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  checkSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#e2e8f0', borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  startBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#0284c7', borderRadius: 8, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});