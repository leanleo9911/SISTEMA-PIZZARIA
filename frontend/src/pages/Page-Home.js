/**
 * ============================================================================
 * PÁGINA INICIAL (HOME) - SISTEMA PIZZARIA
 * ============================================================================
 * 
 * Página de entrada do sistema, exibida para clientes.
 * 
 * Funcionalidades:
 * - Exibe nome e informações da pizzaria (carregadas do config-pizzaria.json)
 * - Botão para acessar o cardápio e fazer pedidos
 * - Botão secreto no canto superior direito para acessar área administrativa
 * 
 * Tecnologias:
 * - React + React Router
 * - React Icons (ícones)
 * - CSS com gradiente roxo
 * 
 * Configuração:
 * - Dados da pizzaria em: src/data/config-pizzaria.json
 * - Estilos em: styles.css
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPizzaSlice, FaShoppingCart, FaLock } from 'react-icons/fa';
import configPizzaria from '../data/config-pizzaria.json';
import './styles.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Botão Admin Oculto no Canto Superior Direito */}
      <div 
        className="admin-secret-button" 
        onClick={() => navigate('/login')}
        title="Área Administrativa"
      >
        <FaLock />
      </div>

      <div className="home-content">
        <div className="home-header">
          <FaPizzaSlice className="logo-icon-large" />
          <h1>{configPizzaria.nome}</h1>
          <p className="tagline">A melhor pizza da cidade!</p>
          <p className="home-endereco">{configPizzaria.endereco.enderecoCompleto}</p>
        </div>

        <div className="home-buttons home-buttons-center">
          <div className="home-card home-card-large" onClick={() => navigate('/pedidos-cliente')}>
            <div className="card-icon pedidos">
              <FaShoppingCart />
            </div>
            <h2>Fazer Pedido</h2>
            <p>Faça seu pedido online de forma rápida e prática</p>
            <button className="btn-home btn-pedidos">
              Fazer Pedido
            </button>
          </div>
        </div>

        <footer className="home-footer">
          <p>📍 {configPizzaria.endereco.enderecoCompleto}</p>
          <p>📞 {configPizzaria.contato.telefone} | � {configPizzaria.contato.whatsapp}</p>
          <p>⏰ {configPizzaria.horario.funcionamento}</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
