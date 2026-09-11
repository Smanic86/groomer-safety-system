// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './logout-button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard Overview', href: '/dashboard' },
    { name: 'Client Directory', href: '/dashboard/clients' },
    { name: 'Calendar & Bookings', href: '/dashboard/calendar' },
    { name: 'Client Intake', href: '/dashboard/intake' },
    { name: 'Pet Profiles', href: '/dashboard/pets' },
    { name: 'Safety & Compliance', href: '/dashboard/compliance' },
    { name: 'Incident Reports', href: '/dashboard/incidents' },
    { name: 'Staff Management', href: '/dashboard/staff' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h1 className="text-base font-bold text-gray-900">Paws & Style Salon Portal</h1>
            <p className="text-xs text-gray-500 mt-0.5">Professional Canine Grooming & Safety</p>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}