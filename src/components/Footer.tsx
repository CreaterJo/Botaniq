import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <h2 className="text-xl font-bold text-brand-green">Botaniq</h2>
            </div>
            <p className="text-brand-gray text-sm max-w-xs">
              Deine moderne Pflanzen-Referenz mit KI-unterstützter Datenbereinigung und übersichtlicher Navigation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Pflanzen
            </h3>
            <ul className="space-y-2">
              <li><Link href="/all-plants" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Alle Pflanzen</Link></li>
              <li><Link href="/blooming" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Blühende Pflanzen</Link></li>
              <li><Link href="/families" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Nach Familien</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Entdecken
            </h3>
            <ul className="space-y-2">
              <li><Link href="/families" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Pflanzenfamilien</Link></li>
              <li><Link href="/blooming" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Saisonale Pflanzen</Link></li>
              <li><Link href="/all-plants" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Vollständige Liste</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Informationen
            </h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Impressum</Link></li>
              <li><Link href="#" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Datenschutz</Link></li>
              <li><Link href="/about" className="text-sm text-brand-gray hover:text-brand-green transition-colors">Über Botaniq</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-brand-gray">
            &copy; {new Date().getFullYear()} Botaniq. Mit ❤️ für Pflanzen gemacht.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Datenquelle: Trefle API • KI-Bereinigung aktiv
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;