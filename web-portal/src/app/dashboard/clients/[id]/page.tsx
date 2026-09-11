// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PetProfilePage() {
  const params = useParams();
  const petId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (petId) fetchPetProfile();
  }, [petId]);

  const fetchPetProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pets').select('*').eq('id', petId).single();
    if (error) setErrorMsg(error.message);
    else setPet(data);
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}-${Math.random()}.${fileExt}`;
      const filePath = `dog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('pet-photos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('pets').update({ photo_url: publicUrl }).eq('id', petId);
      if (updateError) throw updateError;

      setPet({ ...pet, photo_url: publicUrl });
    } catch (err: any) {
      alert('Error uploading photo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const updatedNotes = pet.notes ? `${pet.notes}\n• ${newNote}` : `• ${newNote}`;
    const { error } = await supabase.from('pets').update({ notes: updatedNotes }).eq('id', petId);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setPet({ ...pet, notes: updatedNotes });
      setNewNote('');
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading pet profile...</div>;
  if (!pet) return <div className="p-8 text-sm text-red-600">Pet profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <Link href="/dashboard/clients" className="text-xs text-blue-600 hover:underline mb-2 inline-block">← Back to Directory</Link>
          <h1 className="text-2xl font-bold text-gray-900">{pet.dog_name}</h1>
          <p className="text-sm text-gray-500">Breed: {pet.breed || 'Unknown'} | Owner: {pet.client_name}</p>
        </div>
        <Link href={`#book`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md transition">
          Book Groom Appointment
        </Link>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">Error: {errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Photo & Owner / Vet Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">Pet Photo</h2>
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.dog_name} className="w-full h-48 object-cover rounded-md border" />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-400">No photo uploaded</div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Upload / Change Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="text-xs w-full text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">Contact & Vet</h2>
            <p><strong>Owner Email:</strong> {pet.client_email || 'Not provided'}</p>
            <p><strong>Owner Phone:</strong> {pet.client_phone || 'Not provided'}</p>
            <p><strong>Address:</strong> {pet.address || 'Not provided'}</p>
            <hr />
            <p><strong>Veterinary Practice:</strong> {pet.vet_name || 'Not provided'}</p>
            <p><strong>Vet Phone:</strong> {pet.vet_phone || 'Not provided'}</p>
          </div>
        </div>

        {/* Right Column: Notes & Compliance Audit Trail */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">Grooming & Behavior Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[120px] text-xs text-gray-700 whitespace-pre-wrap">
              {pet.notes || pet.medical_notes || pet.behavior_notes ? (
                <>
                  {pet.medical_notes && <p className="mb-2"><strong>Medical/Allergies:</strong> {pet.medical_notes}</p>}
                  {pet.behavior_notes && <p className="mb-2"><strong>Behavioral:</strong> {pet.behavior_notes}</p>}
                  {pet.notes && <p><strong>General Notes:</strong> {pet.notes}</p>}
                </>
              ) : (
                <span className="italic text-gray-400">No notes recorded yet.</span>
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea placeholder="Add a new observation or grooming note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-md text-black text-xs" />
              <button type="submit" className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-md transition">
                Add Note
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">UK Legal Compliance Audit</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`p-3 rounded border ${pet.gdpr_consent ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                <p className="font-bold">GDPR Consent</p>
                <p className="text-[10px] mt-1">{pet.gdpr_consent ? '✔ Accepted' : '❌ Not Logged'}</p>
              </div>
              <div className={`p-3 rounded border ${pet.vet_consent ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                <p className="font-bold">Vet Auth</p>
                <p className="text-[10px] mt-1">{pet.vet_consent ? '✔ Accepted' : '❌ Not Logged'}</p>
              </div>
              <div className={`p-3 rounded border ${pet.photo_consent ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                <p className="font-bold">Photo Consent</p>
                <p className="text-[10px] mt-1">{pet.photo_consent ? '✔ Accepted' : '❌ Declined'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}