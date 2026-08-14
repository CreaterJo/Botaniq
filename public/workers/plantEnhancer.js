// public/workers/plantEnhancer.js
self.addEventListener('message', async (event) => {
  const { plants, type } = event.data;
  
  if (type === 'ENHANCE_PLANTS') {
    try {
      // Simuliere KI-Verarbeitung (ersetzte dies mit deiner echten KI-Logik)
      const enhancedPlants = plants.map(plant => {
        // Hier würde deine echte PlantAIHelper.getPlantCompletion Logik stehen
        // Für jetzt nur Beispiel-Daten
        if (plant.herkunft === 'Unbekannt') {
          return {
            ...plant,
            herkunft: 'Europa',
            wuchshoehe: plant.wuchshoehe === 'Unbekannt' ? '2-3 m' : plant.wuchshoehe
          };
        }
        return plant;
      });
      
      self.postMessage({
        type: 'ENHANCE_COMPLETE',
        plants: enhancedPlants
      });
    } catch (error) {
      self.postMessage({
        type: 'ENHANCE_ERROR',
        error: error.message
      });
    }
  }
});