'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ClientsPage() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    const { data, error } = await supabase.from('dog_profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setDogs(data);
    }
  };

  const handleAddDog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in to add a dog profile.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('dog_profiles').insert([
      {
        user_id: user.id,
        dog_name: dogName,
        breed,
        client_name: clientName,
        on_cancellation_list: false,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setDogName('');
      setBreed('');
      setClientName('');
      fetchDogs();
    }
    setLoading(false);
  };

  // Quick seed helper for testing appointments and calendar workflow
  const handleAddTestData = async () => {
    setLoading(true);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in.');
      setLoading(false);
      return;
    }

    // Insert a test staff member first if none exist, then a dog
    const { data: staffData } = await supabase.from('staff_members').select('id').limit(1);
    let staffId = staffData?.[0]?.id;

    if (!staffId) {
      const { data: newStaff } = await supabase.from('staff_members').insert([
        { user_id: user.id, name: 'Sarah Jenkins', role: 'Senior Groomer' }
      ]).select('id').single();
      staffId = newStaff?.id;
    }

    const { error } = await supabase.from('dog_profiles').insert([
      { user_id: user.id, dog_name: 'Buster', breed: 'Shih Tzu', client_name: 'John Smith', on_cancellation_list: true },
      { user_id: user.id, dog_name: 'Luna', breed: 'Pomeranian Mix', client_name: 'Emma Watson', on_cancellation_list: false }
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      fetchDogs();
    }
    setLoading(false);
  };

  const toggleCancellationList = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('dog_profiles').update({ on_cancellation_list: !currentStatus }).eq('id', id);
    if (!error) {
      fetchDogs();
    }
  };

  const filteredDogs = dogs.filter(
    (d) =>
      d.dog_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
          Error: {errorMsg}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client & Pet Management</h1>
          <p className="text-sm text-gray-500">Add profiles manually or quickly seed test data to check bookings</p>
        </div>
        <button
          onClick={handleAddTestData}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-xs px-3 py-2 transition"
        >
          {loading ? 'Adding...' : '⚡ Quick Add Test Profiles & Staff'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Dog Profile</h2>
        <form onSubmit={handleAddDog} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
          />
          <input
            type="text"
            placeholder="Dog Name"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
          />
          <input
            type="text"
            placeholder="Breed (e.g. Shih Tzu)"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-black text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm px-4 py-2 transition"
          >
            {loading ? 'Adding...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Client & Pet Directory</h2>
          <input
            type="text"
            placeholder="Search dog or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-black text-sm w-64"
          />
        </div>

        <div className="divide-y divide-gray-200">
          {filteredDogs.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No dog profiles found. Click "Quick Add Test Profiles & Staff" above to instantly populate test entries!</p>
          ) : (
            filteredDogs.map((dog) => (
              <div key={dog.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {dog.dog_name}{' '}
                    <span className="text-xs font-normal text-gray-500">({dog.breed || 'Unknown breed'})</span>
                  </h3>
                  <p className="text-sm text-gray-600">Owner: {dog.client_name}</p>
                  {dog.on_cancellation_list && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
                      On Cancellation List
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleCancellationList(dog.id, dog.on_cancellation_list)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition ${
                      dog.on_cancellation_list
                        ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {dog.on_cancellation_list ? 'Remove from Cancellation List' : 'Add to Cancellation List'}
                  </button>
                  <Link
                    href={`/dashboard/clients/${dog.id}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}