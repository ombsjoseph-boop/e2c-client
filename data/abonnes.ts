// Données et types partagés liés aux abonnés E2C.
// À terme, ABONNES_DEMO doit être remplacé par un appel API / une base locale (SQLite, AsyncStorage...).

export type Abonne = {
  id: string;
  nom: string;
  numeroCompteur: string;
  adresse: string;
  dernierIndex: number;
  dateDernierReleve: string; // format lisible, ex: "12 juil. 2026"
  releveEffectueCeMois: boolean;
};

export const ABONNES_DEMO: Abonne[] = [
  {
    id: '1',
    nom: 'Mavoungou Jean',
    numeroCompteur: 'CPT-00124',
    adresse: 'Quartier Moungali, Rue de la Paix',
    dernierIndex: 12890,
    dateDernierReleve: '2 août 2026',
    releveEffectueCeMois: true,
  },
  {
    id: '2',
    nom: 'Nkounkou Sylvie',
    numeroCompteur: 'CPT-00298',
    adresse: 'Bacongo, Avenue de la Base',
    dernierIndex: 4521,
    dateDernierReleve: '3 juil. 2026',
    releveEffectueCeMois: false,
  },
  {
    id: '3',
    nom: 'Ondongo Patrick',
    numeroCompteur: 'CPT-00451',
    adresse: 'Poto-Poto, Rue Mbochis',
    dernierIndex: 8765,
    dateDernierReleve: '30 juil. 2026',
    releveEffectueCeMois: false,
  },
  {
    id: '4',
    nom: 'Loubota Grace',
    numeroCompteur: 'CPT-00512',
    adresse: 'Talangaï, Rue des Manguiers',
    dernierIndex: 2310,
    dateDernierReleve: '1 août 2026',
    releveEffectueCeMois: true,
  },
  {
    id: '5',
    nom: 'Bemba Aristide',
    numeroCompteur: 'CPT-00673',
    adresse: 'Makélékélé, Rue Loufoulakari',
    dernierIndex: 15420,
    dateDernierReleve: '28 juin 2026',
    releveEffectueCeMois: false,
  },
];

export function getAbonneById(id: string): Abonne | undefined {
  return ABONNES_DEMO.find((a) => a.id === id);
}

// --- Historique des relevés ---

export type Releve = {
  id: string;
  abonneId: string;
  index: number;
  consommation: number; // kWh consommés depuis le relevé précédent
  date: string; // format lisible, ex: "2 août 2026"
  remarque?: string;
};

// Historique de démonstration — à remplacer par la lecture depuis l'API / la base locale.
export const RELEVES_DEMO: Releve[] = [
  { id: 'r1-1', abonneId: '1', index: 12100, consommation: 260, date: '2 mai 2026' },
  { id: 'r1-2', abonneId: '1', index: 12420, consommation: 320, date: '3 juin 2026' },
  { id: 'r1-3', abonneId: '1', index: 12610, consommation: 190, date: '4 juil. 2026' },
  { id: 'r1-4', abonneId: '1', index: 12890, consommation: 280, date: '2 août 2026' },

  { id: 'r2-1', abonneId: '2', index: 4180, consommation: 210, date: '3 mai 2026' },
  { id: 'r2-2', abonneId: '2', index: 4350, consommation: 170, date: '2 juin 2026' },
  { id: 'r2-3', abonneId: '2', index: 4521, consommation: 171, date: '3 juil. 2026' },

  { id: 'r3-1', abonneId: '3', index: 8210, consommation: 240, date: '1 mai 2026' },
  { id: 'r3-2', abonneId: '3', index: 8490, consommation: 280, date: '29 mai 2026' },
  { id: 'r3-3', abonneId: '3', index: 8765, consommation: 275, date: '30 juil. 2026' },

  { id: 'r4-1', abonneId: '4', index: 2020, consommation: 150, date: '2 juin 2026' },
  { id: 'r4-2', abonneId: '4', index: 2310, consommation: 290, date: '1 août 2026' },

  { id: 'r5-1', abonneId: '5', index: 14800, consommation: 300, date: '28 avr. 2026' },
  { id: 'r5-2', abonneId: '5', index: 15100, consommation: 300, date: '29 mai 2026' },
  { id: 'r5-3', abonneId: '5', index: 15420, consommation: 320, date: '28 juin 2026' },
];

/** Retourne les relevés d'un abonné, du plus récent au plus ancien. */
export function getRelevesByAbonneId(abonneId: string): Releve[] {
  return RELEVES_DEMO.filter((r) => r.abonneId === abonneId).slice().reverse();
}

/**
 * Enregistre un nouveau relevé pour un abonné : l'ajoute à l'historique
 * et met à jour la fiche abonné (dernier index, date, statut).
 * À remplacer par un appel API / une écriture en base locale.
 */
export function enregistrerReleve(
  abonneId: string,
  nouvelIndex: number,
  remarque?: string
): Releve | null {
  const abonne = getAbonneById(abonneId);
  if (!abonne) return null;

  const consommation = nouvelIndex - abonne.dernierIndex;
  const dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const releve: Releve = {
    id: `r${abonneId}-${Date.now()}`,
    abonneId,
    index: nouvelIndex,
    consommation,
    date: dateAujourdhui,
    remarque,
  };

  RELEVES_DEMO.push(releve);
  abonne.dernierIndex = nouvelIndex;
  abonne.dateDernierReleve = dateAujourdhui;
  abonne.releveEffectueCeMois = true;

  return releve;
}