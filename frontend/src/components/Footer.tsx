import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-light border-t border-gray-200 mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-brand-gray">
        <p>&copy; {new Date().getFullYear()} Botaniq. Alle Rechte vorbehalten.</p>
        <div className="mt-2 text-sm">
          {/* Placeholder for links */}
          <a href="#" className="hover:text-brand-green mx-2">Impressum</a>
          |
          <a href="#" className="hover:text-brand-green mx-2">Datenschutz</a>
          |
          <a href="#" className="hover:text-brand-green mx-2">Quellen</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
