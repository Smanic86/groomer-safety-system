import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../lib/supabase';
import { cachePetList, getCachedPetList, cachePetDetail } from '../lib/offline/petCache';

export type Pet = {
  id: string;
  name: string;
  breed: string | null;
  coat_color?: string | null;
  postcode_area?: string | null;
  microchip_number?: string | null;
  temperament_rating: string;
  trigger_flags: string[];
  vet_notes?: string | null;
  business_id?: string;
  clients?: { full_name: string; phone?: string } | null;
};

type PetListScreenProps = {
  businessId: string;
  onSelectPet: (pet: Pet) => void;
  onAddPet: () => void;
  onManageStaff: () => void;
};

export default function PetListScreen({ businessId, onSelectPet, onAddPet, onManageStaff }: PetListScreenProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  async function fetchPets() {
    setLoading(true);

    const { data, error } = await supabase
      .from('pets')
      .select('*, clients(full_name, phone)');

    if (error) {
      console.log('--- SUPABASE ERROR DETAILS ---', JSON.stringify(error, null, 2));
      const cached = await getCachedPetList();
      setPets(cached);
      setIsOffline(true);
    } else if (data) {
      // Privacy Filter: Hide owner details for pets created by other salons
      const compliantData = (data as unknown as Pet[]).map((pet) => {
        if (pet.business_id !== businessId) {
          return {
            ...pet,
            clients: pet.clients ? { full_name: 'Protected (Other Salon)' } : null,
          };
        }
        return pet;
      });

      setPets(compliantData);
      setIsOffline(false);
      await cachePetList(compliantData);

      for (const pet of compliantData) {
        await cachePetDetail(pet.id, pet);
      }
    }
    setLoading(false);
  }

  // Multi-Method Search Filter
  const filtered = pets.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const isOwnPet = p.business_id === businessId;
    const isOwnerMatch = isOwnPet && p.clients?.full_name?.toLowerCase().includes(q);

    return (
      p.name.toLowerCase().includes(q) ||                               // Option 2: Dog Name
      (p.breed?.toLowerCase().includes(q) ?? false) ||                   // Option 2: Breed
      (p.coat_color?.toLowerCase().includes(q) ?? false) ||              // Option 2: Coat Color
      (p.postcode_area?.toLowerCase().includes(q) ?? false) ||           // Option 1: Partial Postcode (e.g. PE3)
      (p.microchip_number?.toLowerCase().includes(q) ?? false) ||        // Option 1: Microchip Number
      isOwnerMatch                                                      // Option 3: Local Owner Search
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

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <View style={styles.buttonFlex}>
          <Button title="+ Add Dog" onPress={onAddPet} color="#16a34a" />
        </View>
        <View style={styles.buttonFlex}>
          <Button title="👥 Salon Team" onPress={onManageStaff} color="#2563eb" />
        </View>
      </View>

      <Text style={styles.globalNotice}>🛡️ Multi-Search Active: Search by Name, Postcode Area, Breed, or Chip</Text>

      <TextInput
        style={styles.search}
        placeholder="e.g. 'Bella PE3', 'Rex German Shepherd', or Chip #"
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOwnPet = item.business_id === businessId;
          const ownerDisplay = isOwnPet 
            ? (item.clients?.full_name ?? 'N/A')
            : '🔒 Protected (Other Salon)';

          return (
            <TouchableOpacity style={styles.row} onPress={() => onSelectPet(item)}>
              <View style={styles.rowTextWrap}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petSub}>
                  {item.breed ?? 'Unknown breed'} {item.postcode_area ? `• Area: ${item.postcode_area}` : ''}
                </Text>
                <Text style={styles.ownerSub}>Owner: {ownerDisplay}</Text>
              </View>
              {item.trigger_flags && item.trigger_flags.length > 0 && (
                <View style={styles.flagBadge}>
                  <Text style={styles.flagBadgeText}>{item.trigger_flags.length} flag(s)</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No dogs found matching search.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  offlineBanner: { backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, marginBottom: 10 },
  offlineBannerText: { color: '#92400e', fontWeight: '600', textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  buttonFlex: { flex: 1 },
  globalNotice: { fontSize: 11, color: '#166534', backgroundColor: '#f0fdf4', padding: 8, borderRadius: 6, marginBottom: 12, fontWeight: '600', textAlign: 'center' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTextWrap: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '600' },
  petSub: { fontSize: 13, color: '#4b5563', marginTop: 2 },
  ownerSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  flagBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  flagBadgeText: { color: '#b91c1c', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});