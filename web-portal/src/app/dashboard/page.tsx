'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  const supabase = createClient();

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayIndex = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointment Schedule</h1>
          <p className="text-xs text-gray-500">Manage your daily salon bookings and calendar slots</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="space-x-2">
            <button
              onClick={prevMonth}
              className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center font-medium text-xs text-gray-500 mb-2">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 bg-gray-50 rounded-md border border-dashed border-gray-200 opacity-50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const dateString = `${currentDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

            return (
              <Link
                key={dayNum}
                href={`/dashboard/calendar/${dateString}`}
                className="h-28 bg-white border border-gray-200 rounded-md p-2 flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition cursor-pointer text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{dayNum}</span>
                <span className="text-[10px] text-blue-600 font-medium">+ Add Booking</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}