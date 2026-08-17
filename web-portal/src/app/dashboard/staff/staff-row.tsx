'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Member = {
  id: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
};

export default function StaffRow({
  member,
  currentUserId,
}: {
  member: Member;
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isSelf = member.id === currentUserId;

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !member.is_active })
      .eq('id', member.id);

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      router.refresh();
    }
  }

  return (
    <tr className="border-t">
      <td className="px-4 py-3 font-medium">
        {member.full_name} {isSelf && <span className="text-gray-400 text-xs">(you)</span>}
      </td>
      <td className="px-4 py-3 capitalize">{member.role}</td>
      <td className="px-4 py-3 text-gray-600">{member.phone ?? '—'}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-bold ${
            member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {member.is_active ? 'ACTIVE' : 'DEACTIVATED'}
        </span>
      </td>
      <td className="px-4 py-3">
        {!isSelf && (
          <button
            onClick={toggleActive}
            disabled={loading}
            className="text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? '...' : member.is_active ? 'Deactivate' : 'Reactivate'}
          </button>
        )}
      </td>
    </tr>
  );
}