import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

const SEVERITY_STYLES: Record<string, string> = {
  minor: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  severe: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: incident, error } = await supabase
    .from('incident_reports')
    .select(`
      id, incident_date, severity, bite_occurred, bite_location,
      required_medical_attention, description, image_urls,
      is_insurance_reported, insurance_claim_ref,
      pets(id, name, breed, temperament_rating, trigger_flags),
      profiles(full_name),
      risk_assessments(overall_risk_level, assessment_date)
    `)
    .eq('id', id)
    .single();

  if (error || !incident) {
    return <p className="text-red-600">Incident not found.</p>;
  }

  const pet = Array.isArray(incident.pets) ? incident.pets[0] : incident.pets;
  const groomer = Array.isArray(incident.profiles) ? incident.profiles[0] : incident.profiles;
  const linkedAssessment = Array.isArray(incident.risk_assessments)
    ? incident.risk_assessments[0]
    : incident.risk_assessments;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/incidents" className="text-blue-600 text-sm">← Back to incidents</Link>

      <div className="flex items-center justify-between mt-4 mb-2">
        <h2 className="text-2xl font-bold">Incident: {pet?.name ?? 'Unknown Pet'}</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${SEVERITY_STYLES[incident.severity] ?? ''}`}>
          {incident.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-500 mb-6">
        {new Date(incident.incident_date).toLocaleString()} • Reported by {groomer?.full_name ?? 'Unknown'}
      </p>

      <div className="rounded-lg border bg-white p-4 mb-4 space-y-2">
        <p><span className="font-semibold">Bite occurred:</span> {incident.bite_occurred ? `Yes (${incident.bite_location ?? 'location not specified'})` : 'No'}</p>
        <p><span className="font-semibold">Required medical attention:</span> {incident.required_medical_attention ? 'Yes' : 'No'}</p>
        {linkedAssessment && (
          <p>
            <span className="font-semibold">Pre-groom risk level at time of incident:</span>{' '}
            {linkedAssessment.overall_risk_level.toUpperCase()} (assessed {new Date(linkedAssessment.assessment_date).toLocaleDateString()})
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
      </div>

      {incident.image_urls?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Photos</h3>
          <div className="flex flex-wrap gap-3">
            {incident.image_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={url}
                  alt={`Incident photo ${i + 1}`}
                  width={160}
                  height={160}
                  className="rounded-lg object-cover border"
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/dashboard/pets/${pet?.id}`}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-white text-sm font-semibold"
        >
          View Pet Profile
        </Link>
                <a
          href={`/api/incidents/${incident.id}/pdf`}
          className="inline-block rounded bg-gray-800 px-4 py-2 text-white text-sm font-semibold"
        >
          Export PDF
        </a>
      </div>
    </div>
  );
}