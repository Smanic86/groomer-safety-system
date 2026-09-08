import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ReportButton from '../components/ReportButton';

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const [shifts, setShifts] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState('');

  // Calendar state
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchShifts();
    fetchStaffMembers();
  }, []);

  async function fetchShifts() {
    const { data, error } = await supabase.from('staff_schedule').select('*');
    if (error) {
      console.log('Error fetching schedule:', error.message);
    } else if (data) {
      setShifts(data);
    }
  }

  async function fetchStaffMembers() {
    const { data, error } = await supabase.from('staff_members').select('*');
    if (error) {
      console.log('Error fetching staff list:', error.message);
    } else if (data) {
      setStaffList(data);
      if (data.length > 0) {
        setSelectedStaff(data[0].name);
      }
    }
  }

  async function handleAddShift() {
    if (!selectedStaff.trim() || !shiftDate.trim()) return;
    const { data, error } = await supabase.from('staff_schedule').insert([
      { 
        staff_name: selectedStaff.trim(), 
        date: shiftDate.trim(), 
        time: shiftTime.trim() || '9:00 AM - 5:00 PM' 
      }
    ]).select();

    if (!error && data) {
      setShifts([...shifts, data[0]]);
      setShiftDate('');
      setShiftTime('');
    } else if (error) {
      console.log('Error adding shift:', error.message);
    }
  }

  async function handleRemoveShift(id: any) {
    const { error } = await supabase.from('staff_schedule').delete().eq('id', id);
    if (!error) {
      setShifts(shifts.filter(item => item.id !== id));
    } else {
      console.log('Error removing shift:', error.message);
    }
  }

  // Generate calendar days for the current month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); // Blank padding cells
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDateString = `${monthNames[currentMonth]} ${day}, ${currentYear}`;
    calendarCells.push({ day, dateString: formattedDateString });
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Calendar Rota & Schedule</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Select Staff Member:</Text>
        <View style={styles.staffChipsContainer}>
          {staffList.length === 0 ? (
            <Text style={styles.subText}>No staff members found. Please add staff first.</Text>
          ) : (
            staffList.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={[
                  styles.chip,
                  selectedStaff === staff.name && styles.selectedChip
                ]}
                onPress={() => setSelectedStaff(staff.name)}
              >
                <Text style={[
                  styles.chipText,
                  selectedStaff === staff.name && styles.selectedChipText
                ]}>
                  {staff.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Date (e.g., September 14, 2026)..."
          placeholderTextColor="#a0aec0"
          value={shiftDate}
          onChangeText={setShiftDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Time Slot (e.g., 9:00 AM - 5:00 PM)..."
          placeholderTextColor="#a0aec0"
          value={shiftTime}
          onChangeText={setShiftTime}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddShift}>
          <Text style={styles.addButtonText}>Assign Shift</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Header Controls */}
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

      {/* Days of Week Header */}
      <View style={styles.weekDaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <Text key={index} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarCells.map((item, index) => {
          if (!item) {
            return <View key={`empty-${index}`} style={styles.calendarCellEmpty} />;
          }

          // Find shifts matching this exact day string or numeric day format
          const dayShifts = shifts.filter(s => s.date?.includes(`${item.day}`) && s.date?.toLowerCase().includes(monthNames[currentMonth].toLowerCase().substring(0, 3)));

          return (
            <TouchableOpacity 
              key={`day-${item.day}`} 
              style={styles.calendarCell}
              onPress={() => setShiftDate(item.dateString)}
            >
              <Text style={styles.cellDayNumber}>{item.day}</Text>
              {dayShifts.map(s => (
                <View key={s.id} style={styles.cellShiftBadge}>
                  <Text style={styles.cellShiftText} numberOfLines={1}>{s.staff_name}</Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scheduled List Breakdown */}
      <View style={styles.listSection}>
        <Text style={styles.sectionHeader}>All Assigned Shifts</Text>
        {shifts.length === 0 ? (
          <Text style={styles.emptyText}>No shifts scheduled yet.</Text>
        ) : (
          shifts.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <View>
                <Text style={styles.rowText}>{item.staff_name}</Text>
                <Text style={styles.subText}>{item.date} | {item.time}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveShift(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
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
  staffChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  chip: { backgroundColor: '#edf2f7', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e0' },
  selectedChip: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { color: '#4a5568', fontSize: 14, fontWeight: '500' },
  selectedChipText: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, padding: 10, backgroundColor: '#fff', color: '#1a202c' },
  addButton: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 6 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b6cb0', padding: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  monthTitleText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  monthNavText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  weekDaysRow: { flexDirection: 'row', backgroundColor: '#edf2f7', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#cbd5e0' },
  weekDayText: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#4a5568', fontSize: 13 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginBottom: 20 },
  calendarCellEmpty: { width: '14.28%', height: 75, backgroundColor: '#f7fafc', borderWidth: 0.5, borderColor: '#e2e8f0' },
  calendarCell: { width: '14.28%', height: 75, backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e2e8f0', padding: 4 },
  cellDayNumber: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  cellShiftBadge: { backgroundColor: '#ebf8ff', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 3, marginBottom: 2, borderWidth: 1, borderColor: '#bee3f8' },
  cellShiftText: { fontSize: 10, color: '#2b6cb0', fontWeight: '600' },
  listSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  rowItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  rowText: { fontSize: 16, color: '#2d3748', fontWeight: '600' },
  subText: { fontSize: 13, color: '#718096', marginTop: 3 },
  removeText: { color: '#e53e3e', fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 15, fontSize: 15 }
});