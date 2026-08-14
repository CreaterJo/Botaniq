import React from 'react';
import Link from 'next/link';
import NavMenu from './NavMenu';
import CleaningStatus from './CleaningStatus';

const Header = () => {
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-2xl font-bold text-brand-green hidden sm:block">
                  Botaniq
                </span>
              </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              <NavMenu />
            </div>
          </div>
        </div>
      </header>
      
      {/* Cleaning Status - wird nur angezeigt wenn aktiv */}
      <CleaningStatus />
    </>
  );
};

export default Header;