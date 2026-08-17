import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InviteStaffForm from './invite-staff-form';
import StaffRow from './staff-row';

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, business_id')
    .eq('id', user.id)
    .single();

  const isAdmin = myProfile?.role === 'owner' || myProfile?.role === 'manager';

  if (!isAdmin) {
    return (
      <p className="text-red-600">
        You don&apos;t have permission to view staff management. Only owners and managers can access this page.
      </p>
    );
  }

  const { data: staff, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, is_active')
    .order('full_name');

  if (error) {
    return <p className="text-red-600">Error loading staff: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Staff Management</h2>
        <span className="text-sm text-gray-500">{staff?.length ?? 0} staff member(s)</span>
      </div>

      <InviteStaffForm businessId={myProfile!.business_id} />

      <div className="overflow-hidden rounded-lg border bg-white mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((member) => (
              <StaffRow key={member.id} member={member} currentUserId={user.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}