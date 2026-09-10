'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [clientName, setClientName] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [temperament, setTemperament] = useState('Calm');
  const [mattedCoat, setMattedCoat] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    const { data } = await supabase
      .from('safety_evaluations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEvaluations(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('safety_evaluations').insert([
      {
        user_id: user.id,
        client_name: clientName,
        dog_name: dogName,
        breed,
        temperament,
        matted_coat: mattedCoat,
        medical_notes: medicalNotes,
      },
    ]);

    if (!error) {
      setClientName('');
      setDogName('');
      setBreed('');
      setTemperament('Calm');
      setMattedCoat(false);
      setMedicalNotes('');
      fetchEvaluations();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Groomer Safety Portal</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition"
          >
            Log Out
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">New Pre-Groom Safety Evaluation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dog Name</label>
                <input
                  type="text"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="Buster"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="Shih Tzu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperament</label>
                <select
                  value={temperament}
                  onChange={(e) => setTemperament(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                >
                  <option value="Calm">Calm</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Aggressive">Aggressive</option>
                  <option value="Energetic">Energetic</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mattedCoat}
                    onChange={(e) => setMattedCoat(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Severely Matted Coat</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical & Behavior Notes</label>
              <textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Sensitive paws, reactive to dryer near ears..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Evaluation'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Evaluations</h2>
          {evaluations.length === 0 ? (
            <p className="text-gray-500 text-sm">No safety checks logged yet.</p>
          ) : (
            <div className="space-y-3">
              {evaluations.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-md flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.dog_name} <span className="text-xs font-normal text-gray-500">({item.breed || 'Unknown breed'})</span></h3>
                    <p className="text-sm text-gray-600">Client: {item.client_name} | Temperament: <span className="font-medium">{item.temperament}</span> {item.matted_coat && <span className="text-red-600 font-semibold">| Matted Coat</span>}</p>
                    {item.medical_notes && <p className="text-xs text-gray-500 mt-1">Notes: {item.medical_notes}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}