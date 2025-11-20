/**
 * ============================================================================
 * GERENCIADOR DE SINCRONIZAÇÃO OFFLINE
 * ============================================================================
 * 
 * Sistema de fila para armazenar pedidos offline e sincronizar quando
 * a conexão com internet for restaurada.
 * 
 * Funcionalidades:
 * - Salvar pedidos no localStorage quando offline
 * - Detectar quando conexão volta
 * - Sincronizar pedidos pendentes automaticamente
 * - Notificar usuário sobre status da sincronização
 */

class SyncManager {
  constructor() {
    this.QUEUE_KEY = 'pedidos_offline_queue';
    this.SYNC_STATUS_KEY = 'sync_status';
    this.init();
  }

  init() {
    // Verificar conexão ao iniciar
    this.checkConnectionAndSync();
    
    // Monitorar mudanças na conexão
    window.addEventListener('online', () => {
      console.log('✅ Conexão restaurada! Sincronizando pedidos...');
      this.syncPendingOrders();
    });
    
    window.addEventListener('offline', () => {
      console.log('⚠️ Sem conexão. Pedidos serão salvos localmente.');
    });
  }

  /**
   * Verifica se há conexão com internet
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Adiciona um pedido à fila offline
   */
  addToQueue(pedido) {
    const queue = this.getQueue();
    
    const pedidoComTimestamp = {
      ...pedido,
      timestamp: new Date().toISOString(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    queue.push(pedidoComTimestamp);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    
    console.log('💾 Pedido salvo offline:', pedidoComTimestamp.id);
    console.log('   Cliente:', pedidoComTimestamp.cliente);
    console.log('   Itens:', pedidoComTimestamp.itens?.length);
    console.log('   Forma pagamento:', pedidoComTimestamp.forma_pagamento);
    
    return pedidoComTimestamp.id;
  }

  /**
   * Obtém a fila de pedidos offline
   */
  getQueue() {
    try {
      const queue = localStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Erro ao ler fila offline:', error);
      return [];
    }
  }

  /**
   * Remove um pedido da fila após sincronização
   */
  removeFromQueue(pedidoId) {
    let queue = this.getQueue();
    queue = queue.filter(p => p.id !== pedidoId);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Obtém número de pedidos pendentes
   */
  getPendingCount() {
    return this.getQueue().length;
  }

  /**
   * Sincroniza pedidos pendentes com o servidor
   */
  async syncPendingOrders() {
    if (!this.isOnline()) {
      console.log('⚠️ Ainda sem conexão. Aguardando...');
      return { success: false, message: 'Sem conexão' };
    }

    const queue = this.getQueue();
    
    if (queue.length === 0) {
      console.log('✅ Nenhum pedido pendente para sincronizar');
      return { success: true, message: 'Nada para sincronizar' };
    }

    console.log(`🔄 Sincronizando ${queue.length} pedido(s) pendente(s)...`);
    
    const results = {
      total: queue.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Importar API dinamicamente para evitar dependência circular
    const api = (await import('../services/service-api')).default;

    for (const pedido of queue) {
      try {
        // Remover campos temporários antes de enviar
        const { id, timestamp, ...pedidoLimpo } = pedido;
        
        console.log('📤 Enviando pedido offline:', {
          id: pedido.id,
          cliente: pedidoLimpo.cliente,
          itens: pedidoLimpo.itens?.length,
          forma_pagamento: pedidoLimpo.forma_pagamento
        });
        
        const response = await api.post('/pedidos/publico', pedidoLimpo);
        
        console.log('📥 Resposta do servidor:', response.data);
        
        // Remover da fila após sucesso
        this.removeFromQueue(pedido.id);
        results.success++;
        
        console.log('✅ Pedido sincronizado:', pedido.id);
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          pedido: pedido.id,
          error: error.message,
          details: error.response?.data
        });
        console.error('❌ Erro ao sincronizar pedido:', pedido.id);
        console.error('   Detalhes:', error.response?.data || error.message);
      }
    }

    // Salvar status da sincronização
    this.setSyncStatus({
      lastSync: new Date().toISOString(),
      results
    });

    console.log('📊 Sincronização concluída:', results);
    
    return { success: true, results };
  }

  /**
   * Verifica conexão e tenta sincronizar
   */
  async checkConnectionAndSync() {
    if (this.isOnline() && this.getPendingCount() > 0) {
      setTimeout(() => {
        this.syncPendingOrders();
      }, 2000); // Aguarda 2s para garantir que servidor está acessível
    }
  }

  /**
   * Salva status da última sincronização
   */
  setSyncStatus(status) {
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
  }

  /**
   * Obtém status da última sincronização
   */
  getSyncStatus() {
    try {
      const status = localStorage.getItem(this.SYNC_STATUS_KEY);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Limpa toda a fila (use com cuidado!)
   */
  clearQueue() {
    localStorage.removeItem(this.QUEUE_KEY);
    console.log('🗑️ Fila offline limpa');
  }
}

// Criar instância única (singleton)
const syncManager = new SyncManager();

export default syncManager;
