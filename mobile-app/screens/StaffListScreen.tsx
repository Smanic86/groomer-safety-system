import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

type StaffMember = {
  id: string;
  full_name: string;
  role: string;
};

type StaffListProps = {
  businessId: string;
  onBack: () => void;
  onAddStaff: () => void;
};

export default function StaffListScreen({ businessId, onBack, onAddStaff }: StaffListProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('business_id', businessId);

    if (data) {
      setStaff(data as StaffMember[]);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Back" onPress={onBack} color="#6b7280" />
        <Button title="+ Add Staff" onPress={onAddStaff} color="#2563eb" />
      </View>

      <Text style={styles.title}>Salon Team Members</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.role}>{item.role.toUpperCase()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No staff added yet.</Text>}
        />
      )}

      {/* Copyright Footer */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Groomer Safety System. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  row: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600' },
  role: { fontSize: 12, color: '#2563eb', fontWeight: '700', alignSelf: 'center' },
  empty: { textAlign: 'center', marginTop: 30, color: '#9ca3af' },
  copyrightContainer: { marginTop: 30, marginBottom: 20, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});