// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ComplianceExportPage() {
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const supabase = createClient();

  const exportCSV = async (table: string, filename: string) => {
    setExporting(true);
    setSuccessMsg(null);
    const { data, error } = await supabase.from(table).select('*');

    if (error || !data || data.length === 0) {
      alert('No data available to export or error fetching data.');
      setExporting(false);
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row: any) => 
      Object.values(row).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
    setSuccessMsg(`${filename}.csv downloaded successfully for UK audit records.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">UK Regulatory Compliance & Audits</h1>
        <p className="text-sm text-gray-500">Export immutable CSV records for GDPR, Data Protection Act, and Animal Welfare standards.</p>
      </div>

      {successMsg && <div className="p-4 bg-green-100 text-green-800 text-xs font-semibold rounded-md">{successMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase">Pets & Consent Records</h2>
          <p className="text-xs text-gray-500">Download all client intake, emergency vet authorisations, and GDPR consent logs.</p>
          <button 
            disabled={exporting}
            onClick={() => exportCSV('pets', 'pets_compliance_export')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition"
          >
            Export Pets CSV
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase">Incident Report Logs</h2>
          <p className="text-xs text-gray-500">Download complete safety accident logs for insurance and regulatory review.</p>
          <button 
            disabled={exporting}
            onClick={() => exportCSV('incident_reports', 'incident_reports_export')}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded transition"
          >
            Export Incidents CSV
          </button>
        </div>
      </div>
    </div>
  );
}