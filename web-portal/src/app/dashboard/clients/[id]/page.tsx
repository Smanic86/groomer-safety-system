// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function PetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [serviceType, setServiceType] = useState('Full Groom');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (id) fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
    if (error) setErrorMsg(error.message);
    else {
      setPet(data);
      setNewNote(data.notes || '');
    }
    setLoading(false);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase
      .from('pets')
      .update({ notes: newNote })
      .eq('id', id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Profile notes updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleBookForPet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('appointments').insert([
      {
        user_id: user.id,
        client_name: pet.client_name || pet.owner_name,
        dog_name: pet.dog_name || pet.name,
        service_type: serviceType,
        appointment_date: appointmentDate,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Appointment booked successfully!');
      setTimeout(() => router.push('/dashboard/calendar'), 1500);
    }
    setSubmitting(false);
  };

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading pet profile...</p>;
  if (!pet) return <p className="p-6 text-sm text-red-500">Pet profile not found.</p>;

  const petName = pet.dog_name || pet.name || 'Unknown Pet';
  const ownerName = pet.client_name || pet.owner_name || 'Unknown Owner';
  const petPhoto = pet.photo_url || pet.image_url || pet.photo;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 items-start">
        {petPhoto ? (
          <img
            src={petPhoto}
            alt={petName}
            className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-28 h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium">
            No Photo
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
              <p className="text-sm text-gray-600">Breed: {pet.breed || 'Unknown Breed'}</p>
              <p className="text-sm text-gray-600">Owner: {ownerName}</p>
            </div>
            {pet.on_cancellation_list && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md">
                On Cancellation List
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase">Grooming & Safety Notes</h2>
        <form onSubmit={handleSaveNotes} className="space-y-3 text-xs">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            placeholder="Log temperament, behavioral quirks, matting details, or special handling notes..."
            className="w-full p-3 border rounded-md text-black focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md transition"
          >
            Save Notes
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase">Book Appointment for {petName}</h2>
        {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-md text-xs">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-emerald-100 text-emerald-700 rounded-md text-xs">{successMsg}</div>}

        <form onSubmit={handleBookForPet} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Appointment Date</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md text-black"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-black bg-white"
            >
              <option value="Full Groom">Full Groom</option>
              <option value="Bath & Brush">Bath & Brush</option>
              <option value="Nail Trim">Nail Trim</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            {submitting ? 'Booking...' : `Confirm Booking for ${petName}`}
          </button>
        </form>
      </div>
    </div>
  );
}