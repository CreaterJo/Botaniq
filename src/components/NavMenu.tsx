"use client";

import React, { useState, useMemo } from 'react';
import { usePlants } from '@/hooks/usePlants';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuData {
  [category: string]: Set<string>;
}

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { plants } = usePlants();

  const menuData = useMemo(() => {
    const data: MenuData = {};
    plants.forEach(plant => {
      if (plant.kategorie) {
        if (!data[plant.kategorie]) {
          data[plant.kategorie] = new Set();
        }
        if (plant.unterkategorie && plant.unterkategorie !== plant.kategorie) {
          data[plant.kategorie].add(plant.unterkategorie);
        }
      }
    });
    // Convert sets to sorted arrays
    const sortedData: { [key: string]: string[] } = {};
    Object.keys(data).sort().forEach(cat => {
      sortedData[cat] = Array.from(data[cat]).sort();
    });
    return sortedData;
  }, [plants]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
        aria-label="Menü öffnen"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Menü</h2>
              <ul className="space-y-4">
                {Object.keys(menuData).map(category => (
                  <li key={category}>
                    <h3 className="font-bold text-lg text-gray-800">{category}</h3>
                    {menuData[category].length > 0 && (
                      <ul className="pl-4 mt-2 space-y-2">
                        {menuData[category].map(subcategory => (
                          <li key={subcategory}>
                            <Link href={`/category/${subcategory}`} className="text-brand-gray hover:text-brand-green" onClick={toggleMenu}>
                              {subcategory}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavMenu;
