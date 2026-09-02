"use client";

import React from 'react';
import Link from 'next/link';
import { usePlants } from '@/hooks/usePlants';

const Footer = () => {
  const { plants, loading, lastSync } = usePlants();

  const plantCount = plants?.length ?? 0;

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-emerald-700">Botaniq</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Pflanzenreferenz mit KI-unterstutzter Datenbereinigung.
              {plantCount > 0 && (
                <span> {plantCount.toLocaleString('de-DE')} Arten geladen.</span>
              )}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li><Link href="/all-plants" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Alle Pflanzen</Link></li>
              <li><Link href="/blooming" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Bluhende Pflanzen</Link></li>
              <li><Link href="/families" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Nach Familien</Link></li>
              <li><Link href="/about" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Uber Botaniq</Link></li>
            </ul>
          </div>

          {/* Daten */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Datenquellen
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">Trefle API (GBIF + iNaturalist)</li>
              <li className="text-sm text-gray-500">
                {loading
                  ? 'Lade Daten…'
                  : plantCount > 0
                    ? `${plantCount.toLocaleString('de-DE')} Pflanzen`
                    : 'Keine Daten geladen'}
              </li>
              {lastSync && (
                <li className="text-xs text-gray-400">
                  Zuletzt aktualisiert: {new Date(lastSync).toLocaleDateString('de-DE')}
                </li>
              )}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              <li><Link href="/impressum" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">Datenschutz</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Botaniq — Pflanzenreferenz
          </p>
          <p className="text-xs text-gray-400">
            Daten: Trefle API · Bereinigung: KI (Local AI Helper)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
