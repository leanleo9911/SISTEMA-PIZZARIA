import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import os from 'os';
import db from '../database/database-connection';
import { authMiddleware } from '../middlewares/auth-middleware';
import { logError } from '../utils/logger';
import { AuthRequest, Pedido, Produto, Cliente, ItemPedido, PedidoPublicoRequest } from '../types';

const router = express.Router();

// ===== ROTA PÚBLICA: CRIAR PEDIDO SEM AUTENTICAÇÃO =====
router.post('/publico', [
  body('cliente.nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cliente.telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('cliente.telefone').matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).withMessage('Formato de telefone inválido'),
  body('cliente.endereco').notEmpty().withMessage('Endereço é obrigatório'),
  body('cliente.email').optional().isEmail().withMessage('Email inválido'),
  body('forma_pagamento').notEmpty().withMessage('Forma de pagamento é obrigatória'),
  body('itens').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos 1 item'),
  body('itens.*.produto_id').isInt().withMessage('Produto inválido'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cliente, itens, forma_pagamento, observacoes } = req.body as PedidoPublicoRequest;

    console.log('📥 Recebendo pedido público:');
    console.log('   Cliente:', JSON.stringify(cliente, null, 2));
    console.log('   Itens:', itens?.length);
    console.log('   Forma pagamento:', forma_pagamento);

    // 1. Criar ou buscar cliente
    let clienteExistente = await db.getAsync<{ id: number }>(
      'SELECT id FROM clientes WHERE telefone = ?',
      [cliente.telefone]
    );

    let cliente_id: number;
    if (clienteExistente) {
      cliente_id = clienteExistente.id;
      console.log('   ✅ Cliente existente encontrado (ID:', cliente_id, ')');
      // Atualizar dados do cliente
      await db.runAsync(
        'UPDATE clientes SET nome = ?, endereco = ?, email = ? WHERE id = ?',
        [cliente.nome, cliente.endereco, cliente.email || null, cliente_id]
      );
      console.log('   ✅ Dados do cliente atualizados');
    } else {
      // Criar novo cliente
      const result = await db.runAsync(
        'INSERT INTO clientes (nome, telefone, endereco, email) VALUES (?, ?, ?, ?)',
        [cliente.nome, cliente.telefone, cliente.endereco, cliente.email || null]
      );
      cliente_id = result.lastID;
      console.log('   ✅ Novo cliente criado (ID:', cliente_id, ')');
    }

    // 2. Calcular valor total
    let valor_total = 0;
    for (const item of itens) {
      const produto = await db.getAsync<{ preco: number }>('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
      if (produto) {
        valor_total += produto.preco * item.quantidade;
      }
    }

    // 3. Criar pedido
    const pedidoResult = await db.runAsync(`
      INSERT INTO pedidos (cliente_id, status, valor_total, forma_pagamento, observacoes)
      VALUES (?, ?, ?, ?, ?)
    `, [cliente_id, 'pendente', valor_total, forma_pagamento, observacoes || 'Pedido via sistema online']);

    const pedido_id = pedidoResult.lastID;

    console.log('   ✅ Pedido criado (ID:', pedido_id, ') - Total: R$', valor_total.toFixed(2));

    // 4. Inserir itens do pedido
    for (const item of itens) {
      const produto = await db.getAsync<{ preco: number }>('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
      if (produto) {
        await db.runAsync(`
          INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `, [
          pedido_id,
          item.produto_id,
          item.quantidade,
          item.preco_unitario || produto.preco,
          (item.preco_unitario || produto.preco) * item.quantidade
        ]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      pedido_id,
      valor_total
    });

  } catch (error) {
    logError('Erro ao criar pedido público', error as Error, { 
      clienteNome: req.body.cliente?.nome,
      itensCount: req.body.itens?.length 
    });
    res.status(500).json({ error: 'Erro ao processar pedido. Tente novamente.' });
  }
});

// Aplicar autenticação para as rotas abaixo
router.use(authMiddleware);

// ===== LISTAR TODOS OS PEDIDOS =====
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, cliente_id, data_inicio, data_fim } = req.query as { 
      status?: string; 
      cliente_id?: string; 
      data_inicio?: string; 
      data_fim?: string 
    };
    let query = `
      SELECT p.*, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (cliente_id) {
      query += ' AND p.cliente_id = ?';
      params.push(cliente_id);
    }

    if (data_inicio) {
      query += ' AND DATE(p.created_at) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(p.created_at) <= ?';
      params.push(data_fim);
    }

    query += ' ORDER BY p.id ASC';

    const pedidos = await db.allAsync<Pedido & { cliente_nome: string; cliente_telefone: string; itens?: any[] }>(query, params);

    // Buscar itens de cada pedido
    for (let pedido of pedidos) {
      pedido.itens = await db.allAsync(`
        SELECT ip.*, pr.nome as produto_nome, pr.tipo as produto_tipo
        FROM itens_pedido ip
        LEFT JOIN produtos pr ON ip.produto_id = pr.id
        WHERE ip.pedido_id = ?
      `, [pedido.id]);
    }

    res.json(pedidos);

  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// ===== GERAR COMPROVANTES E NOTAS FISCAIS EM TXT =====
router.get('/gerar-comprovantes', async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== GERANDO COMPROVANTES ===');
    
    const query = `
      SELECT p.*, c.nome as cliente_nome, c.telefone, c.email, c.endereco
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.created_at DESC
    `;
    
    const pedidos = await db.allAsync<Pedido & Cliente>(query);
    
    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum pedido encontrado no sistema. Crie pedidos antes de gerar comprovantes.' 
      });
    }

    const desktopPath = path.join(os.homedir(), 'Desktop', 'Comprovantes');
    
    if (!fs.existsSync(desktopPath)) {
      fs.mkdirSync(desktopPath, { recursive: true });
    }

    const arquivosGerados: string[] = [];

    for (const pedido of pedidos) {
      const itens = await db.allAsync<ItemPedido & { produto_nome: string }>(`
        SELECT ip.*, p.nome as produto_nome
        FROM itens_pedido ip
        JOIN produtos p ON ip.produto_id = p.id
        WHERE ip.pedido_id = ?
      `, [pedido.id]);

      const nomeArquivo = `Pedido_${pedido.id}_${pedido.cliente_nome || 'Cliente'}.txt`
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const txtPath = path.join(desktopPath, nomeArquivo);

      let conteudo = '';
      conteudo += '═══════════════════════════════════════════════════\n';
      conteudo += '           🍕 PIZZARIA - COMPROVANTE              \n';
      conteudo += '═══════════════════════════════════════════════════\n\n';
      
      conteudo += `PEDIDO #${pedido.id}\n`;
      conteudo += `Data: ${new Date(pedido.created_at).toLocaleString('pt-BR')}\n`;
      conteudo += `Status: ${pedido.status.toUpperCase()}\n`;
      conteudo += `Forma de Pagamento: ${pedido.forma_pagamento || 'Não informado'}\n\n`;
      
      conteudo += '───────────────────────────────────────────────────\n';
      conteudo += '                DADOS DO CLIENTE                   \n';
      conteudo += '───────────────────────────────────────────────────\n';
      conteudo += `Nome: ${pedido.cliente_nome || 'Não informado'}\n`;
      conteudo += `Telefone: ${pedido.telefone || 'Não informado'}\n`;
      conteudo += `Email: ${pedido.email || 'Não informado'}\n`;
      conteudo += `Endereço: ${pedido.endereco || 'Não informado'}\n\n`;
      
      conteudo += '───────────────────────────────────────────────────\n';
      conteudo += '                ITENS DO PEDIDO                    \n';
      conteudo += '───────────────────────────────────────────────────\n\n';
      
      if (itens && itens.length > 0) {
        itens.forEach(item => {
          conteudo += `• ${item.produto_nome}\n`;
          conteudo += `  Quantidade: ${item.quantidade}\n`;
          conteudo += `  Preço Unitário: R$ ${parseFloat(item.preco_unitario.toString()).toFixed(2)}\n`;
          conteudo += `  Subtotal: R$ ${parseFloat(item.subtotal.toString()).toFixed(2)}\n\n`;
        });
      } else {
        conteudo += 'Nenhum item encontrado\n\n';
      }
      
      conteudo += '═══════════════════════════════════════════════════\n';
      conteudo += `VALOR TOTAL: R$ ${parseFloat(pedido.valor_total.toString()).toFixed(2)}\n`;
      conteudo += '═══════════════════════════════════════════════════\n\n';
      
      if (pedido.observacoes) {
        conteudo += `Observações: ${pedido.observacoes}\n\n`;
      }
      
      conteudo += '\n            Obrigado pela preferência!\n';
      conteudo += '     Este documento não tem valor fiscal\n';

      fs.writeFileSync(txtPath, conteudo, 'utf8');
      arquivosGerados.push(nomeArquivo);
    }

    res.json({
      success: true,
      message: `${arquivosGerados.length} comprovante(s) gerado(s) com sucesso!`,
      local: desktopPath,
      arquivos: arquivosGerados
    });

  } catch (error) {
    console.error('Erro ao gerar comprovantes:', error);
    res.status(500).json({ error: 'Erro ao gerar comprovantes: ' + (error as Error).message });
  }
});

