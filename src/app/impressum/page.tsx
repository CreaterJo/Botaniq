"use client";

import React from 'react';
import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Angaben gem. § 5 TMG</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Botaniq<br />
              Jakob [Nachname]<br />
              [Straβe Hausnummer]<br />
              [PLZ Ort]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Kontakt</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              E-Mail: kontakt@botaniq.local<br />
              Telefon: nicht angegeben
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Verantwortlich fur den Inhalt gem. § 55 Abs. 2 RStV</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Jakob [Nachname]<br />
              [Straβe Hausnummer]<br />
              [PLZ Ort]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Haftung fur Inhalte</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Als Diensteanbieter sind wir fur eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Die Daten werden aus offentlichen Datenbanken (Trefle API / GBIF / iNaturalist) bezogen und durch eine
              KI-unterstutzte Bereinigung aufbereitet. Eine Gewahr fur die Vollstandigkeit und Richtigkeit der Inhalte
              wird nicht ubernommen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Haftung fur Links</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb können wir fur diese Inhalte keine Gewahr ubernehmen. Fur die Inhalte der verlinkten Seiten ist
              stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Urheberrecht</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Die Vervielfaltigung, Bearbeitung, Verbreitung und jede Art der Verwertung ausserhalb der
              Grenzen des Urheberrechtes bedurfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Pflanzendaten stammen aus API-Datenquellen (Trefle, GBIF, iNaturalist) und unterliegen deren jeweiligen
              Lizenzbedingungen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Streitschlichtung</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die Europaische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
