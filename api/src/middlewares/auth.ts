import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'epitech_super_secret_key_2026';

// Extension de l'interface Request d'Express pour y ajouter l'utilisateur connecté
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'freemium' | 'premium' | 'professionnel';
  };
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Accès non autorisé : aucun token fourni.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
}

export function checkRole(allowedRoles: Array<'admin' | 'freemium' | 'premium' | 'professionnel'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé : privilèges insuffisants.' });
      return;
    }
    next();
  };
}