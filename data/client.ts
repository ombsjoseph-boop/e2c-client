export interface Client {
  id: string;
  prenom: string;
  nom: string;
  numeroCompteur: string;
  typeAbonnement: string;
}

export interface ReleveClient {
  mois: string;
  indexPrecedent: number;
  indexActuel: number;
  consommation: number; // en kWh
  date: string;
}

export const CLIENT_ACTUEL: Client = {
  id: 'c1',
  prenom: 'Kévin',
  nom: 'Moukoko',
  numeroCompteur: 'CMP-948201',
  typeAbonnement: 'Domestique - 5A',
};

export const HISTORIQUE_CONSO_CLIENT: ReleveClient[] = [
  {
    mois: 'Mars 2026',
    indexPrecedent: 1120,
    indexActuel: 1245,
    consommation: 125,
    date: '02/03/2026',
  },
  {
    mois: 'Avril 2026',
    indexPrecedent: 1245,
    indexActuel: 1380,
    consommation: 135,
    date: '03/04/2026',
  },
  {
    mois: 'Mai 2026',
    indexPrecedent: 1380,
    indexActuel: 1510,
    consommation: 130,
    date: '02/05/2026',
  },
  {
    mois: 'Juin 2026',
    indexPrecedent: 1510,
    indexActuel: 1675,
    consommation: 165,
    date: '04/06/2026',
  },
  {
    mois: 'Juillet 2026',
    indexPrecedent: 1675,
    indexActuel: 1840,
    consommation: 165,
    date: '03/07/2026',
  },
  {
    mois: 'Août 2026',
    indexPrecedent: 1840,
    indexActuel: 2020,
    consommation: 180,
    date: '04/08/2026',
  },
  {
    mois: 'Septembre 2026',
    indexPrecedent: 2020,
    indexActuel: 2170,
    consommation: 150,
    date: '03/09/2026',
  },
];