'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DogBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dogId = resolvedParams.id;

  const [dog, setDog] = useState<any>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [groomer, setGroomer] = useState('Main Groomer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchDog();
  }, [dogId]);

  const fetchDog = async () => {
    const { data } = await supabase.from('dogs').select('*').eq('id', dogId).single();
    if (data) setDog(data);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('appointments').insert([
      {
        user_id: user.id,
        dog_id: dogId,
        date,
        time_slot: timeSlot,
        groomer,
      },
    ]);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/clients');
        router.refresh();
      }, 1000);
    }
    setLoading(false);
  };

  if (!dog) return <p className="p-6">Loading profile...</p>;

  return (
    <main className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Book for {dog.dog_name}</h1>
          <p className="text-sm text-gray-500">Owner: {dog.client_name} ({dog.breed || 'General'})</p>
        </div>
        <button onClick={() => router.push('/dashboard/clients')} className="text-sm text-blue-600 hover:underline">
          Back to Clients
        </button>
      </div>

      {success && (
        <div className="p-3 bg-green-100 text-green-700 text-sm rounded-md font-semibold">
          Appointment successfully booked! Returning to clients...
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
          >
            <option value="09:00 AM">09:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Groomer</label>
          <select
            value={groomer}
            onChange={(e) => setGroomer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
          >
            <option value="Main Groomer">Main Groomer</option>
            <option value="Assistant Groomer">Assistant Groomer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Booking...' : success ? 'Booked!' : 'Confirm Booking'}
        </button>
      </form>
    </main>
  );
}