// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function DogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dog, setDog] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [serviceType, setServiceType] = useState('Full Groom');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (id) fetchDogDetails();
  }, [id]);

  const fetchDogDetails = async () => {
    const { data, error } = await supabase.from('dog_profiles').select('*').eq('id', id).single();
    if (error) setErrorMsg(error.message);
    else setDog(data);
    setLoading(false);
  };

  const handleBookForDog = async (e: React.FormEvent) => {
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
        client_name: dog.client_name,
        dog_name: dog.dog_name,
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

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading dog profile...</p>;
  if (!dog) return <p className="p-6 text-sm text-red-500">Dog profile not found.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-2">
        <h1 className="text-xl font-bold text-gray-900">{dog.dog_name} ({dog.breed || 'Unknown Breed'})</h1>
        <p className="text-sm text-gray-600">Owner: {dog.client_name}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase">Book Appointment for {dog.dog_name}</h2>
        {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-md text-xs">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-emerald-100 text-emerald-700 rounded-md text-xs">{successMsg}</div>}

        <form onSubmit={handleBookForDog} className="space-y-4 text-xs">
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
            {submitting ? 'Booking...' : `Confirm Booking for ${dog.dog_name}`}
          </button>
        </form>
      </div>
    </div>
  );
}