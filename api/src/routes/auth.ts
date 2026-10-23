import { Router, Request, Response } from 'express';
import db from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'epitech_super_secret_key_2026';

interface UserRow {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'freemium' | 'premium' | 'professionnel';
}

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis.' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Identifiants invalides.' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

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

router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Déconnexion réussie' });
});

router.get('/me', verifyToken, (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json({ user: req.user });
});

export default router;