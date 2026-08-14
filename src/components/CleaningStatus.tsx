"use client";

import React from 'react';
import { usePlants } from '@/hooks/usePlants';

const CleaningStatus: React.FC = () => {
  const { cleaningProgress, enhancementProgress, loading } = usePlants();

  if (!loading && cleaningProgress === 0 && enhancementProgress === 0) return null;

  const totalProgress = Math.max(cleaningProgress, enhancementProgress);
  
  const getStatusMessage = () => {
    if (enhancementProgress > 0) {
      return "🤖 KI verbessert Pflanzen-Daten...";
    } else if (cleaningProgress > 0) {
      return "🧹 Daten werden verarbeitet...";
    } else {
      return "🌿 Lade Pflanzen...";
    }
  };

  const getSubMessage = () => {
    if (enhancementProgress > 0) {
      return "KI ergänzt fehlende Informationen...";
    } else if (cleaningProgress > 0) {
      return "Pflanzen werden kategorisiert...";
    } else {
      return "Daten werden vorbereitet...";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white p-6 rounded-xl shadow-2xl border border-brand-green max-w-sm z-50 animate-fade-in">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-lg mb-1">
            {getStatusMessage()}
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            {getSubMessage()}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-brand-green to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600">
            <span>{totalProgress}% abgeschlossen</span>
            {enhancementProgress > 0 && (
              <span className="text-brand-green">KI aktiv</span>
            )}
          </div>
        </div>
      </div>
      
      {totalProgress === 100 && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-xl animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="text-white font-bold text-lg">✅ Fertig!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleaningStatus;