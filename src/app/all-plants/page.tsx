"use client";

import React, { useState, useMemo, useEffect } from 'react';
import PlantCard from '@/components/PlantCard';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';

const AllPlantsPage = () => {
  const { plants, loading, error } = usePlants();
  const [visibleCount, setVisibleCount] = useState(48);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Kategorien für Filter
  const categories = useMemo(() => {
    const cats = new Set(plants.map(p => p.kategorie).filter(Boolean));
    return Array.from(cats).sort();
  }, [plants]);

  // Gefilterte Pflanzen
  const filteredPlants = useMemo(() => {
    let filtered = plants;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.deutscherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.familie.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.kategorie === selectedCategory);
    }

    return filtered;
  }, [plants, searchQuery, selectedCategory]);

  // Unendliches Scrollen
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        setVisibleCount(prev => Math.min(prev + 48, filteredPlants.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredPlants.length]);

  // Zurücksetzen beim Filterwechsel
  useEffect(() => {
    setVisibleCount(48);
  }, [searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            <div className="mt-4 text-lg text-gray-600">Lade Pflanzen...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-12 text-red-500">
            <div className="text-4xl mb-4">❌</div>
            <div className="text-xl font-semibold mb-2">Fehler beim Laden</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-brand-green hover:text-emerald-600 mb-4 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alle Pflanzen</h1>
          <p className="text-lg text-gray-600">
            {filteredPlants.length.toLocaleString('de-DE')} von {plants.length.toLocaleString('de-DE')} Pflanzen
          </p>
        </div>

        {/* Filter Bereich */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suchfeld */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Pflanzen suchen
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nach Namen oder Familie suchen..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>

            {/* Kategorie Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Nach Kategorie filtern
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Aktive Filter */}
          {(searchQuery || selectedCategory) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Suche: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 hover:text-blue-600"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Kategorie: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 hover:text-green-600"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Alle Filter zurücksetzen
              </button>
            </div>
          )}
        </div>

        {/* Pflanzen Grid */}
        {filteredPlants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-12">
              {filteredPlants.slice(0, visibleCount).map((plant, index) => (
                <PlantCard key={plant.id ?? `${plant.name}-${index}`} plant={plant} />
              ))}
            </div>

            {/* Lade mehr Button */}
            {visibleCount < filteredPlants.length && (
              <div className="text-center mb-12">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + 48, filteredPlants.length))}
                  className="bg-brand-green text-white font-bold py-4 px-8 rounded-full hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  Weitere Pflanzen laden ({filteredPlants.length - visibleCount} verbleibend)
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Oder scrolle nach unten um automatisch mehr Pflanzen zu laden
                </p>
              </div>
            )}

            {/* Ende erreicht */}
            {visibleCount >= filteredPlants.length && filteredPlants.length > 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Du hast alle {filteredPlants.length.toLocaleString('de-DE')} Pflanzen gesehen!
                </h3>
                <p className="text-gray-600 mb-4">
                  Das sind alle Pflanzen in unserer Datenbank{searchQuery ? ` die "${searchQuery}" entsprechen` : ''}.
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                    }}
                    className="bg-brand-green text-white font-medium py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Alle Pflanzen anzeigen
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Keine Pflanzen gefunden</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory 
                ? 'Keine Pflanzen entsprechen deinen Suchkriterien.' 
                : 'Es sind noch keine Pflanzen in der Datenbank.'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="bg-brand-green text-white font-medium py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Alle Pflanzen anzeigen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPlantsPage;