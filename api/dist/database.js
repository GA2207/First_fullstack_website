"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbPath = path_1.default.resolve(__dirname, '../database.sqlite');
const db = new better_sqlite3_1.default(dbPath);
function initDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'freemium', 'premium', 'professionnel')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recettes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      categorie TEXT NOT NULL,
      temps_preparation INTEGER NOT NULL,
      vues INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recette_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recette_id INTEGER,
      nom_ingredient TEXT NOT NULL,
      quantite REAL NOT NULL,
      unite TEXT NOT NULL,
      prix_unitaire REAL DEFAULT 1.0,
      FOREIGN KEY (recette_id) REFERENCES recettes(id)
    );

    CREATE TABLE IF NOT EXISTS instructions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recette_id INTEGER,
      numero_etape INTEGER NOT NULL,
      texte_instruction TEXT NOT NULL,
      FOREIGN KEY (recette_id) REFERENCES recettes(id)
    );
  `);
    console.log('✅ Tables SQLite créées avec succès.');
    const userCountResult = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCountResult.count === 0) {
        const hashedPassword = bcrypt_1.default.hashSync('password123', 10);
        const insertUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
        insertUser.run('admin@epitech.eu', hashedPassword, 'admin');
        insertUser.run('freemium@epitech.eu', hashedPassword, 'freemium');
        insertUser.run('premium@epitech.eu', hashedPassword, 'premium');
        insertUser.run('pro@epitech.eu', hashedPassword, 'professionnel');
        console.log('✅ Utilisateurs de test créés (admin, freemium, premium, pro) avec le mot de passe : password123');
    }
    // 3. Seeding des CSV (si la table recettes est vide)
    const recipeCountResult = db.prepare('SELECT COUNT(*) as count FROM recettes').get();
    if (recipeCountResult.count === 0) {
        importCsvData();
    }
}
function importCsvData() {
    const parseCsvLine = (line) => {
        return line.split(';').map((val) => val.trim());
    };
    try {
        const findFile = (filename) => {
            const p1 = path_1.default.resolve(__dirname, `../${filename}`);
            if (fs_1.default.existsSync(p1))
                return p1;
            const p2 = path_1.default.resolve(__dirname, `../../${filename}`);
            if (fs_1.default.existsSync(p2))
                return p2;
            return null;
        };
        const recettesPath = findFile('recettes.csv');
        if (recettesPath) {
            const content = fs_1.default.readFileSync(recettesPath, 'utf-8');
            const lines = content.split('\n').filter((line) => line.trim() !== '');
            const insert = db.prepare('INSERT INTO recettes (id, nom, categorie, temps_preparation, vues) VALUES (?, ?, ?, ?, 0)');
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                if (cols.length >= 4) {
                    const [idStr, nom, categorie, tempsStr] = cols;
                    const id = Number(idStr);
                    const temps = Number(tempsStr);
                    if (!isNaN(id) && nom) {
                        insert.run(id, nom, categorie, temps);
                    }
                }
            }
            console.log('✅ Recettes importées depuis recettes.csv');
        }
        else {
            console.warn('⚠️ Fichier recettes.csv introuvable.');
        }
        const ingredientsPath = findFile('recette_ingredients.csv');
        if (ingredientsPath) {
            const content = fs_1.default.readFileSync(ingredientsPath, 'utf-8');
            const lines = content.split('\n').filter((line) => line.trim() !== '');
            const insert = db.prepare('INSERT INTO recette_ingredients (id, recette_id, nom_ingredient, quantite, unite, prix_unitaire) VALUES (?, ?, ?, ?, ?, 1.0)');
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                if (cols.length >= 5) {
                    const [idStr, recetteIdStr, nom_ingredient, quantiteStr, unite] = cols;
                    const id = Number(idStr);
                    const recette_id = Number(recetteIdStr);
                    const quantite = Number(quantiteStr);
                    if (!isNaN(id) && !isNaN(recette_id) && nom_ingredient) {
                        insert.run(id, recette_id, nom_ingredient, quantite, unite);
                    }
                }
            }
            console.log('✅ Ingrédients importés depuis recette_ingredients.csv');
        }
        else {
            console.warn('⚠️ Fichier recette_ingredients.csv introuvable.');
        }
        const instructionsPath = findFile('instructions.csv');
        if (instructionsPath) {
            const content = fs_1.default.readFileSync(instructionsPath, 'utf-8');
            const lines = content.split('\n').filter((line) => line.trim() !== '');
            const insert = db.prepare('INSERT INTO instructions (id, recette_id, numero_etape, texte_instruction) VALUES (?, ?, ?, ?)');
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                if (cols.length >= 4) {
                    const [idStr, recetteIdStr, etapeStr, ...rest] = cols;
                    const texte_instruction = rest.join(';');
                    const id = Number(idStr);
                    const recette_id = Number(recetteIdStr);
                    const numero_etape = Number(etapeStr);
                    if (!isNaN(id) && !isNaN(recette_id) && !isNaN(numero_etape)) {
                        insert.run(id, recette_id, numero_etape, texte_instruction);
                    }
                }
            }
            console.log('✅ Instructions importées depuis instructions.csv');
        }
        else {
            console.warn('⚠️ Fichier instructions.csv introuvable.');
        }
    }
    catch (error) {
        console.error("Erreur lors de l'importation des CSV :", error);
    }
}
exports.default = db;
