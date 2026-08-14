"use client";

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-brand-green hover:text-emerald-600 mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Über Botaniq</h1>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Die moderne Pflanzen-Referenz
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Entdecke, lerne und pflege deine Pflanzen mit intelligenter Technologie
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-brand-green-light rounded-xl p-6">
                <div className="text-3xl mb-4">🌿</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Umfassende Datenbank</h3>
                <p className="text-gray-600">
                  Tausende Pflanzen mit detaillierten Informationen zu Pflege, Standort und Besonderheiten. 
                  Ständig erweitert und aktualisiert.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">KI-unterstützt</h3>
                <p className="text-gray-600">
                  Intelligente Datenbereinigung und Kategorisierung für optimale Nutzererfahrung und 
                  verlässliche Informationen.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Intuitive Navigation</h3>
                <p className="text-gray-600">
                  Einfache Suche, Filterung nach Kategorien und Familien. Finde genau die Pflanzen, 
                  die du suchst.
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Modernes Design</h3>
                <p className="text-gray-600">
                  Responsive Oberfläche, die auf allen Geräten perfekt funktioniert. 
                  Sauberes, benutzerfreundliches Interface.
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-r from-brand-green to-emerald-500 rounded-2xl p-8 text-white mb-12">
              <h3 className="text-2xl font-bold mb-4">Unsere Mission</h3>
              <p className="text-lg leading-relaxed">
                Botaniq vereint traditionelles Pflanzenwissen mit modernster Technologie. 
                Unser Ziel ist es, Pflanzenpflege für jeden zugänglich zu machen - ob erfahrener Gärtner 
                oder Pflanzen-Neuling. Durch KI-gestützte Datenverarbeitung und eine intuitive Benutzeroberfläche 
                schaffen wir die ultimative Referenz für Pflanzenliebhaber.
              </p>
            </div>

            {/* Technical Details */}
            <div className="border-t border-gray-200 pt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technische Umsetzung</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Next.js 14</h4>
                  <p className="text-sm text-gray-600">Moderne React Framework</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Tailwind CSS</h4>
                  <p className="text-sm text-gray-600">Utility-first Design</p>
                </div>
                <div>
                  <div className="text-2xl mb-2">🔧</div>
                  <h4 className="font-semibold text-gray-800 mb-1">TypeScript</h4>
                  <p className="text-sm text-gray-600">Type-sicherer Code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}