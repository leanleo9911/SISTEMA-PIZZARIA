import React, { useState, useEffect } from 'react';
import Layout from '../components/Component-Layout';
import api from '../services/service-api';
import { FaChartLine, FaBoxOpen, FaCreditCard, FaCalendar, FaDownload } from 'react-icons/fa';
import './styles.css';

const Relatorios = () => {
  const [relatorio, setRelatorio] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRelatorio = async () => {
    setLoading(true);
    try {
      // Buscar vendas
      const vendas = await api.get('/relatorios/vendas', {
        params: { data_inicio: dataInicio, data_fim: dataFim }
      });
      setRelatorio(vendas.data);

      // Buscar produtos mais vendidos
      const prods = await api.get('/relatorios/produtos', {
        params: { data_inicio: dataInicio, data_fim: dataFim }
      });
      setProdutos(prods.data);

      // Buscar formas de pagamento
      const pags = await api.get('/relatorios/pagamentos', {
        params: { data_inicio: dataInicio, data_fim: dataFim }
      });
      setPagamentos(pags.data);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = () => {
    if (!relatorio) return;
    
    let conteudo = `RELATÓRIO DE VENDAS - SISTEMA PIZZARIA\n`;
    conteudo += `Período: ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}\n`;
    conteudo += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    conteudo += `========================================\n`;
    conteudo += `RESUMO GERAL\n`;
    conteudo += `========================================\n`;
    conteudo += `Total de Pedidos: ${relatorio.totais?.pedidos || 0}\n`;
    conteudo += `Valor Total: R$ ${(relatorio.totais?.valor_total || 0).toFixed(2)}\n`;
    conteudo += `Ticket Médio: R$ ${(relatorio.totais?.ticket_medio || 0).toFixed(2)}\n\n`;
    
    if (produtos.length > 0) {
      conteudo += `========================================\n`;
      conteudo += `PRODUTOS MAIS VENDIDOS\n`;
      conteudo += `========================================\n`;
      produtos.forEach((p, i) => {
        conteudo += `${i + 1}. ${p.nome} (${p.tipo})\n`;
        conteudo += `   Quantidade: ${p.quantidade_total || 0} | Valor: R$ ${parseFloat(p.valor_total || 0).toFixed(2)}\n`;
      });
      conteudo += `\n`;
    }

    if (pagamentos.length > 0) {
      conteudo += `========================================\n`;
      conteudo += `FORMAS DE PAGAMENTO\n`;
      conteudo += `========================================\n`;
      pagamentos.forEach(p => {
        conteudo += `${p.forma_pagamento}: ${p.quantidade} pedidos - R$ ${parseFloat(p.valor_total || 0).toFixed(2)}\n`;
      });
    }

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${new Date().getTime()}.txt`;
    a.click();
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <h1><FaChartLine /> Relatórios de Vendas</h1>
          {relatorio && (
            <button className="btn btn-success" onClick={exportarRelatorio}>
              <FaDownload /> Exportar Relatório
            </button>
          )}
        </div>

        <div className="filtros-relatorio">
          <div className="filtro-grupo">
            <label><FaCalendar /> Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="filtro-grupo">
            <label><FaCalendar /> Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={loadRelatorio}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>

        {relatorio && (
          <>
            {/* Cards de Resumo */}
            <div className="cards-resumo">
              <div className="card-stat">
                <div className="card-icon blue">
                  <FaChartLine />
                </div>
                <div className="card-info">
                  <h3>Total de Pedidos</h3>
                  <p className="stat-number">{relatorio.totais?.pedidos || 0}</p>
                </div>
              </div>

              <div className="card-stat">
                <div className="card-icon green">
                  <FaChartLine />
                </div>
                <div className="card-info">
                  <h3>Faturamento Total</h3>
                  <p className="stat-number green">
                    R$ {(relatorio.totais?.valor_total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="card-stat">
                <div className="card-icon gold">
                  <FaChartLine />
                </div>
                <div className="card-info">
                  <h3>Ticket Médio</h3>
                  <p className="stat-number gold">
                    R$ {(relatorio.totais?.ticket_medio || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Produtos Mais Vendidos */}
            {produtos.length > 0 && (
              <div className="table-card">
                <h2 className="section-title">
                  <FaBoxOpen /> Produtos Mais Vendidos
                </h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produto</th>
                      <th>Tipo</th>
                      <th>Qtd. Vendida</th>
                      <th>Vezes Vendido</th>
                      <th>Valor Total</th>
                      <th>% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto, index) => {
                      const percentual = relatorio.totais?.valor_total > 0 
                        ? ((produto.valor_total / relatorio.totais.valor_total) * 100).toFixed(1)
                        : 0;
                      
                      return (
                        <tr key={produto.id}>
                          <td><strong>#{index + 1}</strong></td>
                          <td>{produto.nome}</td>
                          <td><span className="badge">{produto.tipo}</span></td>
                          <td className="text-center">{produto.quantidade_total || 0}</td>
                          <td className="text-center">{produto.vezes_vendido || 0}</td>
                          <td className="text-right">
                            <strong>R$ {parseFloat(produto.valor_total || 0).toFixed(2)}</strong>
                          </td>
                          <td className="text-center">
                            <span className="percentual">{percentual}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Formas de Pagamento */}
            {pagamentos.length > 0 && (
              <div className="table-card">
                <h2 className="section-title">
                  <FaCreditCard /> Formas de Pagamento
                </h2>
                <table>
                  <thead>
                    <tr>
                      <th>Forma de Pagamento</th>
                      <th>Quantidade de Pedidos</th>
                      <th>Valor Total</th>
                      <th>% do Total</th>
                      <th>Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map((pagamento, index) => {
                      const percentual = relatorio.totais?.valor_total > 0 
                        ? ((pagamento.valor_total / relatorio.totais.valor_total) * 100).toFixed(1)
                        : 0;
                      const ticketMedio = pagamento.quantidade > 0 
                        ? (pagamento.valor_total / pagamento.quantidade).toFixed(2)
                        : 0;
                      
                      return (
                        <tr key={index}>
                          <td><strong>{pagamento.forma_pagamento}</strong></td>
                          <td className="text-center">{pagamento.quantidade}</td>
                          <td className="text-right">
                            <strong>R$ {parseFloat(pagamento.valor_total || 0).toFixed(2)}</strong>
                          </td>
                          <td className="text-center">
                            <span className="percentual">{percentual}%</span>
                          </td>
                          <td className="text-right">R$ {ticketMedio}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Vendas por Data */}
            <div className="table-card">
              <h2 className="section-title">
                <FaCalendar /> Vendas por Período
              </h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Total de Pedidos</th>
                    <th>Valor Total</th>
                    <th>Ticket Médio do Dia</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.vendas?.length > 0 ? (
                    relatorio.vendas.map((venda, index) => {
                      const ticketMedioDia = venda.total_pedidos > 0 
                        ? (venda.valor_total / venda.total_pedidos).toFixed(2)
                        : 0;
                      
                      return (
                        <tr key={index}>
                          <td><strong>{new Date(venda.data + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></td>
                          <td className="text-center">{venda.total_pedidos}</td>
                          <td className="text-right">
                            <strong>R$ {parseFloat(venda.valor_total || 0).toFixed(2)}</strong>
                          </td>
                          <td className="text-right">R$ {ticketMedioDia}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">Nenhuma venda no período</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!relatorio && !loading && (
          <div className="empty-state">
            <FaChartLine size={64} />
            <h3>Selecione um período e clique em "Gerar Relatório"</h3>
            <p>Os relatórios apresentarão dados detalhados de vendas, produtos e pagamentos</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Relatorios;
