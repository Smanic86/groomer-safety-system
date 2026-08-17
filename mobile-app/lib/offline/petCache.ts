import AsyncStorage from '@react-native-async-storage/async-storage';

const PET_LIST_CACHE_KEY = 'cached_pet_list';
const PET_DETAIL_CACHE_PREFIX = 'cached_pet_detail_';

export async function cachePetList(pets: any[]) {
  try {
    await AsyncStorage.setItem(PET_LIST_CACHE_KEY, JSON.stringify(pets));
  } catch (error) {
    console.error('Error caching pet list:', error);
  }
}

export async function getCachedPetList() {
  try {
    const data = await AsyncStorage.getItem(PET_LIST_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching cached pet list:', error);
    return [];
  }
}

export async function cachePetDetail(petId: string, petData: any) {
  try {
    await AsyncStorage.setItem(`${PET_DETAIL_CACHE_PREFIX}${petId}`, JSON.stringify(petData));
  } catch (error) {
    console.error(`Error caching pet detail for ${petId}:`, error);
  }
}

export async function getCachedPetDetail(petId: string) {
  try {
    const data = await AsyncStorage.getItem(`${PET_DETAIL_CACHE_PREFIX}${petId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error fetching cached pet detail for ${petId}:`, error);
    return null;
  }
}