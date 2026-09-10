import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-gray-900 text-lg">Groomer Safety Portal</span>
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Dashboard
              </Link>
              <Link href="/dashboard/clients" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Clients & Pets
              </Link>
              <Link href="/dashboard/incidents" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Incidents
              </Link>
              <Link href="/dashboard/staff" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Staff
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
    </div>
  );
}