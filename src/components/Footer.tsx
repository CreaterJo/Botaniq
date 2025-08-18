import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left Section: Logo and Tagline */}
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold text-brand-green">
              Botaniq
            </h2>
            <p className="mt-2 text-brand-gray max-w-xs">
              Deine moderne Pflanzen-Referenz mit über 250 detaillierten Pflanzenporträts und Pflegeanleitungen. Kostenlos und wissenschaftlich fundiert.
            </p>
          </div>

          {/* Right Section: Links */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Pflanzen</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Alle Pflanzen</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Zimmerpflanzen</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Gartenpflanzen</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Kräuter</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Kategorien</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Bäume</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Sträucher</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Gräser & Farne</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Rechtliches</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Impressum</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Datenschutz</Link></li>
                <li><Link href="#" className="text-base text-brand-gray hover:text-brand-green">Quellen</Link></li>
              </ul>
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-brand-gray">&copy; {new Date().getFullYear()} Botaniq. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
