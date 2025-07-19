// backend/src/routes/auth.ts (Code Mis à Jour)

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database';
import { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv'; // <-- NOUVEAU : Importe la bibliothèque dotenv

dotenv.config(); // <-- NOUVEAU : Charge les variables d'environnement depuis le fichier .env

// Avant: const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
// Après:
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only'; // <-- MODIFIÉ : Récupère le secret de l'environnement

const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis.' });
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // Utilisez JWT_SECRET qui est maintenant chargé depuis .env
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username: user.username, userId: user.id });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Une erreur inattendue s\'est produite.' });
    }
});

export default router;
