// Copyright © 2026 Groomer Safety Portal. All rights reserved.

'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

function IntakeFormContent() {
  const searchParams = useSearchParams();
  const salonId = searchParams.get('salon');
  const supabase = createClient();

  const [clientName, setClientName] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonId) {
      setErrorMsg('Invalid or missing salon link. Please ask your groomer for the correct link.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await supabase.from('pets').insert([
      {
        user_id: salonId,
        client_name: clientName,
        dog_name: dogName,
        breed,
        vet_name: vetName,
        vet_phone: vetPhone,
        notes: `Medical: ${medicalHistory}\nBehavior: ${behaviorNotes}`,
        on_cancellation_list: false,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
      setSubmitting(false);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center space-y-3">
          <h1 className="text-xl font-bold text-gray-900">Form Submitted Successfully!</h1>
          <p className="text-xs text-gray-600">Thank you! Your groomer has received your dog and veterinary details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client & Dog Intake Form</h1>
          <p className="text-xs text-gray-500 mt-1">Please provide your details and your dog's veterinary and medical information.</p>
        </div>

        {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded-md text-xs">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="John Smith"
                className="w-full px-3 py-2 border rounded-md text-black"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Dog Name</label>
              <input
                type="text"
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                required
                placeholder="Buster"
                className="w-full px-3 py-2 border rounded-md text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Shih Tzu"
                className="w-full px-3 py-2 border rounded-md text-black"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Veterinary Practice</label>
              <input
                type="text"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                placeholder="St Helens Vets"
                className="w-full px-3 py-2 border rounded-md text-black"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Vet Phone Number</label>
              <input
                type="text"
                value={vetPhone}
                onChange={(e) => setVetPhone(e.target.value)}
                placeholder="01744 000000"
                className="w-full px-3 py-2 border rounded-md text-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Medical History / Allergies / Conditions</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              rows={3}
              placeholder="Any surgeries, skin allergies, joint issues, or medications..."
              className="w-full p-3 border rounded-md text-black"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Behavior & Handling Notes</label>
            <textarea
              value={behaviorNotes}
              onChange={(e) => setBehaviorNotes(e.target.value)}
              rows={3}
              placeholder="Nail trimming tolerance, dryer sensitivity, biting history, or matting..."
              className="w-full p-3 border rounded-md text-black"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            {submitting ? 'Submitting...' : 'Submit Intake Form'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PublicIntakePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading intake form...</div>}>
      <IntakeFormContent />
    </Suspense>
  );
}