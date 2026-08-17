'use client';

import { useState } from 'react';

export default function InviteStaffForm({ businessId }: { businessId: string }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'groomer' | 'manager'>('groomer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName, // Mapped to snake_case as expected by API
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setMessage({ type: 'success', text: 'Staff invitation sent successfully!' });
      setEmail('');
      setFullName('');
      setRole('groomer');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="text-lg font-medium mb-4">Invite New Staff Member</h3>
      {message && (
        <div
          className={`p-3 rounded mb-4 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="px-3 py-2 border rounded-md text-sm flex-1"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 border rounded-md text-sm flex-1"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'groomer' | 'manager')}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="groomer">Groomer</option>
          <option value="manager">Manager</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </button>
      </form>
    </div>
  );
}