// ===== RESETAR TODOS OS PEDIDOS (TESTE/MANUAL) =====
router.delete('/resetar-todos', async (req: AuthRequest, res: Response) => {
  try {
    console.log('\n🗑️  Iniciando reset manual de pedidos...');
    
    const resultItens = await db.runAsync('DELETE FROM itens_pedido');
    console.log(`✅ ${resultItens.changes} itens de pedidos deletados`);
    
    const resultPedidos = await db.runAsync('DELETE FROM pedidos');
    console.log(`✅ ${resultPedidos.changes} pedidos deletados`);
    
    await db.runAsync('DELETE FROM sqlite_sequence WHERE name IN ("pedidos", "itens_pedido")');
    console.log('✅ IDs resetados (próximo pedido será #1)');
    
    res.json({
      success: true,
      message: 'Todos os pedidos foram resetados com sucesso!',
      detalhes: {
        itens_deletados: resultItens.changes,
        pedidos_deletados: resultPedidos.changes
      }
    });
  } catch (error) {
    console.error('❌ Erro ao resetar pedidos:', error);
    res.status(500).json({ error: 'Erro ao resetar pedidos: ' + (error as Error).message });
  }
});

// ===== BUSCAR PEDIDO POR ID =====
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const pedido = await db.getAsync<Pedido & { 
      cliente_nome: string; 
      cliente_telefone: string; 
      cliente_endereco: string;
      itens?: any[] 
    }>(`
      SELECT p.*, c.nome as cliente_nome, c.telefone as cliente_telefone, 
             c.endereco as cliente_endereco
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    pedido.itens = await db.allAsync(`
      SELECT ip.*, pr.nome as produto_nome, pr.tipo as produto_tipo
      FROM itens_pedido ip
      LEFT JOIN produtos pr ON ip.produto_id = pr.id
      WHERE ip.pedido_id = ?
    `, [pedido.id]);

    res.json(pedido);

  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// ===== CRIAR NOVO PEDIDO =====
router.post('/', [
  body('cliente_id').isInt().withMessage('Cliente inválido'),
  body('forma_pagamento').notEmpty().withMessage('Forma de pagamento é obrigatória'),
  body('itens').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos 1 item'),
  body('itens.*.produto_id').isInt().withMessage('Produto inválido'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cliente_id, forma_pagamento, observacoes, itens } = req.body;

  try {
    const cliente = await db.getAsync<{ id: number }>('SELECT id FROM clientes WHERE id = ? AND ativo = 1', [cliente_id]);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    let valorTotal = 0;
    const itensComPreco: Array<{ produto_id: number; quantidade: number; preco_unitario: number; subtotal: number }> = [];

    for (const item of itens) {
      const produto = await db.getAsync<Produto>('SELECT id, preco, disponivel FROM produtos WHERE id = ?', [item.produto_id]);
      
      if (!produto) {
        return res.status(404).json({ error: `Produto ${item.produto_id} não encontrado` });
      }

      if (!produto.disponivel) {
        return res.status(400).json({ error: `Produto ${item.produto_id} não está disponível` });
      }

      const subtotal = produto.preco * item.quantidade;
      valorTotal += subtotal;

      itensComPreco.push({
        produto_id: produto.id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
        subtotal
      });
    }

    const resultPedido = await db.runAsync(`
      INSERT INTO pedidos (cliente_id, valor_total, forma_pagamento, observacoes)
      VALUES (?, ?, ?, ?)
    `, [cliente_id, valorTotal, forma_pagamento, observacoes]);

    const pedidoId = resultPedido.lastID;

    for (const item of itensComPreco) {
      await db.runAsync(`
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [pedidoId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal]);
    }

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      id: pedidoId,
      valor_total: valorTotal
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// ===== ATUALIZAR STATUS DO PEDIDO =====
router.patch('/:id/status', [
  body('status').isIn(['pendente', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado']).withMessage('Status inválido')
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    const result = await db.runAsync(`
      UPDATE pedidos 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Status atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ===== CANCELAR PEDIDO =====
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await db.runAsync(`
      UPDATE pedidos 
      SET status = 'cancelado', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ 
      success: true, 
      message: 'Pedido cancelado com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ error: 'Erro ao cancelar pedido' });
  }
});

export default router;
