/**
 * ============================================================================
 * SISTEMA PIZZARIA - SERVIDOR BACKEND
 * ============================================================================
 * 
 * Servidor principal da API REST do sistema de gestão de pizzaria.
 * 
 * Funcionalidades:
 * - Autenticação JWT com bcrypt
 * - CRUD de clientes, produtos e pedidos
 * - Relatórios e dashboard
 * 
 * Segurança:
 * - Helmet para proteção de headers
 * - CORS configurado
 * - Rate limiting em 3 níveis
 * - Validação de dados com express-validator
 * 
 * Tecnologias:
 * - Node.js + Express
 * - SQLite3 (banco de dados)
 * - JWT (autenticação)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importar inicialização do banco de dados
const initDatabase = require('./database/database-init');

// Importar rotas
const authRoutes = require('./routes/route-auth');
const clientesRoutes = require('./routes/route-clientes');
const produtosRoutes = require('./routes/route-produtos');
const pedidosRoutes = require('./routes/route-pedidos');
const relatoriosRoutes = require('./routes/route-relatorios');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES DE SEGURANÇA =====

// Helmet - Adiciona headers HTTP de segurança (proteção contra XSS, clickjacking, etc)
app.use(helmet());

// CORS - Permite requisições cross-origin do frontend
// IMPORTANTE: Em produção, defina CORS_ORIGIN no .env
const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Permitir qualquer subdomínio do Vercel (preview deploys)
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Verificar se origin está na lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Permite envio de cookies
}));

// Rate Limiting - Previne ataques DDoS limitando requisições por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 500, // Máximo 500 requisições por IP nesta janela (aumentado para desenvolvimento)
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Rate limiting MAIS RESTRITIVO para rotas de autenticação
// Previne ataques de força bruta em tentativas de login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 tentativas de login em 15 minutos (aumentado para desenvolvimento)
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.'
});
app.use('/api/auth/login', authLimiter);

// Rate limiting RESTRITIVO para pedidos públicos
// Previne spam de pedidos falsos e ataques de DoS
const publicOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Janela de 1 hora
  max: 5, // Máximo 5 pedidos por IP por hora
  message: 'Limite de pedidos atingido. Tente novamente em 1 hora.'
});
app.use('/api/pedidos/publico', publicOrderLimiter);

// Parsear requisições JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requisições HTTP no console (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // Formato: GET /api/produtos 200 15.234 ms
}

// ===== ROTAS DA API =====

// Rota de health check - verifica se a API está online
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Pizzaria está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Registrar rotas da API
app.use('/api/auth', authRoutes);           // POST /api/auth/login, /api/auth/register
app.use('/api/clientes', clientesRoutes);   // CRUD /api/clientes (protegido)
app.use('/api/produtos', produtosRoutes);   // CRUD /api/produtos (GET /publico é público)
app.use('/api/pedidos', pedidosRoutes);     // CRUD /api/pedidos (POST /publico é público)
app.use('/api/relatorios', relatoriosRoutes); // GET /api/relatorios/dashboard, /vendas

// Rota 404 - captura qualquer rota não definida
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path
  });
});

// ===== MIDDLEWARE DE ERRO GLOBAL =====
// Captura todos os erros não tratados e retorna resposta JSON padronizada
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    // Mostra stack trace apenas em desenvolvimento (nunca em produção)
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===== INICIALIZAR BANCO E INICIAR SERVIDOR =====

const startServer = async () => {
  try {
    // Inicializar banco de dados
    await initDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║   🍕 Sistema Pizzaria - API REST Server       ║
║                                                ║
║   🚀 Servidor rodando na porta ${PORT}           ║
║   🌍 http://localhost:${PORT}                    ║
║   📊 Health Check: /api/health                 ║
║   🔒 Ambiente: ${process.env.NODE_ENV || 'development'}            ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Exportar app para testes
module.exports = app;
