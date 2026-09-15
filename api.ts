import AsyncStorage from '@react-native-async-storage/async-storage';

// Toutes les fonctions de ce fichier passent par cette URL de base,
// définie dans le fichier .env à la racine du projet (EXPO_PUBLIC_API_URL).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  // Ce warning s'affiche dans la console Metro si le .env n'est pas chargé
  // (fichier manquant, mal placé, ou serveur Expo pas redémarré avec -c)
  console.warn(
    '[api.ts] EXPO_PUBLIC_API_URL est vide. Vérifiez votre fichier .env à la racine ' +
    'du projet et relancez avec: npx expo start -c'
  );
}

export type PublicUser = {
  id: number;
  username: string;
  email: string | null;
  nom: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  quartier: string | null;
  ruelle: string | null;
  point_repere: string | null;
  numero_compteur: string | null;
  type_logement: string | null;
  zone_id: number | null;
};

type AuthResponse = {
  token: string;
  user: PublicUser;
};

class ApiError extends Error {}

// Petit wrapper autour de fetch : construit l'URL, envoie le JSON,
// et transforme les réponses non-OK en erreur avec le message du serveur.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data?.message || 'Une erreur est survenue, veuillez réessayer.');
  }

  return data as T;
}

// Sauvegarde le token + l'utilisateur dans AsyncStorage après un login/register réussi
async function persistSession(auth: AuthResponse) {
  await AsyncStorage.setItem('token', auth.token);
  await AsyncStorage.setItem('user', JSON.stringify(auth.user));
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await persistSession(data);
  return data;
}

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  ville: string;
  quartier: string;
  ruelle: string;
  pointRepere: string;
  telephone: string;
  typeLogement: string;
};

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  await persistSession(data);
  return data;
}

// ---------------------------------------------------------------------------
// GET /auth/me  -> utilise le token stocké pour vérifier la session au démarrage
// ---------------------------------------------------------------------------
export async function fetchMe(): Promise<PublicUser | null> {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;

  try {
    const data = await request<{ user: PublicUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
  } catch {
    // Token invalide ou expiré : on nettoie la session locale
    await logout();
    return null;
  }
}

// ---------------------------------------------------------------------------
// GET /releves/me  -> historique de consommation du client connecté
// (utilisé sur la page d'accueil pour le graphique et les derniers relevés)
// ---------------------------------------------------------------------------
export type ReleveHistorique = {
  mois: string;
  consommation: number;
  indexPrecedent: number;
  indexActuel: number;
  date_releve: string;
};

export async function fetchHistorique(): Promise<ReleveHistorique[]> {
  const token = await AsyncStorage.getItem('token');
  if (!token) return [];

  try {
    const data = await request<{ historique: ReleveHistorique[] }>('/releves/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.historique;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Déconnexion : supprime la session locale
// ---------------------------------------------------------------------------
export async function logout() {
  await AsyncStorage.multiRemove(['token', 'user']);
}