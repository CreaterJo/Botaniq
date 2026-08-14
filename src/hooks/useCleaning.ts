"use client";

import { useContext } from 'react';
import { CleaningContext } from '@/context/CleaningContext';

export const useCleaning = () => {
  const context = useContext(CleaningContext);
  if (context === undefined) {
    throw new Error('useCleaning must be used within a CleaningProvider');
  }
  return context;
};