const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
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
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }

      // Adicionar dados do usuário na requisição
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;

      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Erro ao validar token' });
  }
};

// Middleware para verificar se é admin
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administradores podem acessar esta rota.' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
