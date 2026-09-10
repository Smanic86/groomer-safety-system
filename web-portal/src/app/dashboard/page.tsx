// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: appData, error: appError } = await supabase
      .from('staff_schedule')
      .select('*, pets(dog_name, client_name), staff_members(id, name, role)')
      .order('date', { ascending: true });

    const { data: staffData } = await supabase.from('staff_members').select('*');

    if (appError) setErrorMsg(appError.message);
    if (appData) setAppointments(appData);
    if (staffData) setStaffList(staffData);
  };

  const handleCancelGroom = async (appointmentId: string) => {
    const { error } = await supabase.from('staff_schedule').delete().eq('id', appointmentId);
    if (error) {
      setErrorMsg(error.message);
    } else {
      fetchData();
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const groomerColors = [
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-600' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-600' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-600' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-600' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', badge: 'bg-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointment Calendar</h1>
          <p className="text-sm text-gray-500">
            {selectedDay ? `Daily Schedule: ${selectedDay}` : `${monthName} ${year}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedDay ? (
            <button
              onClick={() => setSelectedDay(null)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition"
            >
              ← Back to Month View
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>

      {selectedDay ? (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
            Schedule for {selectedDay}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staffList.map((staff, index) => {
              const theme = groomerColors[index % groomerColors.length];
              const staffAppointments = appointments.filter(
                (app) => app.date === selectedDay && app.staff_id === staff.id
              );

              return (
                <div key={staff.id} className={`rounded-lg border ${theme.border} ${theme.bg} p-4 space-y-4`}>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className={`font-bold text-sm ${theme.text}`}>{staff.name}</h3>
                    <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${theme.badge}`}>
                      {staff.role}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {staffAppointments.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-4 text-center">No bookings scheduled</p>
                    ) : (
                      staffAppointments.map((app) => (
                        <div key={app.id} className="bg-white p-3 rounded-md shadow-xs border border-gray-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {app.time_slot}
                            </span>
                            <button
                              onClick={() => handleCancelGroom(app.id)}
                              className="text-[10px] text-red-600 hover:text-red-800 font-semibold underline"
                            >
                              Cancel Groom
                            </button>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{app.pets?.dog_name || 'Pet'}</p>
                            <p className="text-[11px] text-gray-600">Owner: {app.pets?.client_name}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
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
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(formattedDate)}
                  className="h-28 bg-white rounded-md border border-gray-200 p-1.5 overflow-y-auto cursor-pointer hover:border-blue-400 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-gray-700">{dayNum}</span>
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 2).map((app) => (
                      <div key={app.id} className="p-1 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-900">
                        <p className="font-semibold truncate">{app.pets?.dog_name || 'Pet'}</p>
                        <p className="text-[9px] text-blue-600">{app.time_slot}</p>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <span className="text-[9px] text-gray-500 font-semibold pl-0.5">
                        +{dayAppointments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}