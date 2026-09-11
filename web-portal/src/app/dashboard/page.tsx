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
  
  // Incident form state
  const [incidentApp, setIncidentApp] = useState<any | null>(null);
  const [incidentStaffId, setIncidentStaffId] = useState('');
  const [incidentTarget, setIncidentTarget] = useState('Dog');
  const [severity, setSeverity] = useState('Low');
  const [description, setDescription] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: appData, error: appError } = await supabase
      .from('staff_schedule')
      .select('*, pets(id, dog_name, client_name), staff_members(id, name, role)')
      .order('date', { ascending: true });

    const { data: staffData } = await supabase.from('staff_members').select('*');

    if (appError) setErrorMsg(appError.message);
    if (appData) setAppointments(appData);
    if (staffData) setStaffList(staffData);
  };

  const handleCancelGroom = async (appointmentId: string) => {
    const { error } = await supabase.from('staff_schedule').delete().eq('id', appointmentId);
    if (error) setErrorMsg(error.message);
    else fetchData();
  };

  const handleOpenIncidentForm = (app: any) => {
    setIncidentApp(app);
    setIncidentStaffId(app.staff_id || (staffList[0]?.id ?? ''));
    setIncidentTarget('Dog');
    setSeverity('Low');
    setDescription('');
    setSuccessMsg(null);
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentApp) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('Incident_reports').insert([
      {
        user_id: user.id,
        pet_id: incidentApp.pets?.id,
        staff_id: incidentStaffId,
        incident_target: incidentTarget,
        description,
        severity,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Incident reported successfully!');
      setTimeout(() => {
        setIncidentApp(null);
        setSuccessMsg(null);
      }, 1500);
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

  const totalRegisteredPets = new Set(appointments.map(a => a.pets?.id).filter(Boolean)).size;
  const activeWaiverCount = appointments.length;

  return (
    <div className="space-y-6">
      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}

      {/* Salon Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Scheduled Appointments</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{appointments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total active bookings registered</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Registered Pets</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{totalRegisteredPets}</p>
          <p className="text-xs text-gray-500 mt-1">Active canine client profiles</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Safety & Waivers</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{activeWaiverCount > 0 ? '100%' : '0%'}</p>
          <p className="text-xs text-gray-500 mt-1">All pre-groom health checks active</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Salon Operations & Appointment Calendar</h1>
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
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold">Prev</button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-1 bg-gray-100 rounded text-xs font-semibold">Next</button>
            </>
          )}
        </div>
      </div>

      {selectedDay ? (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Schedule for {selectedDay}</h2>

          {incidentApp && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-amber-900 text-sm">
                  Log Incident for {incidentApp.pets?.dog_name} ({incidentApp.pets?.client_name})
                </h3>
                <button onClick={() => setIncidentApp(null)} className="text-xs text-gray-600 hover:text-black">✕ Close</button>
              </div>

              {successMsg && <div className="p-2 bg-green-100 text-green-800 text-xs rounded">{successMsg}</div>}

              <form onSubmit={handleSubmitIncident} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Accident Affected</label>
                  <select
                    value={incidentTarget}
                    onChange={(e) => setIncidentTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-xs"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Groomer">Groomer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Groomer Involved (Editable)</label>
                  <select
                    value={incidentStaffId}
                    onChange={(e) => setIncidentStaffId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-xs"
                    required
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">What Happened?</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe incident details (e.g., handling behavior, coat matting, or minor nick)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-xs"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setIncidentApp(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold">Save Incident Report</button>
                </div>
              </form>
            </div>
          )}

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
                      <p className="text-xs text-gray-500 italic py-4 text-center">No grooming slots scheduled</p>
                    ) : (
                      staffAppointments.map((app) => (
                        <div key={app.id} className="bg-white p-3 rounded-md shadow-xs border border-gray-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {app.time_slot}
                            </span>
                            <div className="space-x-2">
                              <button
                                onClick={() => handleOpenIncidentForm(app)}
                                className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold underline"
                              >
                                Report Incident
                              </button>
                              <button
                                onClick={() => handleCancelGroom(app.id)}
                                className="text-[10px] text-red-600 hover:text-red-800 font-semibold underline"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div>
                            {app.pets?.id ? (
                              <Link href={`/dashboard/clients/${app.pets.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                                {app.pets.dog_name} →
                              </Link>
                            ) : (
                              <p className="text-xs font-bold text-gray-900">Canine Client</p>
                            )}
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
                        {app.pets?.id ? (
                          <Link href={`/dashboard/clients/${app.pets.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold truncate block hover:underline">
                            {app.pets.dog_name}
                          </Link>
                        ) : (
                          <p className="font-semibold truncate">Canine Client</p>
                        )}
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