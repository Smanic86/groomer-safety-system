// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function IntakeFormPage() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');
  
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  
  // Legal Consents
  const [gdprConsent, setGdprConsent] = useState(false);
  const [vetConsent, setVetConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprConsent || !vetConsent) {
      setErrorMsg('Mandatory GDPR and Veterinary emergency consents must be accepted to proceed.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg('You must be logged in to submit an intake record.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('pets').insert([
      {
        user_id: user.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        address,
        dog_name: dogName,
        breed,
        medical_notes: medicalNotes,
        behavior_notes: behaviorNotes,
        vet_name: vetName,
        vet_phone: vetPhone,
        gdpr_consent: gdprConsent,
        vet_consent: vetConsent,
        photo_consent: photoConsent,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(true);
      setTimeout(() => {
        router.push('/dashboard/clients');
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New Client & Pet Intake Form</h1>
        <p className="text-sm text-gray-500">Collects essential grooming, vet, and UK legal compliance data.</p>
      </div>

      {errorMsg && <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">{errorMsg}</div>}
      {successMsg && <div className="p-4 bg-green-100 text-green-700 text-sm font-semibold rounded-md">Intake profile created successfully! Redirecting...</div>}

      <form onSubmit={handleIntakeSubmit} className="space-y-6">
        {/* Owner Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">1. Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Owner Full Name *" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="px-3 py-2 border rounded-md text-black text-xs" />
            <input type="email" placeholder="Email Address" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="px-3 py-2 border rounded-md text-black text-xs" />
            <input type="tel" placeholder="Phone Number *" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="px-3 py-2 border rounded-md text-black text-xs" />
            <input type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} className="px-3 py-2 border rounded-md text-black text-xs" />
          </div>
        </div>

        {/* Pet Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">2. Pet & Medical Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Dog Name *" value={dogName} onChange={(e) => setDogName(e.target.value)} required className="px-3 py-2 border rounded-md text-black text-xs" />
            <input type="text" placeholder="Breed" value={breed} onChange={(e) => setBreed(e.target.value)} className="px-3 py-2 border rounded-md text-black text-xs" />
            <textarea placeholder="Medical Conditions / Allergies" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={2} className="px-3 py-2 border rounded-md text-black text-xs md:col-span-2" />
            <textarea placeholder="Behavioral Traits / Handling Quirks" value={behaviorNotes} onChange={(e) => setBehaviorNotes(e.target.value)} rows={2} className="px-3 py-2 border rounded-md text-black text-xs md:col-span-2" />
          </div>
        </div>

        {/* Vet Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">3. Veterinary Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Veterinary Practice Name" value={vetName} onChange={(e) => setVetName(e.target.value)} className="px-3 py-2 border rounded-md text-black text-xs" />
            <input type="tel" placeholder="Vet Phone Number" value={vetPhone} onChange={(e) => setVetPhone(e.target.value)} className="px-3 py-2 border rounded-md text-black text-xs" />
          </div>
        </div>

        {/* UK Legal Consents */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">4. UK Legal & Regulatory Declarations</h2>
          
          <label className="flex items-start space-x-2 cursor-pointer text-xs text-gray-700">
            <input type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} required className="mt-0.5" />
            <span><strong>UK GDPR Consent (Mandatory):</strong> I consent to my personal and pet data being stored and processed for grooming appointments and safety records in compliance with the Data Protection Act 2018.</span>
          </label>

          <label className="flex items-start space-x-2 cursor-pointer text-xs text-gray-700">
            <input type="checkbox" checked={vetConsent} onChange={(e) => setVetConsent(e.target.checked)} required className="mt-0.5" />
            <span><strong>Emergency Veterinary Authorization (Mandatory):</strong> In the event of a medical emergency where I cannot be reached, I authorise immediate veterinary treatment and accept financial responsibility for all veterinary costs incurred (Animal Welfare Act 2006 compliance).</span>
          </label>

          <label className="flex items-start space-x-2 cursor-pointer text-xs text-gray-700">
            <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} className="mt-0.5" />
            <span><strong>Marketing & Social Media Consent (Optional):</strong> I give permission for photos of my pet to be used on company social media and promotional platforms.</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs transition">
          {loading ? 'Submitting Intake...' : 'Save Intake & Complete Profile'}
        </button>
      </form>
    </div>
  );
}