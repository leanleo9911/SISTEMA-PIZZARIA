import React, { useState, useEffect } from 'react';
import Layout from '../components/Component-Layout';
import api from '../services/service-api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import './styles.css';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'Pizza Tradicional', nome: '', descricao: '', preco: '', tamanho: '', disponivel: true
  });

  useEffect(() => {
    loadProdutos();
  }, [busca]);

  const loadProdutos = async () => {
    try {
      const response = await api.get('/produtos', { params: { busca } });
      setProdutos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/produtos/${editando}`, formData);
      } else {
        await api.post('/produtos', formData);
      }
      setShowModal(false);
      resetForm();
      loadProdutos();
    } catch (error) {
      alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        loadProdutos();
      } catch (error) {
        alert('Erro ao excluir');
      }
    }
  };

  const handleEdit = (produto) => {
    setEditando(produto.id);
    setFormData({
      tipo: produto.tipo,
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      tamanho: produto.tamanho || '',
      disponivel: produto.disponivel
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ tipo: 'Pizza Tradicional', nome: '', descricao: '', preco: '', tamanho: '', disponivel: true });
    setEditando(null);
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1>Produtos</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Novo Produto
          </button>
        </div>

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Tamanho</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => (
                  <tr key={produto.id}>
                    <td><span className="badge">{produto.tipo}</span></td>
                    <td>{produto.nome}</td>
                    <td>{produto.tamanho}</td>
                    <td>R$ {parseFloat(produto.preco).toFixed(2)}</td>
                    <td>{produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(produto)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(produto.id)}>
                        <FaTrash />
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
              <h2>{editando ? 'Editar Produto' : 'Novo Produto'}</h2>
              <form onSubmit={handleSubmit}>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="Pizza Tradicional">Pizza Tradicional</option>
                  <option value="Pizza Especial">Pizza Especial</option>
                  <option value="Bebida">Bebida</option>
                  <option value="Porções">Porções</option>
                  <option value="Sobremesa">Sobremesa</option>
                  <option value="Outro">Outro</option>
                </select>
                <input
                  type="text"
                  placeholder="Nome*"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Tamanho (P/M/G)"
                  value={formData.tamanho}
                  onChange={(e) => setFormData({ ...formData, tamanho: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço*"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Descrição"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows="3"
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={formData.disponivel}
                    onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                  />
                  Disponível
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editando ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Produtos;
