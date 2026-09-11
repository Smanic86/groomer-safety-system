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
    else setPet(data);
    setLoading(false);
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{petName}</h1>
            <p className="text-sm text-gray-600 mt-0.5">Breed: {pet.breed || 'Unknown Breed'}</p>
            <p className="text-sm text-gray-600">Owner: {ownerName}</p>
          </div>
          {pet.on_cancellation_list && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-md">
              On Cancellation List
            </span>
          )}
        </div>

        <div className="border-t pt-4 grid grid-cols-2 gap-4 text-xs text-gray-700">
          <div>
            <span className="font-semibold text-gray-900 block mb-1">Temperament / Notes</span>
            <p>{pet.notes || pet.temperament || 'No special notes logged for this pet.'}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-900 block mb-1">Record ID</span>
            <p className="font-mono text-gray-500">{pet.id}</p>
          </div>
        </div>
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