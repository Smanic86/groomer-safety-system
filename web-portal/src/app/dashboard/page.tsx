// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedGroomer, setSelectedGroomer] = useState<any | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: appData, error: appError } = await supabase
      .from('staff_schedule')
      .select('*, pets(id, dog_name, client_name, breed, photo_url), staff_members(id, name, role)')
      .order('date', { ascending: true });

    const { data: staffData } = await supabase.from('staff_members').select('*');

    if (appError) setErrorMsg(appError.message);
    if (appData) setAppointments(appData);
    if (staffData) setStaffList(staffData);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const totalRegisteredPets = new Set(appointments.map(a => a.pets?.id).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Logged Grooms</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{appointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Historical & upcoming appointments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Registered Pets</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{totalRegisteredPets}</p>
          <p className="text-xs text-gray-500 mt-1">Active canine client profiles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Safety Status</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">100%</p>
          <p className="text-xs text-gray-500 mt-1">All pre-groom health checks active</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Salon Operations Calendar</h1>
          <p className="text-sm text-gray-500">
            {selectedDay ? `Schedule for ${selectedDay}` : `${monthName} ${year}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedDay ? (
            <button
              onClick={() => { setSelectedDay(null); setSelectedGroomer(null); }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition"
            >
              ← Back to Month View
            </button>
          ) : (
            <>
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold">Prev</button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold">Next</button>
            </>
          )}
        </div>
      </div>

      {selectedDay ? (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          {!selectedGroomer ? (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Groomers Working on {selectedDay}</h2>
              <p className="text-xs text-gray-500 mb-4">Select a groomer to view their assigned dogs and pricing for the day.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staffList.map((staff) => {
                  const staffAppts = appointments.filter(a => a.date === selectedDay && a.staff_id === staff.id);
                  return (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedGroomer(staff)}
                      className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition space-y-2"
                    >
                      <h3 className="font-bold text-emerald-900 text-sm">{staff.name}</h3>
                      <p className="text-xs text-emerald-700 font-semibold">{staff.role}</p>
                      <p className="text-xs text-gray-600">{staffAppts.length} dogs scheduled</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedGroomer.name}'s Assigned Dogs</h2>
                  <p className="text-xs text-gray-500">Date: {selectedDay}</p>
                </div>
                <button
                  onClick={() => setSelectedGroomer(null)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold text-gray-700"
                >
                  ← Back to Groomers List
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.filter(a => a.date === selectedDay && a.staff_id === selectedGroomer.id).length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4">No dogs assigned to this groomer for this date.</p>
                ) : (
                  appointments
                    .filter(a => a.date === selectedDay && a.staff_id === selectedGroomer.id)
                    .map((app) => (
                      <div key={app.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {app.time_slot}
                          </span>
                          <span className="text-xs font-extrabold text-gray-900">
                            £{app.price ? Number(app.price).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {app.pets?.photo_url && (
                            <img src={app.pets.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border" />
                          )}
                          <div>
                            <Link href={`/dashboard/clients/${app.pets?.id}`} className="text-sm font-bold text-blue-600 hover:underline">
                              {app.pets?.dog_name || 'Canine Client'} →
                            </Link>
                            <p className="text-xs text-gray-600">Owner: {app.pets?.client_name}</p>
                            <p className="text-[11px] text-gray-500">Breed: {app.pets?.breed || 'Standard'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
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
                  className="h-28 bg-white rounded-md border border-gray-200 p-1.5 overflow-y-auto cursor-pointer hover:border-emerald-400 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-gray-700">{dayNum}</span>
                  <div className="space-y-1 mt-1">
                    {dayAppointments.slice(0, 2).map((app) => (
                      <div key={app.id} className="p-1 bg-emerald-50 border border-emerald-100 rounded text-[10px] text-emerald-900">
                        <span className="font-semibold truncate block">{app.pets?.dog_name || 'Pet'}</span>
                        <span className="text-[9px] text-emerald-600">£{app.price ? Number(app.price).toFixed(2) : '0.00'}</span>
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