import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

type Dog = {
  id: string;
  name: string;
  breed: string;
  photo_url?: string;
};

type PetListScreenProps = {
  navigation: any;
  businessId?: string;
  onAddPet?: () => void;
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700',
    color: '#1a202c'
  },
  addButton: {
    backgroundColor: '#3182ce',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  card: { 
    padding: 14, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  dogName: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#2d3748'
  },
  breedText: { 
    fontSize: 12, 
    color: '#718096',
    marginTop: 2
  },
  arrow: {
    fontSize: 18,
    color: '#a0aec0',
    fontWeight: 'bold'
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 30, 
    color: '#6b7280' 
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

export default function PetListScreen({ navigation, businessId, onAddPet }: PetListScreenProps) {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDogs();
  }, []);

  async function fetchDogs() {
    setLoading(true);
    let query = supabase.from('dogs').select('id, name, breed, photo_url');
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (data) {
      setDogs(data as Dog[]);
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dog Profiles</Text>
        {onAddPet && (
          <TouchableOpacity style={styles.addButton} onPress={onAddPet}>
            <Text style={styles.addButtonText}>+ Add Dog</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={dogs}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No dog profiles found.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation?.navigate('PetDetailScreen', { dogId: item.id })}
            >
              <View>
                <Text style={styles.dogName}>{item.name}</Text>
                <Text style={styles.breedText}>{item.breed || 'Unknown breed'}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System
        </Text>
      </View>

      <ReportButton />
    </ScrollView>
  );
}