// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardIntakePage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDataAndSubmissions();
  }, []);

  const fetchUserDataAndSubmissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data } = await supabase.from('pets').select('*').eq('user_id', user.id);
      if (data) setSubmissions(data);
    }
    setLoading(false);
  };

  const intakeLink = userId ? `${window.location.origin}/intake?salon=${userId}` : '';

  const handleCopyLink = () => {
    if (!intakeLink) return;
    navigator.clipboard.writeText(intakeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
        <h1 className="text-xl font-bold text-gray-900">Client Intake Management</h1>
        <p className="text-sm text-gray-500">Copy your unique client intake link to text or email to clients so they can fill out their details before arrival.</p>
        
        {intakeLink && (
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-2">
            <input
              type="text"
              readOnly
              value={intakeLink}
              className="w-full px-3 py-2 bg-gray-50 border rounded-md text-xs text-gray-700 select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs transition whitespace-nowrap"
            >
              {copied ? 'Copied Link!' : 'Copy Client Link'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase">Received Client Submissions ({submissions.length})</h2>
        {loading ? (
          <p className="text-xs text-gray-500">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No intake submissions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{item.dog_name || item.name} ({item.breed || 'Unknown Breed'})</p>
                  <p className="text-gray-600">Owner: <span className="font-medium text-gray-900">{item.client_name || item.owner_name}</span></p>
                  {item.vet_name && <p className="text-gray-500">Vet: {item.vet_name} ({item.vet_phone || 'No phone'})</p>}
                </div>
                <a
                  href={`/dashboard/clients/${item.id}`}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md transition"
                >
                  View Full Profile & Notes
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}