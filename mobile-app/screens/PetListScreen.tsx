import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { cachePetList, getCachedPetList, cachePetDetail } from '../lib/offline/petCache';

export type Pet = {
  id: string;
  name: string;
  breed: string | null;
  temperament_rating: string;
  trigger_flags: string[];
  vet_notes?: string | null;
  clients: { full_name: string; phone?: string } | null;
};

export default function PetListScreen({ onSelectPet }: { onSelectPet: (pet: Pet) => void }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  async function fetchPets() {
    setLoading(true);
    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      const cached = await getCachedPetList();
      setPets(cached);
      setIsOffline(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('pets')
      .select('id, name, breed, temperament_rating, trigger_flags, vet_notes, clients(full_name, phone)')
      .eq('is_archived', false)
      .order('name');

    if (!error && data) {
      const petData = data as unknown as Pet[];
      setPets(petData);
      await cachePetList(petData);

      for (const pet of petData) {
        await cachePetDetail(pet.id, pet);
      }

      setIsOffline(false);
    } else {
      const cached = await getCachedPetList();
      setPets(cached);
      setIsOffline(true);
    }
    setLoading(false);
  }

  const filtered = pets.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.clients?.full_name.toLowerCase().includes(q) ?? false)
    );
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>📴 Offline — showing cached data</Text>
        </View>
      )}
      <TextInput
        style={styles.search}
        placeholder="Search pet or owner name..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => onSelectPet(item)}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.petName}>{item.name}</Text>
              <Text style={styles.petSub}>
                {item.breed ?? 'Unknown breed'} • Owner: {item.clients?.full_name ?? 'Unknown'}
              </Text>
            </View>
            {item.trigger_flags.length > 0 && (
              <View style={styles.flagBadge}>
                <Text style={styles.flagBadgeText}>{item.trigger_flags.length} flag(s)</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No pets found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  offlineBanner: {
    backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, marginBottom: 10,
  },
  offlineBannerText: { color: '#92400e', fontWeight: '600', textAlign: 'center' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTextWrap: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '600' },
  petSub: { fontSize: 13, color: '#666', marginTop: 2 },
  flagBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  flagBadgeText: { color: '#b91c1c', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});