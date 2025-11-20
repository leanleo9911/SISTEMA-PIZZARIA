import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import initDatabase from './database/database-init';

// Importar rotas
import routeAuth from './routes/route-auth';
import routeClientes from './routes/route-clientes';
import routeProdutos from './routes/route-produtos';
import routePedidos from './routes/route-pedidos';
import routeRelatorios from './routes/route-relatorios';

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES DE SEGURANÇA =====

// Helmet: Protege contra vulnerabilidades conhecidas
app.use(helmet());

// CORS: Configurar domínios permitidos
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting Geral (500 requisições por 15 minutos)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// Rate Limiting específico para login (20 tentativas por 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  skipSuccessfulRequests: true
});
app.use('/api/auth/login', loginLimiter);

// Rate Limiting para pedidos públicos (5 pedidos por hora por IP)
const publicOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: 'Limite de pedidos públicos atingido. Tente novamente em 1 hora.',
  standardHeaders: true
});
app.use('/api/pedidos/publico', publicOrderLimiter);

// Parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ===== ROTAS =====

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', routeAuth);
app.use('/api/clientes', routeClientes);
app.use('/api/produtos', routeProdutos);
app.use('/api/pedidos', routePedidos);
app.use('/api/relatorios', routeRelatorios);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ===== TRATAMENTO DE ERROS GLOBAL =====
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro não tratado:', err);
  
  // Em produção, não expor stack trace
  const errorResponse = process.env.NODE_ENV === 'production'
    ? { error: 'Erro interno do servidor' }
    : { error: err.message, stack: err.stack };
  
  res.status(500).json(errorResponse);
});

// ===== INICIALIZAR SERVIDOR =====
const startServer = async (): Promise<void> => {
  try {
    // Inicializar banco de dados
    await initDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Configurado' : '✗ NÃO CONFIGURADO'}`);
      console.log('\n✅ Sistema pronto para uso!\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
