import { useState, useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import PetListScreen from './PetListScreen';
import SafetyCheckScreen from './SafetyCheckScreen';
import RiskAssessmentScreen from './RiskAssessmentScreen';
import IncidentReportScreen from './IncidentReportScreen';

const CACHED_BUSINESS_ID_KEY = 'cached_user_business_id';

export default function HomeScreen({ session }: { session: any }) {
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [mode, setMode] = useState<'detail' | 'assessment' | 'incident'>('detail');
  const [businessId, setBusinessId] = useState<string>('default-business-id');

  useEffect(() => {
    async function syncBusinessId() {
      try {
        const cached = await AsyncStorage.getItem(CACHED_BUSINESS_ID_KEY);
        if (cached) setBusinessId(cached);

        const netState = await NetInfo.fetch();
        if (netState.isConnected && session?.user?.id) {
          const { data } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', session.user.id)
            .single();

          if (data?.business_id) {
            setBusinessId(data.business_id);
            await AsyncStorage.setItem(CACHED_BUSINESS_ID_KEY, data.business_id);
          }
        }
      } catch (err) {
        console.error('Error syncing business ID:', err);
      }
    }

    syncBusinessId();
  }, [session?.user?.id]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // 1. Risk Assessment Screen
  if (selectedPet && mode === 'assessment') {
    return (
      <View style={{ flex: 1 }}>
        <RiskAssessmentScreen
          petId={selectedPet.id}
          groomerId={session?.user?.id ?? 'demo-groomer'}
          businessId={businessId}
          onDone={() => setMode('detail')}
        />
      </View>
    );
  }

  // 2. Incident Report Screen
  if (selectedPet && mode === 'incident') {
    return (
      <View style={{ flex: 1 }}>
        <IncidentReportScreen
          petId={selectedPet.id}
          groomerId={session?.user?.id ?? 'demo-groomer'}
          businessId={businessId}
          onDone={() => setMode('detail')}
          onCancel={() => setMode('detail')}
        />
      </View>
    );
  }

  // 3. Pet Safety Check Screen
  if (selectedPet) {
    return (
      <View style={{ flex: 1 }}>
        <SafetyCheckScreen
          pet={selectedPet}
          groomerId={session?.user?.id ?? 'demo-groomer'}
          businessId={businessId}
          onBack={() => {
            setSelectedPet(null);
            setMode('detail');
          }}
          onStartAssessment={() => setMode('assessment')}
          onLogIncident={() => setMode('incident')}
        />
      </View>
    );
  }

  // 4. Pet List Screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
      <PetListScreen 
        onSelectPet={(pet) => {
          setSelectedPet(pet);
          setMode('detail');
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 16, alignItems: 'flex-end' },
});