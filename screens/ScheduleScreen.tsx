import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

/**
 * Groomer Safety System - Schedule Screen with Rota-to-Profile Navigation
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

const GROOMER_COLORS: { [key: string]: { bg: string; border: string; text: string } } = {
  'Sarah Jenkins': { bg: '#ebf8ff', border: '#bee3f8', text: '#2b6cb0' },
  'David Smith': { bg: '#f0fff4', border: '#c6f6d5', text: '#22543d' },
  'default': { bg: '#fffaf0', border: '#feebc8', text: '#c05621' }
};

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const [shifts, setShifts] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [dogList, setDogList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loggedInStaffRole, setLoggedInStaffRole] = useState('groomer');
  const [selectedDog, setSelectedDog] = useState('');
  const [dogSearchQuery, setDogSearchQuery] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState(TIME_SLOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchStaffMembers();
    fetchDogProfiles();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchShifts(selectedStaff, loggedInStaffRole);
    }
  }, [selectedStaff, loggedInStaffRole]);

  async function fetchStaffMembers() {
    const { data, error } = await supabase.from('staff_members').select('*');
    if (error) console.log('Error fetching staff:', error.message);
    else if (data && data.length > 0) {
      setStaffList(data);
      setSelectedStaff(data[0].name);
      setLoggedInStaffRole(data[0].role || 'groomer');
    }
  }

  async function fetchShifts(currentStaff: string, role: string) {
    let query = supabase.from('staff_schedule').select('*');
    if (role !== 'receptionist') {
      query = query.eq('staff_name', currentStaff);
    }
    const { data, error } = await query;
    if (error) console.log('Error fetching schedule:', error.message);
    else if (data) setShifts(data);
  }

  async function fetchDogProfiles() {
    const { data, error } = await supabase.from('dog_profiles').select('*');
    if (error) console.log('Error fetching dogs:', error.message);
    else if (data) setDogList(data);
  }

  const filteredDogs = dogList.filter(dog => 
    dog.name?.toLowerCase().includes(dogSearchQuery.toLowerCase())
  );

  async function handleAddShift() {
    if (isSubmitting) return;
    if (!selectedStaff.trim() || !shiftDate.trim() || !shiftTime.trim()) return;

    setIsSubmitting(true);
    const { data, error } = await supabase.from('staff_schedule').insert([
      { 
        staff_name: selectedStaff.trim(), 
        dog_name: selectedDog.trim() || 'No Dog Assigned',
        date: shiftDate.trim(), 
        time: shiftTime.trim(),
        status: 'Booked'
      }
    ]).select();

    if (!error && data) {
      setShifts(prev => [...prev, data[0]]);
      setShiftDate('');
      setSelectedDog('');
      setDogSearchQuery('');
    } else if (error) {
      console.log('Error adding shift:', error.message);
    }
    setIsSubmitting(false);
  }

  async function handleCancelShift(id: any) {
    const { error } = await supabase
      .from('staff_schedule')
      .update({ status: 'Canceled' })
      .eq('id', id);

    if (!error) {
      setShifts(shifts.map(item => item.id === id ? { ...item, status: 'Canceled' } : item));
    } else {
      console.log('Error updating cancellation status:', error.message);
    }
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) { calendarCells.push(null); }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({ day, dateString: `${monthNames[currentMonth]} ${day}, ${currentYear}` });
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Calendar Rota & Appointments</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Viewing As (Simulate Login / Role):</Text>
        <View style={styles.chipsContainer}>
          {staffList.map((staff) => (
            <TouchableOpacity
              key={staff.id}
              style={[styles.chip, selectedStaff === staff.name && styles.selectedChip]}
              onPress={() => {
                setSelectedStaff(staff.name);
                setLoggedInStaffRole(staff.role || 'groomer');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedStaff === staff.name && styles.selectedChipText]}>
                {staff.name} {staff.role === 'receptionist' ? '⭐' : '✂️'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Search & Assign Dog Profile:</Text>
        <TextInput
          style={styles.input}
          placeholder="Type dog name to search..."
          placeholderTextColor="#a0aec0"
          value={dogSearchQuery}
          onChangeText={setDogSearchQuery}
        />

        {dogSearchQuery.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {filteredDogs.length === 0 ? (
              <Text style={styles.subText}>No matching dogs found.</Text>
            ) : (
              filteredDogs.map((dog) => (
                <TouchableOpacity
                  key={dog.id}
                  style={styles.searchResultItem}
                  onPress={() => {
                    setSelectedDog(dog.name);
                    setDogSearchQuery(dog.name);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchResultText}>🐶 {dog.name} ({dog.breed || 'Mixed'})</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <Text style={styles.label}>Selected Date (Click calendar day below):</Text>
        <TextInput
          style={styles.input}
          placeholder="Select a day from the calendar grid..."
          placeholderTextColor="#a0aec0"
          value={shiftDate}
          editable={false}
        />

        <Text style={styles.label}>Select Hour:</Text>
        <View style={styles.chipsContainer}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.chip, shiftTime === slot && styles.selectedChip]}
              onPress={() => setShiftTime(slot)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, shiftTime === slot && styles.selectedChipText]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.addButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleAddShift}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>{isSubmitting ? 'Booking...' : 'Book Appointment Slot'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => {
          if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
          else { setCurrentMonth(currentMonth - 1); }
        }}>
          <Text style={styles.monthNavText}>◀ Prev</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitleText}>{monthNames[currentMonth]} {currentYear}</Text>
        <TouchableOpacity onPress={() => {
          if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
          else { setCurrentMonth(currentMonth + 1); }
        }}>
          <Text style={styles.monthNavText}>Next ▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <Text key={i} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarCells.map((item, index) => {
          if (!item) return <View key={`empty-${index}`} style={styles.calendarCellEmpty} />;
          
          const dayShifts = shifts.filter(s => {
            if (!s.date || s.status === 'Canceled') return false;
            return s.date.trim() === `${monthNames[currentMonth]} ${item.day}, ${currentYear}`;
          });

          return (
            <TouchableOpacity 
              key={`day-${item.day}`} 
              style={styles.calendarCell}
              onPress={() => setShiftDate(item.dateString)}
              activeOpacity={0.7}
            >
              <Text style={styles.cellDayNumber}>{item.day}</Text>
              {dayShifts.map(s => {
                const theme = GROOMER_COLORS[s.staff_name] || GROOMER_COLORS['default'];
                const matchedDog = dogList.find(d => d.name.toLowerCase() === s.dog_name.toLowerCase());

                return (
                  <TouchableOpacity 
                    key={s.id} 
                    style={[styles.cellShiftBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}
                    onPress={() => {
                      if (matchedDog) {
                        navigation.navigate('PetDetail', { dogId: matchedDog.id });
                      } else {
                        navigation.navigate('PetDetail', { dog: { name: s.dog_name } });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cellShiftText, { color: theme.text }]} numberOfLines={1}>
                      {s.dog_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>Manage Appointments & Cancellations</Text>
        {shifts.length === 0 ? (
          <Text style={styles.emptyText}>No appointments booked yet.</Text>
        ) : (
          shifts.map((item) => {
            const isCanceled = item.status === 'Canceled';
            const matchedDog = dogList.find(d => d.name.toLowerCase() === item.dog_name.toLowerCase());

            return (
              <View key={item.id} style={[styles.rowItem, isCanceled && styles.canceledRow]}>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (matchedDog) {
                        navigation.navigate('PetDetail', { dogId: matchedDog.id });
                      } else {
                        navigation.navigate('PetDetail', { dog: { name: item.dog_name } });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.rowText, isCanceled && styles.canceledText]}>
                      🐶 {item.dog_name} — Staff: {item.staff_name} {isCanceled ? '(Canceled)' : ''}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.subText}>{item.date} | {item.time}</Text>
                </View>
                {!isCanceled ? (
                  <TouchableOpacity onPress={() => handleCancelShift(item.id)} activeOpacity={0.7}>
                    <Text style={styles.cancelActionText}>Cancel</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.canceledBadgeText}>Archived</Text>
                )}
              </View>
            );
          })
        )}
      </View>

      <ReportButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 15 },
  formContainer: { marginBottom: 20, gap: 10, backgroundColor: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  chip: { backgroundColor: '#edf2f7', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e0' },
  selectedChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { color: '#4a5568', fontSize: 14, fontWeight: '500' },
  selectedChipText: { color: '#fff' },
  searchResultsContainer: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, maxHeight: 150, marginBottom: 5 },
  searchResultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchResultText: { fontSize: 14, color: '#2d3748', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  addButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b6cb0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  monthTitleText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  monthNavText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  weekDaysRow: { flexDirection: 'row', backgroundColor: '#edf2f7', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#cbd5e0' },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#4a5568', fontSize: 13 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginBottom: 20 },
  calendarCellEmpty: { width: '14.28%', height: 85, backgroundColor: '#f7fafc', borderWidth: 0.5, borderColor: '#e2e8f0' },
  calendarCell: { width: '14.28%', height: 85, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0', padding: 4 },
  cellDayNumber: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  cellShiftBadge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 3, marginBottom: 2, borderWidth: 1 },
  cellShiftText: { fontSize: 9, fontWeight: '600' },
  listSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  canceledRow: { backgroundColor: '#fff5f5', borderColor: '#feb2b2', opacity: 0.7 },
  rowText: { fontSize: 15, color: '#2d3748', fontWeight: '600' },
  canceledText: { textDecorationLine: 'line-through', color: '#e53e3e' },
  subText: { fontSize: 13, color: '#718096', marginTop: 3 },
  cancelActionText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 },
  canceledBadgeText: { color: '#a0aec0', fontWeight: '600', fontSize: 12, fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 15, fontSize: 15 }
});