import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function ScheduleScreen({ navigation }: { navigation: any }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 8));
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [shifts, setShifts] = useState<any[]>([]);
  const [scheduledDogs, setScheduledDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [updatedTime, setUpdatedTime] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  useEffect(() => {
    fetchDayData(selectedDate);
  }, [selectedDate]);

  async function fetchDayData(dateStr: string) {
    setLoading(true);
    
    const { data: shiftData } = await supabase
      .from('shifts')
      .select('*, staff(name, role)')
      .eq('date', dateStr);

    const { data: dogData } = await supabase
      .from('appointments')
      .select('*, dogs(id, name, breed, safety_triggers)')
      .eq('date', dateStr);

    setLoading(false);

    setShifts(shiftData && shiftData.length > 0 ? shiftData : [
      { id: '1', staff: { name: 'Shawn', role: 'Senior Groomer' }, time: '09:00 AM - 04:00 PM' }
    ]);

    setScheduledDogs(dogData && dogData.length > 0 ? dogData.map(d => d.dogs) : [
      { id: 'dog-1', name: 'Rex', breed: 'German Shepherd', safety_triggers: 'Sensitive paws, nervous around dryers.' },
      { id: 'dog-2', name: 'Bella', breed: 'Cockapoo', safety_triggers: 'Dislikes face clipping.' }
    ]);
  }

  async function handleUpdateShift(shiftId: string) {
    if (!updatedTime.trim()) return;

    const { error } = await supabase
      .from('shifts')
      .update({ time: updatedTime.trim() })
      .eq('id', shiftId);

    if (error) {
      setShifts(shifts.map(s => s.id === shiftId ? { ...s, time: updatedTime.trim() } : s));
    }
    
    setEditingShiftId(null);
    setUpdatedTime('');
    fetchDayData(selectedDate);
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const daysArray = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    const dStr = i < 10 ? `0${i}` : `${i}`;
    daysArray.push(`${year}-${mStr}-${dStr}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Staff Rota & Appointments</Text>
      
      <View style={styles.monthNavContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
          <Text style={styles.navButtonText}>◀ Prev</Text>
        </TouchableOpacity>
        <Text style={styles.subHeader}>{monthNames[month]} {year}</Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <Text style={styles.navButtonText}>Next ▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, index) => (
          <Text key={index} style={styles.weekDayLabel}>{d}</Text>
        ))}

        {daysArray.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          const dayNumber = day.split('-')[2];
          const isSelected = selectedDate === day;

          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayCell, isSelected && styles.selectedDayCell]}
              onPress={() => setSelectedDate(day)}
              activeOpacity={0.6}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.scheduleBox}>
        <Text style={styles.scheduleHeader}>Rota & Bookings for {selectedDate}</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading day details...</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Shift Rota (Tap Edit to Change Times)</Text>
            {shifts.map((shift, idx) => {
              const isEditing = editingShiftId === shift.id;
              return (
                <View key={shift.id || idx} style={styles.shiftCard}>
                  <Text style={styles.shiftStaffName}>
                    {shift.staff?.name || 'Staff Member'} <Text style={styles.shiftRole}>({shift.staff?.role || 'Groomer'})</Text>
                  </Text>
                  
                  {isEditing ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        value={updatedTime}
                        placeholder={shift.time}
                        placeholderTextColor="#a0aec0"
                        onChangeText={setUpdatedTime}
                      />
                      <TouchableOpacity style={styles.saveButton} onPress={() => handleUpdateShift(shift.id)}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.shiftRow}>
                      <Text style={styles.shiftTime}>⏰ {shift.time}</Text>
                      <TouchableOpacity onPress={() => { setEditingShiftId(shift.id); setUpdatedTime(shift.time); }}>
                        <Text style={styles.editText}>Edit Shift</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Booked Dogs (Click to open profile)</Text>
            {scheduledDogs.map((dog, idx) => (
              <TouchableOpacity 
                key={dog.id || idx} 
                style={styles.dogCard}
                onPress={() => navigation.navigate('DogProfiles')}
                activeOpacity={0.7}
              >
                <Text style={styles.dogName}>🐶 {dog.name} <Text style={styles.dogBreed}>({dog.breed})</Text></Text>
                <Text style={styles.dogTrigger}>Triggers/Notes: {dog.safety_triggers || 'None recorded'}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

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
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  contentContainer: { paddingBottom: 60 },
  backButton: { marginBottom: 10 },
  backButtonText: { color: '#3182ce', fontSize: 14, fontWeight: '600' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 8 },
  monthNavContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  navButton: { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#e2e8f0', borderRadius: 4 },
  navButtonText: { fontSize: 13, fontWeight: '600', color: '#2d3748' },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    marginBottom: 15,
    justifyContent: 'space-between'
  },
  weekDayLabel: { width: '14%', textAlign: 'center', fontWeight: 'bold', color: '#718096', marginBottom: 6, fontSize: 12 },
  dayCell: { width: '13%', height: 32, margin: '0.5%', backgroundColor: '#f7fafc', borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  selectedDayCell: { backgroundColor: '#3182ce', borderColor: '#2b6cb0' },
  dayText: { fontSize: 13, color: '#2d3748', fontWeight: '600' },
  selectedDayText: { color: '#fff' },
  scheduleBox: { backgroundColor: '#fff', padding: 15, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  scheduleHeader: { fontSize: 16, fontWeight: 'bold', color: '#1a202c', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  shiftCard: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#3182ce' },
  shiftStaffName: { fontSize: 14, fontWeight: 'bold', color: '#1a202c' },
  shiftRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  shiftRole: { fontSize: 12, color: '#718096', fontWeight: 'normal' },
  shiftTime: { fontSize: 13, color: '#4a5568' },
  editText: { fontSize: 12, color: '#3182ce', fontWeight: '600' },
  editRow: { flexDirection: 'row', marginTop: 6, gap: 8 },
  editInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 4, padding: 6, fontSize: 13, backgroundColor: '#fff', color: '#1a202c' },
  saveButton: { backgroundColor: '#3182ce', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 4 },
  saveButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dogCard: { backgroundColor: '#fffaf0', padding: 10, borderRadius: 4, marginBottom: 8, borderWidth: 1, borderColor: '#feebc8', borderLeftWidth: 4, borderLeftColor: '#dd6b20' },
  dogName: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  dogBreed: { fontSize: 12, color: '#718096', fontWeight: 'normal' },
  dogTrigger: { fontSize: 12, color: '#718096', marginTop: 2 },
  loadingText: { color: '#718096', fontStyle: 'italic', fontSize: 13 },
  copyrightContainer: { marginTop: 25, marginBottom: 15, alignItems: 'center' },
  copyrightText: { fontSize: 11, color: '#9ca3af', textAlign: 'center' }
});