import express, { Response } from 'express';
import db from '../database/database-connection';
import { authMiddleware } from '../middlewares/auth-middleware';
import { logError } from '../utils/logger';
import { AuthRequest, DashboardStats, VendasRelatorio } from '../types';

const router = express.Router();

router.use(authMiddleware);

// ===== DASHBOARD - ESTATÍSTICAS GERAIS =====
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    // Total de pedidos hoje
    const pedidosHoje = await db.getAsync<{ total: number; valor: number }>(`
      SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
      FROM pedidos
      WHERE DATE(created_at) = DATE('now', 'localtime')
      AND status != 'cancelado'
    `);

    // Total de pedidos do mês
    const pedidosMes = await db.getAsync<{ total: number; valor: number }>(`
      SELECT COUNT(*) as total, COALESCE(SUM(valor_total), 0) as valor
      FROM pedidos
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')
      AND status != 'cancelado'
    `);

    // Pedidos por status
    const pedidosPorStatus = await db.allAsync<{ status: string; quantidade: number }>(`
      SELECT status, COUNT(*) as quantidade
      FROM pedidos
      WHERE DATE(created_at) = DATE('now', 'localtime')
      GROUP BY status
    `);

    // Total de clientes ativos
    const totalClientes = await db.getAsync<{ total: number }>(`
      SELECT COUNT(*) as total FROM clientes WHERE ativo = 1
    `);

    // Produtos mais vendidos (top 5)
    const produtosMaisVendidos = await db.allAsync<{
      nome: string;
      tipo: string;
      quantidade_vendida: number;
      valor_total: number;
    }>(`
      SELECT pr.nome, pr.tipo, SUM(ip.quantidade) as quantidade_vendida,
             COALESCE(SUM(ip.subtotal), 0) as valor_total
      FROM itens_pedido ip
      JOIN produtos pr ON ip.produto_id = pr.id
      JOIN pedidos p ON ip.pedido_id = p.id
      WHERE DATE(p.created_at) >= DATE('now', 'localtime', '-30 days')
      AND p.status != 'cancelado'
      GROUP BY pr.id
      ORDER BY quantidade_vendida DESC
      LIMIT 5
    `);

    const response: DashboardStats = {
      hoje: {
        pedidos: pedidosHoje?.total || 0,
        valor: parseFloat((pedidosHoje?.valor || 0).toString())
      },
      mes: {
        pedidos: pedidosMes?.total || 0,
        valor: parseFloat((pedidosMes?.valor || 0).toString())
      },
      status: pedidosPorStatus || [],
      total_clientes: totalClientes?.total || 0,
      produtos_mais_vendidos: produtosMaisVendidos || []
    };

    res.json(response);

  } catch (error) {
    logError('Erro ao buscar dashboard', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Erro ao buscar estatísticas. Tente novamente.' });
  }
});

// ===== RELATÓRIO DE VENDAS =====
router.get('/vendas', async (req: AuthRequest, res: Response) => {
  try {
    const { data_inicio, data_fim, agrupamento = 'dia' } = req.query as { 
      data_inicio?: string; 
      data_fim?: string; 
      agrupamento?: string 
    };

    let query = `
      SELECT 
        DATE(created_at) as data,
        COUNT(*) as total_pedidos,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM pedidos
      WHERE status != 'cancelado'
    `;
    const params: any[] = [];

    if (data_inicio) {
      query += ' AND DATE(created_at) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(created_at) <= ?';
      params.push(data_fim);
    }

    // Agrupamento
    if (agrupamento === 'mes') {
      query = query.replace('DATE(created_at)', "strftime('%Y-%m', created_at)");
    }

    query += ' GROUP BY data ORDER BY data DESC';

    const vendas = await db.allAsync<{ data: string; total_pedidos: number; valor_total: number }>(query, params);

    // Calcular totais
    let totaisQuery = `
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(valor_total), 0) as valor_total,
        COALESCE(AVG(valor_total), 0) as ticket_medio
      FROM pedidos
      WHERE status != 'cancelado'
    `;
    
    if (data_inicio) {
      totaisQuery += ' AND DATE(created_at) >= ?';
    }
    if (data_fim) {
      totaisQuery += ' AND DATE(created_at) <= ?';
    }

    const totais = await db.getAsync<{ total_pedidos: number; valor_total: number; ticket_medio: number }>(totaisQuery, params);

    const response: VendasRelatorio = {
      vendas: vendas || [],
      totais: {
        pedidos: totais?.total_pedidos || 0,
        valor_total: parseFloat((totais?.valor_total || 0).toString()),
        ticket_medio: parseFloat((totais?.ticket_medio || 0).toString())
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// ===== RELATÓRIO DE PRODUTOS =====
router.get('/produtos', async (req: AuthRequest, res: Response) => {
  try {
    const { data_inicio, data_fim } = req.query as { data_inicio?: string; data_fim?: string };
    
    let query = `
      SELECT 
        pr.id, pr.nome, pr.tipo,
        COUNT(ip.id) as vezes_vendido,
        SUM(ip.quantidade) as quantidade_total,
        COALESCE(SUM(ip.subtotal), 0) as valor_total
      FROM produtos pr
      LEFT JOIN itens_pedido ip ON pr.id = ip.produto_id
      LEFT JOIN pedidos p ON ip.pedido_id = p.id
      WHERE (p.status != 'cancelado' OR p.status IS NULL)
    `;
    const params: any[] = [];

    if (data_inicio) {
      query += ' AND DATE(p.created_at) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(p.created_at) <= ?';
      params.push(data_fim);
    }

    query += ' GROUP BY pr.id ORDER BY quantidade_total DESC';

    const produtos = await db.allAsync(query, params);

    res.json(produtos);

  } catch (error) {
    logError('Erro ao gerar relatório de produtos', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// ===== RELATÓRIO DE FORMAS DE PAGAMENTO =====
router.get('/pagamentos', async (req: AuthRequest, res: Response) => {
  try {
    const { data_inicio, data_fim } = req.query as { data_inicio?: string; data_fim?: string };
    
    let query = `
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM pedidos
      WHERE status != 'cancelado'
    `;
    const params: any[] = [];

    if (data_inicio) {
      query += ' AND DATE(created_at) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(created_at) <= ?';
      params.push(data_fim);
    }

    query += ' GROUP BY forma_pagamento ORDER BY valor_total DESC';

    const pagamentos = await db.allAsync(query, params);

    res.json(pagamentos);

  } catch (error) {
    logError('Erro ao gerar relatório de pagamentos', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;
