import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

type StaffMember = {
  id: string;
  full_name: string;
  role?: string;
};

type StaffListScreenProps = {
  navigation: any;
  businessId?: string;
  onAddStaff?: () => void;
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
  staffName: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#2d3748'
  },
  roleText: { 
    fontSize: 12, 
    color: '#718096',
    marginTop: 2
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

export default function StaffListScreen({ navigation, businessId, onAddStaff }: StaffListScreenProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    let query = supabase.from('profiles').select('id, full_name, role');
    
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data } = await query;

    if (data) {
      setStaff(data as StaffMember[]);
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff Members</Text>
        {onAddStaff && (
          <TouchableOpacity style={styles.addButton} onPress={onAddStaff}>
            <Text style={styles.addButtonText}>+ Add Staff</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No staff members found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.staffName}>{item.full_name}</Text>
                <Text style={styles.roleText}>{item.role || 'Staff Member'}</Text>
              </View>
            </View>
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