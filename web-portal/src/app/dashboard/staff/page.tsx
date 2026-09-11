// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Groomer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff_members').select('*').order('name', { ascending: true });
    if (error) setErrorMsg(error.message);
    else setStaffList(data || []);
    setLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in to add staff.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('staff_members').insert([
      {
        user_id: user.id,
        name,
        role,
        email,
        phone,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(true);
      setName('');
      setEmail('');
      setPhone('');
      fetchStaff();
      setTimeout(() => setSuccessMsg(false), 2500);
    }
    setLoading(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    if (error) setErrorMsg(error.message);
    else fetchStaff();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Staff & Groomer Management</h1>
        <p className="text-sm text-gray-500">Manage team members assigned to appointments and safety incident logs.</p>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}
      {successMsg && <div className="p-4 bg-green-100 text-green-800 text-sm font-semibold rounded-md">Staff member added successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Staff Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">Add New Staff</h2>
          <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md text-black" placeholder="e.g. Sarah Jenkins" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Role / Speciality</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black bg-white">
                <option value="Senior Groomer">Senior Groomer</option>
                <option value="Junior Groomer">Junior Groomer</option>
                <option value="Bather / Prep">Bather / Prep</option>
                <option value="Salon Manager">Salon Manager</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black" placeholder="sarah@grooming.com" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black" placeholder="07123 456789" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition">
              {loading ? 'Adding...' : 'Save Staff Member'}
            </button>
          </form>
        </div>

        {/* Staff Directory List */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">Current Team</h2>
          {loading && staffList.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">Loading staff...</p>
          ) : staffList.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No staff members added yet.</p>
          ) : (
            <div className="space-y-3">
              {staffList.map((staff) => (
                <div key={staff.id} className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-sm">{staff.name}</p>
                    <p className="text-blue-600 font-semibold">{staff.role}</p>
                    <p className="text-gray-500">{staff.email || 'No email'} | {staff.phone || 'No phone'}</p>
                  </div>
                  <button onClick={() => handleDeleteStaff(staff.id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded transition">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}