import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const SEVERITY_STYLES: Record<string, string> = {
  minor: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  severe: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default async function IncidentsPage() {
  const supabase = await createClient();

  const { data: incidents, error } = await supabase
    .from('incident_reports')
    .select('id, incident_date, severity, bite_occurred, required_medical_attention, description, pets(id, name), profiles(full_name)')
    .order('incident_date', { ascending: false });

  if (error) {
    return <p className="text-red-600">Error loading incidents: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Incident Reports</h2>
        <span className="text-sm text-gray-500">{incidents?.length ?? 0} report(s)</span>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Pet</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Bite</th>
              <th className="px-4 py-3">Medical</th>
              <th className="px-4 py-3">Groomer</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {incidents?.map((incident) => {
              const pet = Array.isArray(incident.pets) ? incident.pets[0] : incident.pets;
              const groomer = Array.isArray(incident.profiles) ? incident.profiles[0] : incident.profiles;
              return (
                <tr key={incident.id} className="border-t">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(incident.incident_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{pet?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${SEVERITY_STYLES[incident.severity] ?? ''}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{incident.bite_occurred ? '🩸 Yes' : 'No'}</td>
                  <td className="px-4 py-3">{incident.required_medical_attention ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-gray-600">{groomer?.full_name ?? 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/incidents/${incident.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}