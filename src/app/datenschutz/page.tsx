"use client";

import React from 'react';
import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutz</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Datenschutz auf einen Blick</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Uberblick darüber, was mit Ihren personenbezogenen
              Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen
              Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Datenerfassung auf dieser Website</h2>
            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Wer ist verantwortlich für die Datenerfassung?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die Daten werden von uns (Websitebetreiber) erfasst. Unsere Kontaktdaten finden Sie im Impressum.
            </p>

            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Wie erfassen wir Ihre Daten?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ihre Daten wird möglichst reibungslos erfasst, wenn Sie uns diese mitteilen — beispielsweisedurch Eingabe.
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.
              Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
            </p>

            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Wofür nutzen wir Ihre Daten?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
              Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>

            <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
              gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung
              oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben,
              können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Ihnen steht ein rechtlicher
              Anspruch gegen uns bezüglich der Speicherung Ihrer Daten zu. Zudem können Sie sich bei den
              zuständigen Aufsichtsbehörden beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Analyse-Tools und Werbung</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Diese Website verwendet keine Tracking- oder Analytics-Tools. Es findet keine Profilbildung
              oder Nutzerüberwachung statt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Plugins und Tools</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Diese Website nutzt keine externen Plugins oder Tracking-Tools von Drittanbietern.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Ihre Rechte</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sie haben das Recht:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Löschung Ihrer Daten zu verlangen (Recht auf Vergessenwerden)</li>
              <li>Einschränkung der Verarbeitung zu verlangen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
              <li>Widerspruch gegen die Verarbeitung einzulegen</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">
              Kontaktieren Sie uns jederzeit unter den Angaben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Änderungen</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand [aktuelles Datum].
              Aufgrund von weiterentwickelten Technologien oder geänderten rechtlichen Vorgaben kann es
              erforderlich werden, dass wir diese Datenschutzerklärung aktualisieren.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
