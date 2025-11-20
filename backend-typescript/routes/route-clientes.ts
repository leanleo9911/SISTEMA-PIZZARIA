import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/database-connection';
import { authMiddleware } from '../middlewares/auth-middleware';
import { logError } from '../utils/logger';
import { AuthRequest, Cliente, ClienteRequest } from '../types';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// ===== LISTAR TODOS OS CLIENTES =====
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { busca, ativo } = req.query as { busca?: string; ativo?: string };
    let query = 'SELECT * FROM clientes WHERE ativo = 1';
    const params: any[] = [];

    if (busca) {
      // Sanitizar entrada para prevenir SQL injection via wildcards
      const buscaSanitizada = busca.replace(/[%_\\]/g, '\\$&');
      query += ' AND (nome LIKE ? ESCAPE "\\" OR email LIKE ? ESCAPE "\\" OR telefone LIKE ? ESCAPE "\\")';
      const searchTerm = `%${buscaSanitizada}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Se explicitamente pedir todos (incluindo inativos)
    if (ativo === 'all') {
      query = query.replace('WHERE ativo = 1', 'WHERE 1=1');
    } else if (ativo !== undefined) {
      query = query.replace('WHERE ativo = 1', 'WHERE ativo = ?');
      params.unshift(ativo === 'true' ? 1 : 0);
    }

    // Ordenar por ID (ordem de cadastro - mais antigos primeiro)
    query += ' ORDER BY id ASC';

    const clientes = await db.allAsync<Cliente>(query, params);
    res.json(clientes);

  } catch (error) {
    logError('Erro ao listar clientes', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar clientes. Tente novamente.' });
  }
});

// ===== BUSCAR CLIENTE POR ID =====
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const cliente = await db.getAsync<Cliente>('SELECT * FROM clientes WHERE id = ?', [req.params.id]);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);

  } catch (error) {
    logError('Erro ao buscar cliente', error as Error, { clienteId: req.params.id });
    res.status(500).json({ error: 'Erro ao buscar cliente. Tente novamente.' });
  }
});

// ===== CRIAR NOVO CLIENTE =====
router.post('/', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('data_nascimento').optional().isDate().withMessage('Data de nascimento inválida'),
  body('cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, data_nascimento, email, telefone, endereco, cep } = req.body as ClienteRequest;

  try {
    const result = await db.runAsync(`
      INSERT INTO clientes (nome, data_nascimento, email, telefone, endereco, cep)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome, data_nascimento, email, telefone, endereco, cep]);

    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      id: result.lastID
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  }
});

// ===== ATUALIZAR CLIENTE =====
router.put('/:id', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, data_nascimento, email, telefone, endereco, cep } = req.body as ClienteRequest;

  try {
    const result = await db.runAsync(`
      UPDATE clientes 
      SET nome = ?, data_nascimento = ?, email = ?, telefone = ?, endereco = ?, cep = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nome, data_nascimento, email, telefone, endereco, cep, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Cliente atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// ===== DESATIVAR CLIENTE (soft delete) =====
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.runAsync(`
      UPDATE clientes 
      SET ativo = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Cliente desativado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao desativar cliente:', error);
    res.status(500).json({ error: 'Erro ao desativar cliente' });
  }
});

export default router;
