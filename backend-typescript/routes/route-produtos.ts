import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database/database-connection';
import { authMiddleware } from '../middlewares/auth-middleware';
import { logError } from '../utils/logger';
import { AuthRequest, Produto, ProdutoRequest } from '../types';

const router = express.Router();

// ===== ROTA PÚBLICA: LISTAR PRODUTOS DISPONÍVEIS =====
router.get('/publico', async (req: AuthRequest, res: Response) => {
  try {
    const produtos = await db.allAsync<Produto>(
      'SELECT id, tipo, nome, descricao, preco, tamanho FROM produtos WHERE disponivel = 1 ORDER BY tipo, nome'
    );
    res.json(produtos);
  } catch (error) {
    logError('Erro ao listar produtos públicos', error as Error);
    res.status(500).json({ error: 'Erro ao buscar produtos. Tente novamente.' });
  }
});

// Aplicar autenticação para as rotas abaixo
router.use(authMiddleware);

// ===== LISTAR TODOS OS PRODUTOS =====
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { tipo, busca, disponivel } = req.query as { tipo?: string; busca?: string; disponivel?: string };
    let query = 'SELECT * FROM produtos WHERE 1=1';
    const params: any[] = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (busca) {
      // Sanitizar entrada para prevenir SQL injection via wildcards
      const buscaSanitizada = busca.replace(/[%_\\]/g, '\\$&');
      query += ' AND (nome LIKE ? ESCAPE "\\" OR descricao LIKE ? ESCAPE "\\")';
      const searchTerm = `%${buscaSanitizada}%`;
      params.push(searchTerm, searchTerm);
    }

    if (disponivel !== undefined) {
      query += ' AND disponivel = ?';
      params.push(disponivel === 'true' ? 1 : 0);
    }

    query += ' ORDER BY tipo, nome ASC';

    const produtos = await db.allAsync<Produto>(query, params);
    res.json(produtos);

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// ===== BUSCAR PRODUTO POR ID =====
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const produto = await db.getAsync<Produto>('SELECT * FROM produtos WHERE id = ?', [req.params.id]);

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// ===== CRIAR NOVO PRODUTO =====
router.post('/', [
  body('tipo').notEmpty().withMessage('Tipo é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('preco').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero'),
  body('tamanho').optional()
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tipo, nome, descricao, preco, tamanho, disponivel = true } = req.body as ProdutoRequest;

  try {
    const result = await db.runAsync(`
      INSERT INTO produtos (tipo, nome, descricao, preco, tamanho, disponivel)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [tipo, nome, descricao, preco, tamanho, disponivel ? 1 : 0]);

    res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso',
      id: result.lastID
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao cadastrar produto' });
  }
});

// ===== ATUALIZAR PRODUTO =====
router.put('/:id', [
  body('tipo').notEmpty().withMessage('Tipo é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('preco').isFloat({ min: 0.01 }).withMessage('Preço deve ser maior que zero')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tipo, nome, descricao, preco, tamanho, disponivel } = req.body as ProdutoRequest;

  try {
    const result = await db.runAsync(`
      UPDATE produtos 
      SET tipo = ?, nome = ?, descricao = ?, preco = ?, tamanho = ?, disponivel = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [tipo, nome, descricao, preco, tamanho, disponivel ? 1 : 0, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Produto atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// ===== EXCLUIR PRODUTO =====
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.runAsync('DELETE FROM produtos WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Produto excluído com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

export default router;
