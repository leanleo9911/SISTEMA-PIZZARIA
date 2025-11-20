import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: number;
  email: string;
  role: 'admin' | 'funcionario';
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }

      const payload = decoded as JwtPayload;

      // Adicionar dados do usuário na requisição
      req.userId = payload.id;
      req.userEmail = payload.email;
      req.userRole = payload.role;

      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Erro ao validar token' });
  }
};

// Middleware para verificar se é admin
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar esta rota.' 
    });
  }
  next();
};
