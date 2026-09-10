'use client';

import { useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DaySchedulePage({ params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = use(params);
  const date = resolvedParams.date;

  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [dogName, setDogName] = useState('');
  const [groomer, setGroomer] = useState('Main Groomer');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('safety_evaluations').insert([
      {
        user_id: user.id,
        client_name: `Groomer: ${groomer}`,
        dog_name: dogName,
        breed: `Date: ${date} @ ${timeSlot}`,
        temperament: 'Scheduled',
      },
    ]);

    if (!error) {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Book Appointment for {date}</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Calendar
        </button>
      </div>

      <form onSubmit={handleAddAppointment} className="space-y-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Dog Name & Breed</label>
          <input
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            placeholder="Buster (Shih Tzu)"
          />
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
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-50"
        >
          {loading ? 'Saving Appointment...' : 'Confirm Appointment'}
        </button>
      </form>
    </main>
  );
}