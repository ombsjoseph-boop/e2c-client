require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors()); // autorise les appels depuis l'app Expo (mobile / web)
app.use(express.json());

// ---------------------------------------------------------------------------
// Connexion à la base de données (anciennement dans db.js, fusionné ici)
// ---------------------------------------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'app',
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = '7d'; // le token reste valide 7 jours

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function makeToken(userId, email) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function toPublicUser(row) {
  // Ne renvoie jamais le hash du mot de passe au client
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    nom: row.nom,
    telephone: row.telephone,
    adresse: row.adresse,
    ville: row.ville,
    quartier: row.quartier,
    ruelle: row.ruelle,
    point_repere: row.point_repere,
    numero_compteur: row.numero_compteur,
    type_logement: row.type_logement,
    zone_id: row.zone_id,
  };
}

// ---------------------------------------------------------------------------
// POST /auth/register  ->  appelé depuis register-details.tsx
// ---------------------------------------------------------------------------
app.post('/auth/register', async (req, res) => {
  const {
    name = '',
    email = '',
    password = '',
    ville = '',
    quartier = '',
    ruelle = '',
    pointRepere = '',
    telephone = '',
    typeLogement = '',
  } = req.body || {};

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanVille = ville.trim();
  const cleanQuartier = quartier.trim();
  const cleanRuelle = ruelle.trim();
  const cleanPointRepere = pointRepere.trim();
  const cleanTelephone = telephone.trim();
  const cleanTypeLogement = typeLogement.trim();

  if (!cleanName || !cleanEmail || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires.' });
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ message: 'Adresse email invalide.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }
  if (!cleanQuartier || !cleanRuelle || !cleanTelephone) {
    return res.status(400).json({ message: 'Quartier, ruelle et téléphone sont obligatoires.' });
  }

  // On garde aussi une adresse "à plat" (lisible en un coup d'oeil), en plus
  // des colonnes structurées ville / quartier / ruelle / point_repere.
  const adresseParts = [cleanVille, cleanQuartier, cleanRuelle].filter(Boolean);
  let adresse = adresseParts.join(', ');
  if (cleanPointRepere) {
    adresse += ` (repère : ${cleanPointRepere})`;
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [cleanEmail, cleanEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      `INSERT INTO users
         (username, password, email, created_at, telephone, adresse, nom, ville, quartier, ruelle, point_repere, type_logement)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanEmail,
        passwordHash,
        cleanEmail,
        cleanTelephone,
        adresse,
        cleanName,
        cleanVille,
        cleanQuartier,
        cleanRuelle,
        cleanPointRepere,
        cleanTypeLogement,
      ]
    );

    const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];

    const token = makeToken(user.id, cleanEmail);
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  } finally {
    conn.release();
  }
});

// ---------------------------------------------------------------------------
// POST /auth/login  ->  appelé depuis login.tsx
// ---------------------------------------------------------------------------
app.post('/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont obligatoires.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [cleanEmail, cleanEmail]
    );
    const user = rows[0];

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Seuls les comptes créés via cette API (hash bcrypt "$2a$/$2b$/$2y$")
    // peuvent être vérifiés ici. Les anciens comptes (mot de passe en clair
    // ou hachés par un autre backend) devront être recréés via /auth/register.
    const isBcryptHash = /^\$2[aby]\$/.test(user.password);
    const valid = isBcryptHash ? await bcrypt.compare(password, user.password) : false;

    if (!valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = makeToken(user.id, cleanEmail);
    return res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
});

// ---------------------------------------------------------------------------
// Middleware pour protéger une route avec le token Bearer
// ---------------------------------------------------------------------------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant.' });
  }
  const token = header.slice('Bearer '.length);
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré, merci de vous reconnecter.' });
  }
}

// ---------------------------------------------------------------------------
// GET /auth/me  ->  pratique pour l'écran profil / vérifier la session au démarrage
// ---------------------------------------------------------------------------
app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.auth.sub]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ---------------------------------------------------------------------------
// GET /releves/me  ->  historique de consommation du client connecté
// (appelé depuis la page d'accueil (tabs)/index.tsx pour remplacer les
// données statiques par les vraies données du client)
// ---------------------------------------------------------------------------
app.get('/releves/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT consommation, date_releve, notes FROM releves WHERE user_id = ? ORDER BY date_releve ASC',
      [req.auth.sub]
    );

    // La table `releves` ne stocke que la consommation par période, pas
    // d'index de compteur. On reconstitue un index cumulé (comme un vrai
    // compteur électrique qui ne fait qu'augmenter) : indexPrecedent = total
    // avant ce relevé, indexActuel = total après.
    let cumule = 0;
    const historique = rows.map((r) => {
      const conso = Number(r.consommation);
      const indexPrecedent = cumule;
      cumule += conso;
      const indexActuel = cumule;

      const date = new Date(r.date_releve);
      const moisLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      return {
        mois: moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1),
        consommation: conso,
        indexPrecedent,
        indexActuel,
        date_releve: r.date_releve,
      };
    });

    return res.json({ historique });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API E2C démarrée sur le port ${PORT}`);
});