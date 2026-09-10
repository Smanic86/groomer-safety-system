// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const petId = resolvedParams.id;

  const [pet, setPet] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  // Booking state
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPetData();
    fetchStaff();
  }, [petId]);

  const fetchPetData = async () => {
    const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
    if (data) {
      setPet(data);
      setNotes(data.notes || '');
    }
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff_members').select('*');
    if (data && data.length > 0) {
      setStaffList(data);
      setStaffId(data[0].id);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    setNotesSavedMsg(false);

    const { error } = await supabase.from('pets').update({ notes }).eq('id', petId);
    if (!error) {
      setNotesSavedMsg(true);
      setTimeout(() => setNotesSavedMsg(false), 2000);
    }
    setSavingNotes(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('staff_schedule').insert([
      { user_id: user.id, dog_id: petId, staff_id: staffId, date, time_slot: timeSlot },
    ]);

    if (!error) {
      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    }
    setBookingLoading(false);
  };

  if (!pet) return <p className="p-6 text-sm text-gray-500">Loading pet profile...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{pet.dog_name}</h1>
          <p className="text-sm text-gray-500">Breed: {pet.breed || 'Unknown'} | Owner: {pet.client_name}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/clients')}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition"
        >
          ← Back to Directory
        </button>
      </div>

      {/* Notes Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Pet & Grooming Notes</h2>
        <form onSubmit={handleSaveNotes} className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter temperament notes, grooming preferences, medical sensitivities..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
          />
          <div className="flex justify-between items-center">
            {notesSavedMsg && <span className="text-xs font-semibold text-green-600">Notes saved successfully!</span>}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={savingNotes}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Book Appointment Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Schedule Appointment for {pet.dog_name}</h2>
        {bookingSuccess && <div className="p-3 bg-green-100 text-green-700 text-sm rounded-md font-semibold">Booked successfully!</div>}

        <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-xs"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Assign Groomer</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-xs"
            >
              {staffList.map((member) => (
                <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={bookingLoading || bookingSuccess}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition"
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}