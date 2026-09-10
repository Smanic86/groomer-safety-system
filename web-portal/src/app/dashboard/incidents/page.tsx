// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    // Fetch incidents and pets separately to avoid complex schema join errors
    const { data: incidentData, error: incidentError } = await supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (incidentError) {
      setErrorMsg(incidentError.message);
      setLoading(false);
      return;
    }

    const { data: petData } = await supabase.from('pets').select('id, dog_name, client_name');
    const petMap = new Map(petData?.map((p: any) => [p.id, p]) || []);

    // Merge pet details into incidents locally
    const enrichedIncidents = (incidentData || []).map((inc: any) => ({
      ...inc,
      pet: inc.pet_id ? petMap.get(inc.pet_id) : null,
    }));

    setIncidents(enrichedIncidents);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Incident & Safety Reports</h1>
        <p className="text-sm text-gray-500">Review pre-groom safety evaluations and logged behavioral incidents.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
          Error loading incidents: {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-6">
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading reports...</p>
        ) : incidents.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No incident reports recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Dog: {incident.pet?.dog_name || 'Unknown Pet'} 
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        (Owner: {incident.pet?.client_name || 'N/A'})
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Logged on: {new Date(incident.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                    Safety Log
                  </span>
                </div>
                <p className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-100">
                  {incident.notes || incident.description || 'No additional notes provided.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}