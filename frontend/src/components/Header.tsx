import React from 'react';
import Link from 'next/link';
import Search from './Search';

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

          {/* Search and Menu */}
          <div className="flex items-center space-x-4">
            <Search />
            {/* Placeholder for Burger Menu */}
            <button className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
