import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import LogoutButton from './logout-button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-bold">Groomer Safety Portal</h1>
          <p className="text-sm text-gray-500">
            {profile?.full_name ?? user.email} • {profile?.role ?? 'staff'}
          </p>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link href="/dashboard/clients" className="hover:text-blue-600">Clients & Pets</Link>
          <Link href="/dashboard/incidents" className="hover:text-blue-600">Incidents</Link>
          <Link href="/dashboard/staff" className="hover:text-blue-600">Staff</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}