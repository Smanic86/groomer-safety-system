'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const supabase = createClient();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('staff_schedule')
      .select('*, dog_profiles(dog_name, client_name), staff_members(name, role)')
      .order('date', { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  // Simple calendar month helper logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointment Calendar</h1>
          <p className="text-sm text-gray-500">Manage and view scheduled grooming sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-gray-800">{monthName} {year}</span>
          <div className="space-x-1">
            <button onClick={prevMonth} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition">Prev</button>
            <button onClick={nextMonth} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition">Next</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-xs text-gray-500 mb-4">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 bg-gray-50 rounded-md border border-gray-100 opacity-40" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayAppointments = appointments.filter((app) => app.date === formattedDate);

            return (
              <div key={dayNum} className="h-28 bg-white rounded-md border border-gray-200 p-1.5 overflow-y-auto flex flex-col justify-between">
                <span className="text-xs font-bold text-gray-700">{dayNum}</span>
                <div className="space-y-1 mt-1">
                  {dayAppointments.map((app) => (
                    <div key={app.id} className="p-1 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-900">
                      <p className="font-semibold truncate">{app.dog_profiles?.dog_name || 'Dog'}</p>
                      <p className="text-[9px] text-blue-600">{app.time_slot} ({app.staff_members?.name})</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}