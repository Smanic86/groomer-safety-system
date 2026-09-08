import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function DogProfilesScreen({ route, navigation }: { route: any; navigation: any }) {
  const targetDogId = route?.params?.selectedDogId;
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(targetDogId || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (targetDogId) {
      setSelectedDogId(targetDogId);
    }
    fetchDogs();
  }, [targetDogId]);

  useEffect(() => {
    if (selectedDogId) {
      fetchNotes(selectedDogId);
    }
  }, [selectedDogId]);

  async function fetchDogs() {
    const { data, error } = await supabase.from('dogs').select('*').order('name', { ascending: true });
    if (error) {
      console.error('Error fetching dogs:', error.message);
    } else {
      const fetchedDogs = data || [];
      setDogs(fetchedDogs);
      if (targetDogId) {
        setSelectedDogId(targetDogId);
      }
    }
  }

  async function fetchNotes(dogId: string) {
    const { data, error } = await supabase
      .from('dog_notes')
      .select('*')
      .eq('dog_id', dogId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setNotes([
        { id: 'n1', note: 'Sensitive around hind legs during nail clipping.', created_at: '2026-09-01' }
      ]);
    } else {
      setNotes(data);
    }
  }

  async function handleAddNote(dogId: string) {
    if (!newNote.trim()) return;

    const { error } = await supabase.from('dog_notes').insert([{
      dog_id: dogId,
      note: newNote.trim()
    }]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setNewNote('');
      fetchNotes(dogId);
    }
  }

  async function handleDeleteNote(noteId: string, dogId: string) {
    const { error } = await supabase.from('dog_notes').delete().eq('id', noteId);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchNotes(dogId);
    }
  }

  const filteredDogs = dogs.filter(dog => 
    dog.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dog.breed?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Dog Profiles & Triggers</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search dogs by name or breed..."
        placeholderTextColor="#a0aec0"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredDogs.length === 0 ? (
        <Text style={styles.emptyText}>No dog profiles found.</Text>
      ) : (
        filteredDogs.map((dog) => {
          const isExpanded = selectedDogId === dog.id;
          return (
            <TouchableOpacity 
              key={dog.id} 
              style={[styles.card, isExpanded && styles.cardExpanded]} 
              onPress={() => setSelectedDogId(isExpanded ? null : dog.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>
                🐶 {dog.name} <Text style={styles.cardBreed}>({dog.breed || 'Unknown Breed'})</Text>
              </Text>
              
              {isExpanded ? (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailText}><Text style={styles.bold}>Safety Triggers:</Text> {dog.safety_triggers || 'None recorded'}</Text>
                  <Text style={styles.detailText}><Text style={styles.bold}>Weight / Age:</Text> {dog.weight || 'N/A'} | {dog.age || 'N/A'}</Text>

                  <Text style={styles.notesHeader}>Groomer Notes & Behavior Logs</Text>
                  {notes.length === 0 ? (
                    <Text style={styles.emptyText}>No notes added yet.</Text>
                  ) : (
                    notes.map((n) => (
                      <View key={n.id} style={styles.noteCard}>
                        <Text style={styles.noteText}>{n.note}</Text>
                        <TouchableOpacity onPress={() => handleDeleteNote(n.id, dog.id)}>
                          <Text style={styles.deleteNoteText}>Delete Note</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}

                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add a new behavior or safety note..."
                    placeholderTextColor="#a0aec0"
                    value={newNote}
                    onChangeText={setNewNote}
                  />
                  <TouchableOpacity 
                    style={styles.addNoteButton} 
                    onPress={() => handleAddNote(dog.id)}
                  >
                    <Text style={styles.addNoteButtonText}>Save Note</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  Triggers: {dog.safety_triggers || 'Tap to view notes'}
                </Text>
              )}
            </TouchableOpacity>
          );
        })
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  contentContainer: { paddingBottom: 80 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  searchInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, fontSize: 14, backgroundColor: '#fff', color: '#1a202c', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardExpanded: { borderColor: '#3182ce', backgroundColor: '#f0f4f8' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a202c' },
  cardBreed: { fontSize: 13, color: '#718096', fontWeight: 'normal' },
  cardSubtitle: { fontSize: 13, color: '#4a5568', marginTop: 4 },
  detailsBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#cbd5e0' },
  detailText: { fontSize: 14, color: '#2d3748', marginBottom: 6 },
  bold: { fontWeight: '600' },
  notesHeader: { fontSize: 15, fontWeight: 'bold', color: '#2b6cb0', marginTop: 15, marginBottom: 8 },
  noteCard: { backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  noteText: { fontSize: 13, color: '#2d3748' },
  deleteNoteText: { fontSize: 12, color: '#e53e3e', fontWeight: '600', marginTop: 4, textAlign: 'right' },
  noteInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 8, fontSize: 13, backgroundColor: '#fff', color: '#1a202c', marginTop: 8 },
  addNoteButton: { backgroundColor: '#3182ce', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  addNoteButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  emptyText: { color: '#718096', fontStyle: 'italic', fontSize: 14 },
  copyrightContainer: { marginTop: 40, marginBottom: 20, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: '#9ca3af', textAlign: 'center' }
});