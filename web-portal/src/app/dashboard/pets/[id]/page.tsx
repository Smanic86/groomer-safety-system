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
}