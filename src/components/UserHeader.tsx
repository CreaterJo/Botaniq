"use client";

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserHeader: React.FC = () => {
  const { username, favoriteCount, isOffline, loading: userLoading } = useUser();
  const [showInfo, setShowInfo] = useState(false);

  if (userLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-green-light hover:bg-brand-green hover:text-white transition-colors"
      >
        {/* User Icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>

        {/* Username */}
        <span className="text-sm font-medium hidden sm:block">{username}</span>

        {/* Favorites Count */}
        {favoriteCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-brand-green text-white rounded-full">
            {favoriteCount}
          </span>
        )}

        {/* Offline Indicator */}
        {isOffline && (
          <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Offline-Modus" />
        )}
      </button>

      {/* Info Dropdown */}
      <AnimatePresence>
        {showInfo && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowInfo(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-brand-green text-white">
                <p className="text-sm font-medium">Willkommen!</p>
                <p className="text-xs opacity-90">Dein Username: {username}</p>
              </div>

              {/* Stats */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Favoriten</span>
                  <span className="font-medium text-brand-green">{favoriteCount}</span>
                </div>

                {isOffline && (
                  <div className="flex items-center space-x-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span>Offline-Modus aktiv</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Deine Favoriten werden automatisch gespeichert und sind auf allen Geräten verfügbar.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserHeader;
