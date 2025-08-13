import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Plant } from '@/components/PlantCard'; // Re-use the Plant type

interface UsePlantsResult {
  plants: Plant[];
  loading: boolean;
  error: string | null;
}

export const usePlants = (): UsePlantsResult => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        // The file is in the public directory, so it can be fetched directly
        const response = await axios.get<Plant[]>('/data/plants.json');
        setPlants(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(`Failed to fetch plant data: ${err.message}`);
        } else {
          setError('An unexpected error occurred.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []); // The empty dependency array ensures this effect runs only once

  return { plants, loading, error };
};
