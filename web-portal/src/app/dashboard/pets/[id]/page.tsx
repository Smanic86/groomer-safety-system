import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const FLAG_LABELS: Record<string, string> = {
  nail_clipper_aggressive: 'Nail Clipper Aggressive',
  muzzle_required: 'Muzzle Required',
  sensitive_ears: 'Sensitive Ears',
};

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, name, breed, temperament_rating, trigger_flags, vet_notes, clients(full_name, email, phone)')
    .eq('id', id)
    .single();

  if (error || !pet) {
    return <p className="text-red-600">Pet not found.</p>;
  }

  const isHighRisk = pet.temperament_rating === 'aggressive' || pet.temperament_rating === 'reactive';
  const clientInfo = Array.isArray(pet.clients) ? pet.clients[0] : pet.clients;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/clients" className="text-blue-600 text-sm">← Back to clients</Link>

      <h2 className="text-2xl font-bold mt-4">{pet.name}</h2>
      <p className="text-gray-500 mb-4">
        {pet.breed ?? 'Unknown breed'} • Owner: {clientInfo?.full_name ?? 'Unknown'}
      </p>

      <span
        className={`inline-block rounded-full px-3 py-1 text-sm font-bold mb-6 ${
          isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        Temperament: {pet.temperament_rating.toUpperCase()}
      </span>

      {pet.trigger_flags?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">⚠️ Trigger Flags</h3>
          <ul className="space-y-1">
            {pet.trigger_flags.map((flag: string) => (
              <li key={flag} className="text-red-700 font-medium">
                • {FLAG_LABELS[flag] ?? flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pet.vet_notes && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Vet Notes</h3>
          <p className="text-gray-700">{pet.vet_notes}</p>
        </div>
      )}

      <div className="rounded-lg border bg-white p-4">
        <h3 className="font-semibold mb-2">Owner Contact</h3>
        <p className="text-sm text-gray-600">Email: {clientInfo?.email ?? '—'}</p>
        <p className="text-sm text-gray-600">Phone: {clientInfo?.phone ?? '—'}</p>
      </div>
    </div>
  );
}// Copyright © 2026 Groomer Safety Portal. All rights reserved.

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
          <div className="w-full h-40 bg-mint-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-700 font-semibold text-xs">
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