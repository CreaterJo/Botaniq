import React from 'react';
import Link from 'next/link';
import NavMenu from './NavMenu';

const Header = () => {
  return (
    <header className="bg-brand-light shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-brand-green">
              Botaniq
            </Link>
          </div>

          {/* Navigation Menu */}
          <div>
             <NavMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
