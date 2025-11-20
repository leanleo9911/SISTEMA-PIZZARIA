import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/service-api';
import syncManager from '../services/sync-manager';
import { FaPizzaSlice, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaClock, FaTruck, FaWifi, FaCloudUploadAlt } from 'react-icons/fa';
import './styles.css';
import cepsComuns from '../data/ceps-comuns.json';
import configPizzaria from '../data/config-pizzaria.json';

const PedidosCliente = () => {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  
  // Estados para pagamento
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorTroco, setValorTroco] = useState('');
  const [showPixModal, setShowPixModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState({ preparo: 30, entrega: 0, total: 30 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadProdutos();
    
    // Atualizar contagem de pedidos pendentes
    setPedidosPendentes(syncManager.getPendingCount());
    
    // Monitorar status de conexão
    const handleOnline = () => {
      setIsOnline(true);
      syncManager.syncPendingOrders().then(() => {
        setPedidosPendentes(syncManager.getPendingCount());
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadProdutos = async () => {
    try {
      const response = await api.get('/produtos/publico');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const buscarCEP = async (cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      // 1. Tentar buscar no cache local (localStorage)
      const cepCache = localStorage.getItem(`cep_${cepLimpo}`);
      
      if (cepCache) {
        const data = JSON.parse(cepCache);
        setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        setBairro(data.bairro);
        setCidade(data.localidade);
        calcularTempoEntrega(data.bairro, data.localidade);
        console.log('✅ CEP carregado do cache local');
        return;
      }

      // 2. Tentar buscar no banco de dados local (JSON)
      if (cepsComuns[cepLimpo]) {
        const data = cepsComuns[cepLimpo];
        // Salvar no cache também
        localStorage.setItem(`cep_${cepLimpo}`, JSON.stringify(data));
        
        setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        setBairro(data.bairro);
        setCidade(data.localidade);
        calcularTempoEntrega(data.bairro, data.localidade);
        console.log('✅ CEP carregado do banco local (offline)');
        return;
      }

      // 3. Buscar online (ViaCEP)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          // Salvar no cache para uso offline futuro
          localStorage.setItem(`cep_${cepLimpo}`, JSON.stringify(data));
          
          setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
          setBairro(data.bairro);
          setCidade(data.localidade);
          calcularTempoEntrega(data.bairro, data.localidade);
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

  const calcularTempoEntrega = (bairroInput, cidadeInput) => {
    // Tempo base de preparo (em minutos)
    const tempoPreparo = carrinho.length > 3 ? 40 : 30;
    
    let tempoEntrega = 40; // Tempo padrão para bairros não mapeados
    
    // Verificar se o cliente está na mesma cidade da pizzaria
    if (cidadeInput.toLowerCase() === configPizzaria.endereco.cidade.toLowerCase()) {
      const bairroLower = bairroInput.toLowerCase();
      
      // Buscar nas zonas de entrega configuradas
      const zonas = configPizzaria.delivery.zonasEntrega;
      
      // Zona 1 - Bairros próximos (15 min)
      if (zonas.zona1.bairros.some(b => bairroLower.includes(b.toLowerCase()))) {
        tempoEntrega = zonas.zona1.tempoEntrega;
      }
      // Zona 2 - Bairros intermediários (25 min)
      else if (zonas.zona2.bairros.some(b => bairroLower.includes(b.toLowerCase()))) {
        tempoEntrega = zonas.zona2.tempoEntrega;
      }
      // Zona 3 - Bairros distantes (40 min)
      else if (zonas.zona3.bairros.some(b => bairroLower.includes(b.toLowerCase()))) {
        tempoEntrega = zonas.zona3.tempoEntrega;
      }
      // Bairros não mapeados em Jundiaí (usar tempo padrão da Zona 2)
      else {
        tempoEntrega = 25;
      }
    } else {
      // Outras cidades - tempo maior
      tempoEntrega = 60;
    }
    
    const tempoTotal = tempoPreparo + tempoEntrega;
    
    setTempoEstimado({
      preparo: tempoPreparo,
      entrega: tempoEntrega,
      total: tempoTotal
    });
  };

  useEffect(() => {
    if (bairro && cidade) {
      calcularTempoEntrega(bairro, cidade);
    }
  }, [carrinho]);

  const handleCepChange = (e) => {
    const cepValue = e.target.value;
    setCep(cepValue);
    
    if (cepValue.replace(/\D/g, '').length === 8) {
      buscarCEP(cepValue);
    }
  };

  const handleTelefoneChange = (e) => {
    let telefoneValue = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    if (telefoneValue.length > 11) {
      telefoneValue = telefoneValue.slice(0, 11);
    }
    
    // Aplica a máscara
    if (telefoneValue.length <= 10) {
      // Formato: (XX) XXXX-XXXX
      telefoneValue = telefoneValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      // Formato: (XX) XXXXX-XXXX
      telefoneValue = telefoneValue.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    setTelefone(telefoneValue);
  };

  const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.id === produto.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };

  const alterarQuantidade = (produtoId, delta) => {
    setCarrinho(carrinho.map(item =>
      item.id === produtoId
        ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
        : item
    ).filter(item => item.quantidade > 0));
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter(item => item.id !== produtoId));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const finalizarPedido = async () => {
    // Validar campos e marcar em vermelho os que estão vazios
    const camposVazios = [];
    
    if (!nomeCliente) {
      camposVazios.push('nome');
      document.querySelector('input[placeholder="Nome completo"]')?.classList.add('campo-erro');
    }
    if (!telefone) {
      camposVazios.push('telefone');
      document.querySelector('input[placeholder="Telefone"]')?.classList.add('campo-erro');
    }
    if (!email) {
      camposVazios.push('email');
      document.querySelector('input[placeholder="E-mail"]')?.classList.add('campo-erro');
    }
    if (!endereco) {
      camposVazios.push('endereço');
      document.querySelector('input[placeholder="Endereço completo"]')?.classList.add('campo-erro');
    }
    if (!formaPagamento) {
      camposVazios.push('forma de pagamento');
      document.querySelector('select')?.classList.add('campo-erro');
    }
    
    if (camposVazios.length > 0) {
      return;
    }

    if (carrinho.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const enderecoCompleto = complemento 
        ? `${endereco} - ${complemento}` 
        : endereco;

      // Montar observações com info de pagamento
      let observacoes = 'Pedido via sistema online';
      
      if (formaPagamento === 'Dinheiro' && precisaTroco) {
        observacoes += ` | Troco para: ${valorTroco}`;
      }
      
      if (formaPagamento === 'Pix') {
        observacoes += ' | Pagamento via PIX';
      }

      const pedido = {
        cliente: {
          nome: nomeCliente,
          telefone,
          email,
          endereco: enderecoCompleto
        },
        itens: carrinho.map(item => ({
          produto_id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        })),
        forma_pagamento: formaPagamento,
        observacoes: observacoes
      };

      // Verificar se está online
      if (navigator.onLine) {
        // Tentar enviar diretamente
        try {
          await api.post('/pedidos/publico', pedido);
          setSucesso(true);
        } catch (error) {
          // Se falhar, salvar offline
          console.error('Erro ao enviar pedido online, salvando offline:', error);
          syncManager.addToQueue(pedido);
          setPedidosPendentes(syncManager.getPendingCount());
          setSucesso(true);
        }
      } else {
        // Salvar offline
        syncManager.addToQueue(pedido);
        setPedidosPendentes(syncManager.getPendingCount());
        setSucesso(true);
      }
      
      // Limpar formulário
      setCarrinho([]);
      setNomeCliente('');
      setTelefone('');
      setEmail('');
      setCep('');
      setEndereco('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setFormaPagamento('');
      setPrecisaTroco(false);
      setValorTroco('');
      setShowPixModal(false);

      setTimeout(() => setSucesso(false), 5000);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('❌ Erro ao processar pedido. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = filtroTipo === 'todos' 
    ? produtos 
    : produtos.filter(p => p.tipo === filtroTipo);

  return (
    <div className="pedidos-cliente-container">
      <header className="pedidos-header">
        <button className="btn-voltar" onClick={() => navigate('/')}>
          <FaArrowLeft /> Voltar
        </button>
        <div className="header-info">
          <div className="header-titulo">
            <FaPizzaSlice className="header-icon" />
            <div>
              <h1>{configPizzaria.nome}</h1>
              <p className="header-subtitulo">{configPizzaria.endereco.enderecoCompleto}</p>
              <p className="header-contato">📞 {configPizzaria.contato.telefone} | 📱 {configPizzaria.contato.whatsapp}</p>
            </div>
          </div>
        </div>
        
        {/* Indicador de conexão e pedidos pendentes */}
        <div className="connection-status">
          {isOnline ? (
            <span className="status-online" title="Conectado">
              <FaWifi /> Online
            </span>
          ) : (
            <span className="status-offline" title="Sem conexão">
              <FaWifi /> Offline
            </span>
          )}
          {pedidosPendentes > 0 && (
            <span className="pedidos-pendentes" title={`${pedidosPendentes} pedido(s) aguardando sincronização`}>
              <FaCloudUploadAlt /> {pedidosPendentes}
            </span>
          )}
        </div>
        
        <div className="carrinho-badge">
          <FaShoppingCart />
          <span>{carrinho.length}</span>
        </div>
      </header>

      {sucesso && (
        <div className="alert-sucesso">
          ✅ Pedido realizado com sucesso! Entraremos em contato em breve.
        </div>
      )}

      <div className="pedidos-content">
        <div className="produtos-section">
          <div className="filtros">
            <button className={filtroTipo === 'todos' ? 'active' : ''} onClick={() => setFiltroTipo('todos')}>
              Todos
            </button>
            <button className={filtroTipo === 'Pizza' ? 'active' : ''} onClick={() => setFiltroTipo('Pizza')}>
              Pizzas
            </button>
            <button className={filtroTipo === 'Bebida' ? 'active' : ''} onClick={() => setFiltroTipo('Bebida')}>
              Bebidas
            </button>
            <button className={filtroTipo === 'Porção' ? 'active' : ''} onClick={() => setFiltroTipo('Porção')}>
              Porções
            </button>
            <button className={filtroTipo === 'Sobremesa' ? 'active' : ''} onClick={() => setFiltroTipo('Sobremesa')}>
              Sobremesas
            </button>
          </div>

          <div className="produtos-grid">
            {produtosFiltrados.length === 0 ? (
              <div className="sem-produtos">
                <p>Nenhum produto encontrado nesta categoria.</p>
              </div>
            ) : (
              produtosFiltrados.map(produto => (
                <div key={produto.id} className="produto-card">
                  <div className="produto-tipo">{produto.tipo}</div>
                  <h3>{produto.nome}</h3>
                  {produto.tamanho && (
                    <div className="produto-tamanho">
                      <strong>Tamanho:</strong> {produto.tamanho}
                    </div>
                  )}
                  {produto.descricao && <p className="produto-desc">{produto.descricao}</p>}
                  <div className="produto-footer">
                    <span className="produto-preco">R$ {parseFloat(produto.preco).toFixed(2)}</span>
                    <button className="btn-adicionar" onClick={() => adicionarAoCarrinho(produto)}>
                      <FaPlus /> Adicionar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="carrinho-section">
          <h2><FaShoppingCart /> Seu Pedido</h2>
          
          {carrinho.length === 0 ? (
            <p className="carrinho-vazio">Seu carrinho está vazio</p>
          ) : (
            <>
              <div className="carrinho-itens-simples">
                {carrinho.map(item => (
                  <div key={item.id} className="carrinho-item-simples">
                    <div className="item-principal">
                      <span className="item-qtd">{item.quantidade}x</span>
                      <div className="item-nome-preco">
                        <strong>{item.nome}</strong>
                        {item.tamanho && <span className="tag-tamanho">{item.tamanho}</span>}
                      </div>
                      <span className="item-valor">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                    </div>
                    <div className="item-acoes">
                      <button className="btn-qty" onClick={() => alterarQuantidade(item.id, -1)}>
                        <FaMinus />
                      </button>
                      <button className="btn-qty" onClick={() => alterarQuantidade(item.id, 1)}>
                        <FaPlus />
                      </button>
                      <button className="btn-remover-simples" onClick={() => removerDoCarrinho(item.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-section">
                <h3>Total: <span className="total-valor">R$ {calcularTotal().toFixed(2)}</span></h3>
              </div>

              <div className="dados-cliente">
                <h3>Dados para Entrega</h3>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nomeCliente}
                  onChange={(e) => {
                    setNomeCliente(e.target.value);
                    e.target.classList.remove('campo-erro');
                  }}
                />
                <input
                  type="tel"
                  placeholder="Telefone (WhatsApp) - ex: (11) 98765-4321"
                  value={telefone}
                  onChange={(e) => {
                    handleTelefoneChange(e);
                    e.target.classList.remove('campo-erro');
                  }}
                  minLength="14"
                  maxLength="15"
                  required
                />
                <input
                  type="email"
                  placeholder="Email - ex: seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    e.target.classList.remove('campo-erro');
                  }}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Digite um email válido (ex: usuario@dominio.com)"
                  required
                />
                <input
                  type="text"
                  placeholder="CEP (ex: 12345-678)"
                  value={cep}
                  onChange={handleCepChange}
                  maxLength="9"
                />
                <textarea
                  placeholder="Endereço completo para entrega (preenchido automaticamente)"
                  value={endereco}
                  onChange={(e) => {
                    setEndereco(e.target.value);
                    e.target.classList.remove('campo-erro');
                  }}
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Complemento (opcional) - ex: Apto 101, Bloco B, Portão azul"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  maxLength="100"
                />
                <select
                  value={formaPagamento}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setFormaPagamento(valor);
                    e.target.classList.remove('campo-erro');
                    
                    // Resetar campos ao mudar forma de pagamento
                    setPrecisaTroco(false);
                    setValorTroco('');
                    
                    // Se escolher Pix, abrir modal
                    if (valor === 'Pix') {
                      setShowPixModal(true);
                    }
                  }}
                >
                  <option value="">Forma de Pagamento</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Pix">Pix</option>
                </select>

                {/* Campo para DINHEIRO - Troco */}
                {formaPagamento === 'Dinheiro' && (
                  <div className="campo-pagamento-extra">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={precisaTroco}
                        onChange={(e) => {
                          setPrecisaTroco(e.target.checked);
                          if (!e.target.checked) setValorTroco('');
                        }}
                      />
                      <span>Precisa de troco?</span>
                    </label>
                    
                    {precisaTroco && (
                      <input
                        type="text"
                        placeholder="Troco para quanto? Ex: R$ 100,00"
                        value={valorTroco}
                        onChange={(e) => setValorTroco(e.target.value)}
                        style={{ marginTop: '10px' }}
                      />
                    )}
                  </div>
                )}

                {/* Informação para CARTÃO */}
                {(formaPagamento === 'Cartão de Crédito' || formaPagamento === 'Cartão de Débito') && (
                  <div className="info-pagamento">
                    <p>💳 <strong>{formaPagamento}</strong></p>
                    <p>A máquina de cartão será levada no momento da entrega.</p>
                    <p>Tenha seu cartão em mãos para realizar o pagamento.</p>
                  </div>
                )}

                {cep && tempoEstimado.total > 0 && (
                  <div className="estimativa-tempo-inline">
                    <div className="tempo-card-inline">
                      <FaClock className="tempo-icon-inline" />
                      <div className="tempo-info-inline">
                        <span className="tempo-label-inline">Preparo</span>
                        <span className="tempo-valor-inline">{tempoEstimado.preparo} min</span>
                      </div>
                    </div>
                    <div className="tempo-card-inline">
                      <FaTruck className="tempo-icon-inline" />
                      <div className="tempo-info-inline">
                        <span className="tempo-label-inline">Entrega</span>
                        <span className="tempo-valor-inline">{tempoEstimado.entrega} min</span>
                      </div>
                    </div>
                    <div className="tempo-total-inline">
                      <strong>⏱️ Tempo Total</strong>
                      <span className="tempo-total-valor-inline">{tempoEstimado.total} min</span>
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="btn-finalizar" 
                onClick={finalizarPedido}
                disabled={loading}
              >
                {loading ? 'Finalizando...' : 'Finalizar Pedido'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal PIX */}
      {showPixModal && (
        <div className="modal-overlay" onClick={() => setShowPixModal(false)}>
          <div className="modal-pix" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPixModal(false)}>✕</button>
            
            <h2>💰 Pagamento via PIX</h2>
            
            <div className="pix-info">
              <h3>Chave PIX da Pizzaria:</h3>
              <div className="pix-chave">
                <strong>CNPJ:</strong> 12.345.678/0001-90
              </div>
              
              <div className="pix-instrucoes">
                <p>📱 <strong>Como pagar:</strong></p>
                <ol>
                  <li>Abra o app do seu banco</li>
                  <li>Escolha a opção PIX</li>
                  <li>Cole ou digite a chave CNPJ acima</li>
                  <li>Confirme o valor: <strong>R$ {calcularTotal().toFixed(2)}</strong></li>
                  <li>Finalize o pagamento</li>
                </ol>
                
                <p className="pix-aviso">
                  ⚠️ Após realizar o pagamento, clique em "Confirmar" abaixo para finalizar seu pedido.
                </p>
              </div>
              
              <button 
                className="btn-confirmar-pix"
                onClick={() => setShowPixModal(false)}
              >
                ✓ Confirmar Pagamento PIX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosCliente;
