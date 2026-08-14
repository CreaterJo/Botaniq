"use client";

export interface PlantCompletion {
  herkunft?: string;
  lichtbedarf?: string;
  standort?: string;
  giessplan?: string;
  duengplan?: string;
  bluehzeit?: string;
  wuchshoehe?: string;
  pflegeaufwand?: string;
  besonderheiten?: string;
  pflanzzeit?: string;
}

export class PlantAIHelper {
  static async getPlantCompletion(plantName: string, scientificName: string, family: string): Promise<PlantCompletion> {
    console.log(`🤖 KI ergänzt Daten für: ${plantName}`);
    
    // ✅ INTELLIGENTE REGELBASierte DATEN die nur Lücken füllen
    return this.getIntelligentRuleBasedData(plantName, scientificName, family);
  }

  static getIntelligentRuleBasedData(plantName: string, scientificName: string, family: string): PlantCompletion {
    const name = plantName.toLowerCase();
    const sciName = scientificName.toLowerCase();
    const fam = family.toLowerCase();
    
    // Basis-Daten für fehlende Werte
    let data: PlantCompletion = {
      herkunft: "Unbekannt",
      lichtbedarf: "Sonne bis Halbschatten",
      standort: "Unbekannt",
      giessplan: "Regelmäßig gießen", 
      duengplan: "Standard-Dünger",
      bluehzeit: "Unbekannt",
      wuchshoehe: "Unbekannt",
      pflegeaufwand: "Mittel",
      besonderheiten: `Familie: ${family}`,
      pflanzzeit: "Frühjahr"
    };

    // 🌳 SPEZIFISCHE HÖHEN für bekannte Pflanzen
    if (name.includes('buche') || sciName.includes('fagus')) {
      data.wuchshoehe = "25-35 m";
      data.herkunft = "Europa";
      data.standort = "Wald, Park";
      data.besonderheiten = "Laubbaum, Heckenpflanze, winterhart";
    }
    else if (name.includes('eiche') || sciName.includes('quercus')) {
      data.wuchshoehe = "20-30 m";
      data.herkunft = "Nordhalbkugel";
      data.standort = "Wald, Alleebaum";
      data.besonderheiten = "Langlebiger Baum, Eicheln";
    }
    else if (name.includes('birke') || sciName.includes('betula')) {
      data.wuchshoehe = "15-25 m";
      data.herkunft = "Gemäßigte Zone";
      data.standort = "Wald, Pionierbaum";
    }
    else if (name.includes('ahorn') || sciName.includes('acer')) {
      data.wuchshoehe = "10-15 m";
      data.herkunft = "Nordhalbkugel";
    }
    else if (name.includes('kiefer') || sciName.includes('pinus')) {
      data.wuchshoehe = "15-25 m";
      data.herkunft = "Nordhalbkugel";
      data.besonderheiten = "Nadelbaum, immergrün";
    }
    else if (name.includes('rose') || sciName.includes('rosa')) {
      data.wuchshoehe = "0.5-2 m";
      data.herkunft = "Gemäßigte Zone";
      data.bluehzeit = "Mai bis Oktober";
    }
    else if (name.includes('tulpe') || sciName.includes('tulipa')) {
      data.wuchshoehe = "20-50 cm";
      data.bluehzeit = "März bis Mai";
      data.pflanzzeit = "Herbst";
    }
    else if (name.includes('sonnenblume') || sciName.includes('helianthus')) {
      data.wuchshoehe = "1-3 m";
      data.bluehzeit = "Juli bis September";
    }

    // 🌿 GENERISCHE KATEGORIEN als Fallback
    if (data.wuchshoehe === "Unbekannt") {
      if (name.includes('baum') || sciName.includes('quercus') || sciName.includes('pinus') || sciName.includes('betula')) {
        data.wuchshoehe = "15-25 m";
      }
      else if (name.includes('strauch') || name.includes('shrub')) {
        data.wuchshoehe = "1-3 m";
      }
      else if (name.includes('staude') || name.includes('blume')) {
        data.wuchshoehe = "30-80 cm";
      }
      else if (name.includes('kraut') || name.includes('herb')) {
        data.wuchshoehe = "20-60 cm";
      }
    }

    return data;
  }

  static needsEnhancement(plant: any): boolean {
    // ✅ NUR verbessern wenn WICHTIGE Daten fehlen
    return (
      plant.wuchshoehe === 'Unbekannt' ||
      plant.herkunft === 'Unbekannt' ||
      plant.bluehzeit === 'Unbekannt' ||
      (plant.besonderheiten && plant.besonderheiten.includes('Trefle API'))
    );
  }
}