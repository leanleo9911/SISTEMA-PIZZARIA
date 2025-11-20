import React, { useState, useEffect } from 'react';
import Layout from '../components/Component-Layout';
import api from '../services/service-api';
import { FaMoneyBillWave, FaShoppingCart, FaUsers, FaTrophy } from 'react-icons/fa';
import './styles.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/relatorios/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Carregando dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card gold">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-info">
              <h3>Vendas Hoje</h3>
              <p className="stat-value">R$ {(stats?.hoje?.valor || 0).toFixed(2)}</p>
              <span className="stat-label">{stats?.hoje?.pedidos || 0} pedidos</span>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon">
              <FaShoppingCart />
            </div>
            <div className="stat-info">
              <h3>Vendas do Mês</h3>
              <p className="stat-value">R$ {(stats?.mes?.valor || 0).toFixed(2)}</p>
              <span className="stat-label">{stats?.mes?.pedidos || 0} pedidos</span>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Clientes Ativos</h3>
              <p className="stat-value">{stats?.total_clientes || 0}</p>
              <span className="stat-label">cadastrados</span>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-info">
              <h3>Status Pedidos</h3>
              <p className="stat-value">{stats?.status?.length || 0}</p>
              <span className="stat-label">diferentes</span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="card">
            <h2>Produtos Mais Vendidos (30 dias)</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.produtos_mais_vendidos?.length > 0 ? (
                    stats.produtos_mais_vendidos.map((produto, index) => (
                      <tr key={index}>
                        <td>{produto.nome}</td>
                        <td><span className="badge">{produto.tipo}</span></td>
                        <td>{produto.quantidade_vendida}</td>
                        <td>R$ {parseFloat(produto.valor_total || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center'}}>Nenhum produto vendido ainda</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>Status dos Pedidos Hoje</h2>
            <div className="status-list">
              {stats?.status?.length > 0 ? (
                stats.status.map((item, index) => (
                  <div key={index} className="status-item">
                    <span className={`status-badge ${item.status}`}>{item.status}</span>
                    <span className="status-count">{item.quantidade} pedidos</span>
                  </div>
                ))
              ) : (
                <p style={{textAlign: 'center', padding: '20px'}}>Nenhum pedido hoje</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
