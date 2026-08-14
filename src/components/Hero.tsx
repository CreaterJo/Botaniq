import React, { useState, useEffect } from 'react';
import Search from './Search';
import { usePlants } from '@/hooks/usePlants';

const Hero = () => {
  const { plants, loading } = usePlants();
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    if (plants.length > 0) {
      setStats({
        total: plants.length
      });
    }
  }, [plants]);

  return (
    <div className="bg-gradient-to-br from-brand-green-light to-emerald-100 py-20 sm:py-28 rounded-2xl mx-4 mt-4 shadow-lg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold text-brand-green mb-6">
          Botaniq
        </h1>
        
        {/* Pflanzenanzahl groß in der Mitte */}
        <div className="mb-8">
          <div className="text-6xl sm:text-8xl font-bold text-brand-green mb-2">
            {stats.total.toLocaleString('de-DE')}
          </div>
          <p className="text-2xl text-gray-700">
            Pflanzen in unserer Datenbank
          </p>
        </div>

        {/* Suchbereich */}
        <div className="max-w-2xl mx-auto">
          <Search />
        </div>
      </div>
    </div>
  );
};

export default Hero;