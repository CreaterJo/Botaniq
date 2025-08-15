import React from 'react';
import Search from './Search';

const Hero = () => {
  return (
    <div className="bg-brand-green-light py-16 sm:py-24 rounded-lg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-green mb-4">
          Pflanzen entdecken
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Finde die perfekte Pflanze für dein Zuhause, deinen Garten oder Balkon.
        </p>
        <div className="max-w-xl mx-auto">
          <Search />
        </div>
      </div>
    </div>
  );
};

export default Hero;
