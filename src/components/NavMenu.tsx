"use client";

import React, { useState, useMemo } from 'react';
import { usePlants } from '@/hooks/usePlants';
import { usePlantCleaner } from '@/hooks/usePlantCleaner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { plants } = usePlants();
  const { getCachedCategoryTree } = usePlantCleaner();

  const menuData = useMemo(() => {
    try {
      const categoryTree = getCachedCategoryTree();
      
      if (categoryTree && Object.keys(categoryTree).length > 0) {
        return {
          categories: categoryTree,
          families: []
        };
      }

      // Fallback-Kategorien
      const categories: { [key: string]: Set<string> } = {};
      const families: Set<string> = new Set();
      
      plants.forEach(plant => {
        if (plant.kategorie && plant.kategorie !== 'Unbekannt') {
          if (!categories[plant.kategorie]) {
            categories[plant.kategorie] = new Set();
          }
          if (plant.unterkategorie && plant.unterkategorie !== 'Unbekannt') {
            categories[plant.kategorie].add(plant.unterkategorie);
          }
        }
        
        if (plant.familie && plant.familie !== 'Unbekannt') {
          families.add(plant.familie);
        }
      });

      const categoryTreeFallback: any = {};
      Object.keys(categories).forEach(mainCat => {
        categoryTreeFallback[mainCat] = {};
        categories[mainCat].forEach(subCat => {
          categoryTreeFallback[mainCat][subCat] = ['Verschiedene'];
        });
      });

      return {
        categories: categoryTreeFallback,
        families: Array.from(families).sort().slice(0, 20)
      };
    } catch (error) {
      return {
        categories: {},
        families: []
      };
    }
  }, [plants, getCachedCategoryTree]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green transition-colors"
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
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 right-0 bg-white shadow-xl z-50 max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-brand-green">Pflanzen Entdecken</h2>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Menü schließen"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Hauptnavigation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      href="/all-plants"
                      className="flex items-center justify-center p-5 bg-brand-green-light rounded-xl text-brand-green hover:bg-brand-green hover:text-white transition-colors text-lg font-semibold"
                      onClick={toggleMenu}
                    >
                      🌿 Alle Pflanzen
                    </Link>
                    <Link
                      href="/blooming"
                      className="flex items-center justify-center p-5 bg-brand-green-light rounded-xl text-brand-green hover:bg-brand-green hover:text-white transition-colors text-lg font-semibold"
                      onClick={toggleMenu}
                    >
                      🌸 Blühende Pflanzen
                    </Link>
                  </div>

                  {/* KI-Kategorien */}
                  {Object.keys(menuData.categories).length > 0 && (
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 mb-4">Pflanzen Kategorien</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(menuData.categories).map(([mainCategory, subCategories]) => (
                          <div key={mainCategory} className="border border-gray-200 rounded-lg p-4">
                            <button
                              onClick={() => toggleCategory(mainCategory)}
                              className="w-full flex justify-between items-center text-left mb-2"
                            >
                              <span className="font-semibold text-gray-800 text-lg">{mainCategory}</span>
                              <svg 
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedCategories.has(mainCategory) ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <AnimatePresence>
                              {expandedCategories.has(mainCategory) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2">
                                    {Object.keys(subCategories as any).map((subCategory) => (
                                      <Link
                                        key={subCategory}
                                        href={`/category/${encodeURIComponent(subCategory)}`}
                                        className="block py-2 px-3 text-gray-600 hover:text-brand-green hover:bg-gray-50 transition-colors rounded"
                                        onClick={toggleMenu}
                                      >
                                        {subCategory}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavMenu;