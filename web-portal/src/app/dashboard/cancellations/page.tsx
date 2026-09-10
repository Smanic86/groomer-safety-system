// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function CancellationsPage() {
  const [cancellations, setCancellations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCancellations();
  }, []);

  const fetchCancellations = async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('on_cancellation_list', true)
      .order('dog_name', { ascending: true });

    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setCancellations(data);
    }
    setLoading(false);
  };

  const removeFromCancellationList = async (id: string) => {
    const { error } = await supabase.from('pets').update({ on_cancellation_list: false }).eq('id', id);
    if (!error) {
      fetchCancellations();
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading cancellation list...</p>;

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Cancellation / Standby List</h1>
        <p className="text-sm text-gray-500">Pets waiting for an earlier slot or cancellation opening</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="divide-y divide-gray-200">
          {cancellations.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              No pets currently on the cancellation list. You can add pets to this list directly from the Clients & Pets directory.
            </p>
          ) : (
            cancellations.map((pet) => (
              <div key={pet.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {pet.dog_name} <span className="text-xs font-normal text-gray-500">({pet.breed || 'Unknown breed'})</span>
                  </h3>
                  <p className="text-sm text-gray-600">Owner: {pet.client_name}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => removeFromCancellationList(pet.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                  >
                    Remove from List
                  </button>
                  <Link
                    href={`/dashboard/clients/${pet.id}`}
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