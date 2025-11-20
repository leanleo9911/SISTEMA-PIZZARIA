/**
 * ============================================================================
 * DEFINIÇÕES DE TIPOS - SISTEMA PIZZARIA
 * ============================================================================
 */

// ===== TIPOS DE BANCO DE DADOS =====

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  role: 'admin' | 'funcionario';
  ativo: number;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: number;
  nome: string;
  data_nascimento?: string;
  email?: string;
  telefone: string;
  endereco?: string;
  cep?: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: number;
  tipo: string;
  nome: string;
  descricao?: string;
  preco: number;
  tamanho?: string;
  disponivel: number;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: number;
  cliente_id: number;
  status: 'pendente' | 'preparando' | 'entregando' | 'concluido' | 'cancelado';
  valor_total: number;
  forma_pagamento: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemPedido {
  id: number;
  pedido_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Promocao {
  id: number;
  titulo: string;
  descricao?: string;
  desconto_percentual?: number;
  data_inicio: string;
  data_fim: string;
  ativo: number;
  created_at: string;
}

// ===== TIPOS DE REQUEST ESTENDIDOS =====

export interface AuthRequest {
  userId?: number;
  userEmail?: string;
  userRole?: 'admin' | 'funcionario';
  body: any;
  params: any;
  query: any;
  headers: {
    authorization?: string;
    [key: string]: any;
  };
}

// ===== TIPOS DE DATABASE CONNECTION =====

export interface DatabaseResult {
  lastID: number;
  changes: number;
}

export interface DatabaseConnection {
  runAsync(sql: string, params?: any[]): Promise<DatabaseResult>;
  getAsync<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  allAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
}

// ===== TIPOS DE REQUEST/RESPONSE BODIES =====

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  role?: 'admin' | 'funcionario';
}

export interface ClienteRequest {
  nome: string;
  data_nascimento?: string;
  email?: string;
  telefone: string;
  endereco?: string;
  cep?: string;
}

export interface ProdutoRequest {
  tipo: string;
  nome: string;
  descricao?: string;
  preco: number;
  tamanho?: string;
  disponivel?: boolean;
}

export interface ItemPedidoRequest {
  produto_id: number;
  quantidade: number;
  preco_unitario?: number;
}

export interface PedidoPublicoRequest {
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
    email?: string;
  };
  itens: ItemPedidoRequest[];
  forma_pagamento: string;
  observacoes?: string;
}

// ===== TIPOS DE RELATÓRIOS =====

export interface DashboardStats {
  hoje: {
    pedidos: number;
    valor: number;
  };
  mes: {
    pedidos: number;
    valor: number;
  };
  status: Array<{ status: string; quantidade: number }>;
  total_clientes: number;
  produtos_mais_vendidos: Array<{
    nome: string;
    tipo: string;
    quantidade_vendida: number;
    valor_total: number;
  }>;
}

export interface VendasRelatorio {
  vendas: Array<{
    data: string;
    total_pedidos: number;
    valor_total: number;
  }>;
  totais: {
    pedidos: number;
    valor_total: number;
    ticket_medio: number;
  };
}
