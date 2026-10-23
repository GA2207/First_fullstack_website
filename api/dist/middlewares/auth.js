"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.checkRole = checkRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'epitech_super_secret_key_2026';
function verifyToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Accès non autorisé : aucun token fourni.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Token invalide ou expiré.' });
    }
}
function checkRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Accès refusé : privilèges insuffisants.' });
            return;
        }
        next();
    };
}
