'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/supabase/client';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPets() {
      const { data, error } = await supabase.from('pets').select('*');
      if (data) setPets(data);
      setLoading(false);
    }
    fetchPets();
  }, []);

  const filteredPets = pets.filter((pet) =>
    pet.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canine Client Profiles</h1>
          <p className="text-sm text-gray-600">Manage all registered dogs, grooming history, and profile photos.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search dog name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading pets...</p>
      ) : filteredPets.length === 0 ? (
        <p className="text-gray-500">No dogs found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    'No Photo Uploaded'
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                <p className="text-xs text-gray-500">Breed: {pet.breed}</p>
                <p className="text-xs text-gray-600 mt-1">Owner: {pet.owner_name}</p>
              </div>
              <Link
                href={`/dashboard/pets/${pet.id}`}
                className="mt-4 block text-center w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                View Full Profile & History &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-12 text-center text-xs text-gray-400">
        &copy; 2026 Groomer Safety Portal. All rights reserved.
      </div>
    </div>
  );
}