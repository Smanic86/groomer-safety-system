'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase/client';

export default function PetProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchPetProfile() {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setPet(data);
      setLoading(false);
    }
    fetchPetProfile();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading pet profile...</div>;
  }

  if (!pet) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">Pet profile not found.</p>
        <Link href="/dashboard/pets" className="text-green-600 hover:underline">&larr; Back to Canine Clients</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/dashboard/pets" className="text-sm text-green-600 hover:underline mb-4 inline-block">
        &larr; Back to Canine Clients
      </Link>
      
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs shrink-0 overflow-hidden">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              'No Photo'
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Breed: {pet.breed || 'Unknown'}</p>
            <p className="text-sm text-gray-600 mt-1">Owner: {pet.owner_name || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-1">Contact: {pet.contact_number || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Grooming & Safety Notes</h2>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
            {pet.notes || 'No special safety or behavioral notes recorded for this dog.'}
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">
        &copy; 2026 Groomer Safety Portal. All rights reserved.
      </div>
    </div>
  );
}