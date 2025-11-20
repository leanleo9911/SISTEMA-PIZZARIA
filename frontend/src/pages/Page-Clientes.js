import React, { useState, useEffect } from 'react';
import Layout from '../components/Component-Layout';
import api from '../services/service-api';
import cepsComuns from '../data/ceps-comuns.json';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import './styles.css';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', data_nascimento: '', endereco: '', cep: ''
  });

  useEffect(() => {
    loadClientes();
  }, [busca]);

  const loadClientes = async () => {
    try {
      const response = await api.get('/clientes', { params: { busca } });
      const clientesData = Array.isArray(response.data) ? response.data : [];
      
      // Ordenar por ID (ordem de cadastro - mais antigos primeiro)
      const clientesOrdenados = clientesData.sort((a, b) => a.id - b.id);
      
      setClientes(clientesOrdenados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/clientes/${editando}`, formData);
      } else {
        await api.post('/clientes', formData);
      }
      setShowModal(false);
      resetForm();
      loadClientes();
    } catch (error) {
      alert('Erro ao salvar cliente: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente desativar este cliente?')) {
      try {
        const response = await api.delete(`/clientes/${id}`);
        alert('Cliente desativado com sucesso!');
        loadClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditando(cliente.id);
    setFormData({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone,
      data_nascimento: cliente.data_nascimento || '',
      endereco: cliente.endereco || '',
      cep: cliente.cep || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ nome: '', email: '', telefone: '', data_nascimento: '', endereco: '', cep: '' });
    setEditando(null);
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      // 1. Tentar localStorage (cache)
      const cached = localStorage.getItem(`cep_${cepLimpo}`);
      if (cached) {
        const data = JSON.parse(cached);
        setFormData(prev => ({
          ...prev,
          endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }));
        console.log('✅ CEP carregado do cache (offline)');
        return;
      }

      // 2. Tentar banco local (ceps-comuns.json)
      if (cepsComuns[cepLimpo]) {
        const data = cepsComuns[cepLimpo];
        // Salvar no cache
        localStorage.setItem(`cep_${cepLimpo}`, JSON.stringify(data));
        
        setFormData(prev => ({
          ...prev,
          endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
        }));
        console.log('✅ CEP carregado do banco local (offline)');
        return;
      }

      // 3. Buscar online (ViaCEP)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          // Salvar no cache
          localStorage.setItem(`cep_${cepLimpo}`, JSON.stringify(data));
          
          setFormData(prev => ({
            ...prev,
            endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
          }));
          console.log('✅ CEP buscado online e salvo no cache');
        } else {
          alert('CEP não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar CEP online:', error);
        alert('⚠️ Sem conexão com internet.\n\nEste CEP não está no banco local.\nConecte-se à internet ou use um CEP já consultado anteriormente.');
      }
    }
  };

  const handleCepChange = (e) => {
    const cep = e.target.value;
    setFormData({ ...formData, cep });
    
    if (cep.replace(/\D/g, '').length === 8) {
      buscarCEP(cep);
    }
  };

  const handleTelefoneChange = (e) => {
    let telefone = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    if (telefone.length > 11) {
      telefone = telefone.slice(0, 11);
    }
    
    // Aplica a máscara
    if (telefone.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      telefone = telefone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      // Formato: (XX) XXXXX-XXXX
      telefone = telefone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    setFormData({ ...formData, telefone });
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1>Clientes</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Novo Cliente
          </button>
        </div>

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
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
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td><strong>#{cliente.id}</strong></td>
                    <td>{cliente.nome}</td>
                    <td>{cliente.telefone}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.endereco}</td>
                    <td>
                      <button type="button" className="btn-icon" onClick={() => handleEdit(cliente)}>
                        <FaEdit />
                      </button>
                      <button type="button" className="btn-icon danger" onClick={() => handleDelete(cliente.id)}>
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
              <h2>{editando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Nome completo*"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefone* (ex: (11) 98765-4321)"
                  value={formData.telefone}
                  onChange={handleTelefoneChange}
                  minLength="14"
                  maxLength="15"
                  required
                />
                <input
                  type="email"
                  placeholder="Email* (ex: cliente@email.com)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Digite um email válido (ex: usuario@dominio.com)"
                  required
                />
                <input
                  type="date"
                  placeholder="Data de Nascimento"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="CEP (ex: 12345-678)*"
                  value={formData.cep}
                  onChange={handleCepChange}
                  maxLength="9"
                  required
                />
                <input
                  type="text"
                  placeholder="Endereço (preenchido automaticamente)"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  required
                />
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

export default Clientes;
