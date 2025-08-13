"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePlants } from '@/hooks/usePlants';
import type { Plant } from './PlantCard';
import Link from 'next/link';

const Search = () => {
  const { plants } = usePlants();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Plant[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filteredPlants = plants.filter(plant =>
        plant.deutscherName.toLowerCase().includes(query.toLowerCase()) ||
        plant.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredPlants);
    } else {
      setResults([]);
    }
  }, [query, plants]);

  // Handle clicks outside the search component to close the results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="Pflanze suchen..."
        className="w-full sm:w-64 px-4 py-2 text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green"
      />
      {isFocused && results.length > 0 && (
        <div className="absolute mt-2 w-full sm:w-64 bg-white rounded-lg shadow-xl z-10">
          <ul>
            {results.slice(0, 5).map(plant => (
              <li key={plant.name}>
                <Link
                  href={`/plant/${encodeURIComponent(plant.name)}`}
                  className="block px-4 py-2 text-gray-800 hover:bg-brand-green-light"
                  onClick={() => {
                    setQuery('');
                    setIsFocused(false);
                  }}
                >
                  {plant.deutscherName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
