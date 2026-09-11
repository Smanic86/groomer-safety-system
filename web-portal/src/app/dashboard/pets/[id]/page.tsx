// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const { data, error } = await supabase.from('pets').select('*').order('dog_name', { ascending: true });
    if (error) setErrorMsg(error.message);
    if (data) setPets(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Canine Client Profiles</h1>
        <p className="text-sm text-gray-500">Manage all registered dogs, grooming history, and profile photos.</p>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {pet.photo_url ? (
                <img src={pet.photo_url} alt={pet.dog_name} className="w-full h-40 object-cover rounded-md border border-gray-100" />
              ) : (
                <div className="w-full h-40 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-700 font-semibold text-xs">
                  No Photo Uploaded
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-base">{pet.dog_name}</h3>
                <p className="text-xs text-gray-500">Breed: {pet.breed || 'Not specified'}</p>
                <p className="text-xs text-gray-600 mt-1">Owner: {pet.client_name}</p>
              </div>
            </div>
            <Link
              href={`/dashboard/clients/${pet.id}`}
              className="block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition"
            >
              View Full Profile & History →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}