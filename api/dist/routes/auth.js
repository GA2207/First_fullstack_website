"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'epitech_super_secret_key_2026';
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe requis.' });
        return;
    }
    const user = database_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt_1.default.compareSync(password, user.password)) {
        res.status(401).json({ error: 'Identifiants invalides.' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });
    res.status(200).json({
        message: 'Connexion réussie',
        user: { id: user.id, email: user.email, role: user.role }
    });
});
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Déconnexion réussie' });
});
router.get('/me', auth_1.verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});
exports.default = router;
