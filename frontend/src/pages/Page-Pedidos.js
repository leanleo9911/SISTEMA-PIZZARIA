import React, { useState, useEffect } from 'react';
import Layout from '../components/Component-Layout';
import api from '../services/service-api';
import { FaPlus, FaFilePdf, FaEye, FaClock, FaUtensils, FaCheckCircle, FaTruck, FaTimes } from 'react-icons/fa';
import './styles.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '', forma_pagamento: 'Dinheiro', observacoes: '', itens: []
  });
  const [itemTemp, setItemTemp] = useState({ produto_id: '', quantidade: 1 });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [pedidosRes, clientesRes, produtosRes] = await Promise.all([
        api.get('/pedidos'),
        api.get('/clientes'),
        api.get('/produtos')
      ]);
      setPedidos(Array.isArray(pedidosRes.data) ? pedidosRes.data : []);
      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
      setProdutos(Array.isArray(produtosRes.data) ? produtosRes.data : []);
    } catch (error) {
      console.error('Erro:', error);
      setPedidos([]);
      setClientes([]);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (itemTemp.produto_id && itemTemp.quantidade > 0) {
      setFormData({
        ...formData,
        itens: [...formData.itens, { ...itemTemp }]
      });
      setItemTemp({ produto_id: '', quantidade: 1 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item');
      return;
    }
    try {
      await api.post('/pedidos', formData);
      setShowModal(false);
      resetForm();
      loadAll();
      alert('Pedido criado com sucesso!');
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({ cliente_id: '', forma_pagamento: 'Dinheiro', observacoes: '', itens: [] });
    setItemTemp({ produto_id: '', quantidade: 1 });
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/pedidos/${id}/status`, { status });
      loadAll();
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  const gerarComprovantes = async () => {
    try {
      const response = await api.get('/pedidos/gerar-comprovantes');
      
      if (response.data.success) {
        alert(
          `✅ ${response.data.message}\n\n` +
          `📁 Local: ${response.data.local}\n\n` +
          `Arquivos gerados:\n${response.data.arquivos.join('\n')}`
        );
      }
    } catch (error) {
      console.error('Erro ao gerar comprovantes:', error);
      alert('Erro ao gerar comprovantes: ' + (error.response?.data?.error || error.message));
    }
  };

  const verDetalhes = (pedido) => {
    setPedidoSelecionado(pedido);
    setShowDetalhes(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pendente': return <FaClock />;
      case 'preparando': return <FaUtensils />;
      case 'pronto': return <FaCheckCircle />;
      case 'saiu_entrega': return <FaTruck />;
      case 'entregue': return <FaCheckCircle />;
      case 'cancelado': return <FaTimes />;
      default: return <FaClock />;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pendente': return 'status-pendente';
      case 'preparando': return 'status-preparando';
      case 'pronto': return 'status-pronto';
      case 'saiu_entrega': return 'status-saiu-entrega';
      case 'entregue': return 'status-entregue';
      case 'cancelado': return 'status-cancelado';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'preparando': return 'Preparando';
      case 'pronto': return 'Pronto';
      case 'saiu_entrega': return 'Saiu p/ Entrega';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1>Pedidos</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={gerarComprovantes}>
              <FaFilePdf /> Gerar Comprovantes
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> Novo Pedido
            </button>
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Valor Total</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td><strong>#{pedido.id}</strong></td>
                    <td>{pedido.cliente_nome}</td>
                    <td className="text-right"><strong>R$ {parseFloat(pedido.valor_total).toFixed(2)}</strong></td>
                    <td>{pedido.forma_pagamento}</td>
                    <td>
                      <select
                        value={pedido.status}
                        onChange={(e) => updateStatus(pedido.id, e.target.value)}
                        className={`status-select ${getStatusClass(pedido.status)}`}
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="preparando">👨‍🍳 Preparando</option>
                        <option value="pronto">✅ Pronto</option>
                        <option value="saiu_entrega">🚚 Saiu p/ Entrega</option>
                        <option value="entregue">🎉 Entregue</option>
                        <option value="cancelado">❌ Cancelado</option>
                      </select>
                    </td>
                    <td>{new Date(pedido.created_at).toLocaleDateString('pt-BR')} {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <button className="btn-icon" onClick={() => verDetalhes(pedido)} title="Ver Detalhes">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Novo Pedido</h2>
              <form onSubmit={handleSubmit}>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  required
                >
                  <option value="">Selecione o cliente*</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>

                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Pix">Pix</option>
                </select>

                <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <h3 style={{ marginBottom: '10px' }}>Adicionar Item</h3>
                  <select
                    value={itemTemp.produto_id}
                    onChange={(e) => setItemTemp({ ...itemTemp, produto_id: e.target.value })}
                  >
                    <option value="">Selecione o produto</option>
                    {produtos.filter(p => p.disponivel).map(p => (
                      <option key={p.id} value={p.id}>{p.nome} - R$ {parseFloat(p.preco).toFixed(2)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={itemTemp.quantidade}
                    onChange={(e) => setItemTemp({ ...itemTemp, quantidade: parseInt(e.target.value) })}
                    placeholder="Quantidade"
                    style={{ marginTop: '10px' }}
                  />
                  <button type="button" className="btn btn-primary" onClick={addItem} style={{ marginTop: '10px', width: '100%' }}>
                    Adicionar Item
                  </button>
                </div>

                {formData.itens.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Itens: {formData.itens.length}</strong>
                  </div>
                )}

                <textarea
                  placeholder="Observações"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows="2"
                />

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Criar Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Pedido */}
        {showDetalhes && pedidoSelecionado && (
          <div className="modal-overlay" onClick={() => setShowDetalhes(false)}>
            <div className="modal modal-detalhes" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-detalhes">
                <h2>Detalhes do Pedido #{pedidoSelecionado.id}</h2>
                <div className={`status-badge ${getStatusClass(pedidoSelecionado.status)}`}>
                  {getStatusIcon(pedidoSelecionado.status)}
                  {getStatusLabel(pedidoSelecionado.status)}
                </div>
              </div>

              <div className="detalhes-grid">
                <div className="detalhes-section">
                  <h3>👤 Informações do Cliente</h3>
                  <p><strong>Nome:</strong> {pedidoSelecionado.cliente_nome}</p>
                  {pedidoSelecionado.cliente_telefone && (
                    <p><strong>Telefone:</strong> {pedidoSelecionado.cliente_telefone}</p>
                  )}
                  {pedidoSelecionado.cliente_email && (
                    <p><strong>Email:</strong> {pedidoSelecionado.cliente_email}</p>
                  )}
                  {pedidoSelecionado.cliente_endereco && (
                    <p><strong>Endereço:</strong> {pedidoSelecionado.cliente_endereco}</p>
                  )}
                </div>

                <div className="detalhes-section">
                  <h3>💰 Informações do Pagamento</h3>
                  <p><strong>Forma:</strong> {pedidoSelecionado.forma_pagamento}</p>
                  <p><strong>Total:</strong> <span className="valor-destaque">R$ {parseFloat(pedidoSelecionado.valor_total).toFixed(2)}</span></p>
                  <p><strong>Data:</strong> {new Date(pedidoSelecionado.created_at).toLocaleDateString('pt-BR')} às {new Date(pedidoSelecionado.created_at).toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>

              {pedidoSelecionado.observacoes && (
                <div className="detalhes-section">
                  <h3>📝 Observações</h3>
                  <p>{pedidoSelecionado.observacoes}</p>
                </div>
              )}

              <div className="detalhes-section">
                <h3>🍕 Itens do Pedido</h3>
                <div className="itens-lista">
                  {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
                    pedidoSelecionado.itens.map((item, index) => (
                      <div key={index} className="item-pedido">
                        <div className="item-quantidade">{item.quantidade}x</div>
                        <div className="item-detalhes">
                          <strong>{item.produto_nome}</strong>
                          {item.produto_tamanho && (
                            <span className="item-tamanho-badge">{item.produto_tamanho}</span>
                          )}
                          <span className="item-preco-unitario">R$ {parseFloat(item.preco_unitario).toFixed(2)} cada</span>
                        </div>
                        <div className="item-subtotal">
                          R$ {parseFloat(item.subtotal).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum item encontrado</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowDetalhes(false)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pedidos;
