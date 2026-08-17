import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, full_name, email, phone, pets(id, name, temperament_rating, trigger_flags)')
    .order('full_name');

  if (error) {
    return <p className="text-red-600">Error loading clients: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Clients & Pets</h2>
        <span className="text-sm text-gray-500">{clients?.length ?? 0} client(s)</span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Client Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Pets</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-4 py-3 font-medium">{client.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{client.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{client.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {client.pets?.map((pet: any) => (
                      <Link
                        key={pet.id}
                        href={`/dashboard/pets/${pet.id}`}
                        className="rounded-full border px-3 py-1 hover:bg-gray-50"
                      >
                        {pet.name}
                        {pet.trigger_flags?.length > 0 && (
                          <span className="ml-1 text-red-600 font-semibold">
                            ⚠ {pet.trigger_flags.length}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}