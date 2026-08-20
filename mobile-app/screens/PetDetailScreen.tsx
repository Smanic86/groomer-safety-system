/**
 * Copyright (c) 2026. All rights reserved.
 * 
 * Proprietary and confidential. Unauthorized copying or redistribution
 * of this file, via any medium, is strictly prohibited.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import RiskBanner from '../components/RiskBanner';
import AddTriggerModal from './AddTriggerModal';

interface PetDetailScreenProps {
  navigation?: any;
  route?: any;
}

export default function PetDetailScreen(props: PetDetailScreenProps) {
  let navigation: any;
  let routeParams: any;

  try {
    navigation = useNavigation();
  } catch (e) {
    navigation = props.navigation;
  }

  try {
    const route = useRoute();
    routeParams = route?.params;
  } catch (e) {
    routeParams = props.route?.params;
  }

  const [pet, setPet] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const targetPetId = routeParams?.petId;

  const fetchPetDetails = useCallback(async () => {
    try {
      let petData = null;

      if (targetPetId) {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', targetPetId)
          .maybeSingle();

        if (error) throw error;
        petData = data;
      } else {
        const { data } = await supabase
          .from('pets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        petData = data && data.length > 0 ? data[0] : null;
      }

      setPet(petData);

      if (petData?.id) {
        const { data: riskData } = await supabase
          .from('risk_assessments')
          .select('*')
          .eq('pet_id', petData.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        setRiskAssessment(riskData && riskData.length > 0 ? riskData[0] : null);

        const { data: incidentData } = await supabase
          .from('incidents')
          .select('*')
          .eq('pet_id', petData.id)
          .order('created_at', { ascending: false });

        setIncidents(incidentData || []);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Unable to record: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetPetId]);

  useEffect(() => {
    fetchPetDetails();
  }, [fetchPetDetails]);

  const handleNavigate = (screenName: string, params?: object) => {
    if (navigation && typeof navigation.navigate === 'function') {
      try {
        navigation.navigate(screenName, params);
      } catch (e: any) {
        Alert.alert('Navigation Error', `Could not navigate to ${screenName}.`);
      }
    } else {
      Alert.alert('Navigation Error', 'Navigation provider missing.');
    }
  };

  const handleReturnHome = () => {
    try {
      if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (e) {
      // Safely ignore if no parent stack exists
    }
  };

  async function handleRemoveTrigger(triggerToRemove: string) {
    if (!pet?.id || !riskAssessment) return;

    const updatedTriggers = (riskAssessment.active_triggers || []).filter(
      (t: string) => t !== triggerToRemove
    );

    try {
      const { error } = await supabase
        .from('risk_assessments')
        .update({
          active_triggers: updatedTriggers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', riskAssessment.id);

      if (error) throw error;
      fetchPetDetails();
    } catch (err: any) {
      Alert.alert('Error', 'Could not remove trigger: ' + err.message);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0284c7" />
      </SafeAreaView>
    );
  }

  const activeTriggers: string[] = riskAssessment?.active_triggers || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchPetDetails()} tintColor="#0284c7" />
        }
      >
        <TouchableOpacity style={styles.backBtn} onPress={handleReturnHome}>
          <Text style={styles.backBtnText}>← Back to Dogs / Home</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.petName}>{pet?.name || 'Select a Dog'}</Text>
          <Text style={styles.breedText}>{pet?.breed || 'No breed specified'}</Text>
          <Text style={styles.metaRow}>
            📍 Area / Postcode: <Text style={styles.metaVal}>{pet?.postcode || 'Not specified'}</Text>
          </Text>
          <Text style={styles.metaRow}>
            👤 Owner: <Text style={styles.metaVal}>{pet?.owner_privacy || '🔒 Protected'}</Text>
          </Text>
        </View>

        <RiskBanner
          temperament={riskAssessment?.temperament_rating}
          biteRisk={riskAssessment?.bite_risk}
          overallRiskLevel={riskAssessment?.overall_risk_level}
        />

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>📋 Risk Assessment</Text>
            <View style={styles.headerBtnGroup}>
              <TouchableOpacity
                style={styles.checkBtn}
                onPress={() => {
                  if (pet?.id) {
                    handleNavigate('RiskAssessmentScreen', {
                      petId: pet.id,
                      petName: pet.name,
                      breed: pet.breed,
                    });
                  } else {
                    Alert.alert('Notice', 'Please select a valid dog record first.');
                  }
                }}
              >
                <Text style={styles.btnText}>⚡ Check</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.triggerBtn}
                onPress={() => {
                  if (pet?.id) {
                    setModalVisible(true);
                  } else {
                    Alert.alert('Notice', 'Please select a valid dog record first.');
                  }
                }}
              >
                <Text style={styles.btnText}>+ Trigger</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Temperament Rating</Text>
              <View style={styles.badgeWarning}>
                <Text style={styles.badgeWarningText}>
                  {riskAssessment?.temperament_rating || 'Unassessed'}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Bite / Snip Risk</Text>
              <View style={styles.badgeWarning}>
                <Text style={styles.badgeWarningText}>
                  {riskAssessment?.bite_risk || 'Unassessed'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.subTitle}>Active Triggers & Sensitivity Flags:</Text>
          {activeTriggers.length === 0 ? (
            <Text style={styles.noTriggersText}>No active triggers logged.</Text>
          ) : (
            <View style={styles.tagContainer}>
              {activeTriggers.map((trigger, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tag}
                  onPress={() =>
                    Alert.alert('Remove Trigger', `Remove "${trigger}"?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => handleRemoveTrigger(trigger) },
                    ])
                  }
                >
                  <Text style={styles.tagText}>⚠️ {trigger}  ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>🚨 Incident Log</Text>
            <TouchableOpacity
              style={styles.incidentBtn}
              onPress={() => {
                if (pet?.id) {
                  handleNavigate('LogIncidentScreen', {
                    petId: pet.id,
                    petName: pet.name,
                    breed: pet.breed,
                    businessId: pet.business_id || riskAssessment?.business_id,
                  });
                } else {
                  Alert.alert('Notice', 'Please select a valid dog record first.');
                }
              }}
            >
              <Text style={styles.btnText}>+ Log Incident</Text>
            </TouchableOpacity>
          </View>

          {incidents.length === 0 ? (
            <Text style={styles.noTriggersText}>No logged incidents for this pet.</Text>
          ) : (
            incidents.map((item, idx) => (
              <View key={idx} style={styles.incidentItem}>
                <View style={styles.rowBetween}>
                  <Text style={styles.incidentDate}>
                    {new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityText}>{item.severity || 'MEDIUM'}</Text>
                  </View>
                </View>
                <Text style={styles.incidentDesc}>{item.description || item.notes}</Text>
              </View>
            ))
          )}
        </View>

        {pet?.id && (
          <AddTriggerModal
            visible={modalVisible}
            petId={pet.id}
            businessId={pet.business_id || riskAssessment?.business_id}
            petName={pet.name}
            currentTriggers={activeTriggers}
            onClose={() => setModalVisible(false)}
            onSuccess={() => {
              setModalVisible(false);
              fetchPetDetails();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  petName: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  breedText: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  metaRow: { fontSize: 13, color: '#64748b', marginTop: 2 },
  metaVal: { color: '#334155', fontWeight: '600' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  headerBtnGroup: { flexDirection: 'row', gap: 6 },
  checkBtn: { backgroundColor: '#16a34a', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  triggerBtn: { backgroundColor: '#0284c7', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  incidentBtn: { backgroundColor: '#b91c1c', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  gridItem: { flex: 1, backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10, marginRight: 8, alignItems: 'center' },
  gridLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 6 },
  badgeWarning: { backgroundColor: '#fef3c7', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  badgeWarningText: { fontSize: 12, color: '#b45309', fontWeight: '800' },
  subTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6 },
  noTriggersText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { backgroundColor: '#fef3c7', borderColor: '#fde68a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 16 },
  tagText: { fontSize: 12, color: '#b45309', fontWeight: '700' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incidentItem: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  incidentDate: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  severityBadge: { backgroundColor: '#fef3c7', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  severityText: { fontSize: 10, color: '#b45309', fontWeight: '800' },
  incidentDesc: { fontSize: 13, color: '#1e293b', marginTop: 4, fontWeight: '500' },
});