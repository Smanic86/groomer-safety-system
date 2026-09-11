// Copyright © 2026 Groomer Safety Portal. All rights reserved.

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    .select('id, dog_name, breed, temperament_rating, trigger_flags, vet_notes, photo_url, client_name, client_email, client_phone')
    .eq('id', id)
    .single();

  if (error || !pet) {
    return <p className="text-red-600">Pet not found.</p>;
  }

  const isHighRisk = pet.temperament_rating === 'aggressive' || pet.temperament_rating === 'reactive';

  async function handlePhotoUpdate(formData: FormData) {
    'use server';
    const photoUrl = formData.get('photo_url') as string;
    const subClient = await createClient();
    await subClient.from('pets').update({ photo_url: photoUrl }).eq('id', id);
    revalidatePath(`/dashboard/clients/${id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/pets" className="text-emerald-700 font-semibold text-sm hover:underline">← Back to Pet Profiles</Link>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-start space-x-4">
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.dog_name} className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
          ) : (
            <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-semibold text-center p-1">
              No Photo
            </div>
          )}
          <div className="space-y-1 flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{pet.dog_name}</h2>
            <p className="text-sm text-gray-500">
              {pet.breed ?? 'Unknown breed'} • Owner: {pet.client_name ?? 'Unknown'}
            </p>
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold mt-1 ${
                isHighRisk ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              Temperament: {pet.temperament_rating ? pet.temperament_rating.toUpperCase() : 'STANDARD'}
            </span>
          </div>
        </div>

        {/* Photo Upload Form */}
        <form action={handlePhotoUpdate} className="pt-4 border-t border-gray-100 flex items-center space-x-2">
          <input
            type="url"
            name="photo_url"
            placeholder="Paste Image URL here (e.g. https://...)"
            defaultValue={pet.photo_url || ''}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs text-black"
          />
          <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition">
            Save Photo
          </button>
        </form>
      </div>

      {pet.trigger_flags?.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">⚠️ Trigger Flags</h3>
          <ul className="space-y-1">
            {pet.trigger_flags.map((flag: string) => (
              <li key={flag} className="text-red-700 font-medium text-sm">
                • {FLAG_LABELS[flag] ?? flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pet.vet_notes && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Vet Notes</h3>
          <p className="text-sm text-gray-700">{pet.vet_notes}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-2">Owner Contact</h3>
        <p className="text-sm text-gray-600">Name: {pet.client_name ?? '—'}</p>
        <p className="text-sm text-gray-600">Email: {pet.client_email ?? '—'}</p>
        <p className="text-sm text-gray-600">Phone: {pet.client_phone ?? '—'}</p>
      </div>
    </div>
  );
}