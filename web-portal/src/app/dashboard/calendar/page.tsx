// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [clientName, setClientName] = useState('');
  const [dogName, setDogName] = useState('');
  const [service, setService] = useState('Full Groom');
  const [groomerName, setGroomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchAppointments();
    fetchPets();
    fetchStaff();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
    if (error) setErrorMsg(error.message);
    else if (data) setAppointments(data);
  };

  const fetchPets = async () => {
    const { data, error } = await supabase.from('pets').select('*');
    if (error) setErrorMsg(error.message);
    else if (data) setPets(data);
  };

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staff').select('*');
    if (error) {
      // Fallback if staff table doesn't exist yet
      setStaff([{ id: '1', name: 'Main Groomer' }]);
    } else if (data && data.length > 0) {
      setStaff(data);
    } else {
      setStaff([{ id: '1', name: 'Main Groomer' }]);
    }
  };

  const handlePetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const petId = e.target.value;
    setSelectedPetId(petId);
    if (!petId) {
      setDogName('');
      setClientName('');
      return;
    }
    const foundPet = pets.find((p) => p.id === petId);
    if (foundPet) {
      setDogName(foundPet.dog_name || foundPet.name || '');
      setClientName(foundPet.client_name || foundPet.owner_name || '');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('appointments').insert([
      {
        user_id: user.id,
        client_name: clientName,
        dog_name: dogName,
        service_type: service,
        groomer_name: groomerName || 'Primary Groomer',
        appointment_date: selectedDate,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Appointment booked successfully!');
      setSelectedPetId('');
      setClientName('');
      setDogName('');
      setGroomerName('');
      fetchAppointments();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setLoading(false);
  };

  const generateUpcomingDays = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      days.push({ dateString, displayLabel });
    }
    return days;
  };

  const upcomingDays = generateUpcomingDays();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Appointment Scheduler</h1>
        <p className="text-sm text-gray-500">Click any day on the grid below, pick a pet, assign a groomer, and book.</p>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}
      {successMsg && <div className="p-4 bg-emerald-100 text-emerald-700 rounded-md text-sm">{successMsg}</div>}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase">Select a Date</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {upcomingDays.map((day) => {
            const isSelected = selectedDate === day.dateString;
            return (
              <button
                key={day.dateString}
                type="button"
                onClick={() => setSelectedDate(day.dateString)}
                className={`p-3 rounded-lg border text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <p className="text-xs font-semibold">{day.displayLabel}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {appointments.filter((a) => a.appointment_date === day.dateString).length} booked
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase">Book for {selectedDate}</h2>
          <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Select Registered Pet</label>
              <select
                value={selectedPetId}
                onChange={handlePetSelect}
                className="w-full px-3 py-2 border rounded-md text-black bg-white"
              >
                <option value="">-- Choose Pet Profile --</option>
                {pets.map((pet) => {
                  const pName = pet.dog_name || pet.name || 'Unnamed Pet';
                  const cName = pet.client_name || pet.owner_name || 'Unknown Owner';
                  return (
                    <option key={pet.id} value={pet.id}>
                      {pName} ({pet.breed || 'Unknown'}) - {cName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-black"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Dog Name</label>
              <input
                type="text"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-black"
                placeholder="Buster"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Assign Groomer</label>
              <select
                value={groomerName}
                onChange={(e) => setGroomerName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black bg-white"
                required
              >
                <option value="">-- Select Groomer --</option>
                {staff.map((s) => (
                  <option key={s.id || s.name} value={s.name || s.staff_name}>
                    {s.name || s.staff_name || 'Groomer'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black bg-white"
              >
                <option value="Full Groom">Full Groom</option>
                <option value="Bath & Brush">Bath & Brush</option>
                <option value="Nail Trim">Nail Trim</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase">Upcoming Scheduled Appointments</h2>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">No appointments scheduled yet.</p>
            ) : (
              appointments.map((app) => (
                <div key={app.id} className="p-3 bg-gray-50 border rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{app.dog_name} ({app.service_type})</p>
                    <p className="text-gray-600">Client: {app.client_name} | Groomer: <span className="font-semibold text-gray-900">{app.groomer_name || 'Primary Groomer'}</span></p>
                    <p className="text-blue-600 font-semibold mt-0.5">Date: {app.appointment_date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}