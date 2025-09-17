// ===============================
// ARQUIVO PRINCIPAL DO SISTEMA PIZZARIA
// Responsável por integrar todos os módulos e exibir o menu principal
// ===============================
// Importação dos módulos de cada funcionalidade do sistema
import { menuCliente } from './clientes/cadastro_clientes';
import { menuProduto } from './produtos/cadastro_produtos';
import { menuPedido } from './pedidos/registro_pedido';
import { relatorioVendas } from './relatorios/relatorios_vendas';
import { menuPromocoes } from './extras/promoçoes';
import readlineSync from 'readline-sync';

function menu(): void {
  // Menu principal do sistema: permite acessar clientes, produtos, pedidos, relatórios e promoções
  while (true) {
    console.log('\n🍕 Sistema da Pizzaria');
    console.log('1. Menu de Clientes (Cadastrar/Consultar/Atualizar/Excluir)');
    console.log('2. Menu de Produtos (Cadastrar/Consultar/Atualizar/Excluir)');
    console.log('3. Menu de Pedidos (Registrar/Consultar/Atualizar)');
    console.log('4. Ver Relatório de Vendas');
    console.log('5. Menu de Promoções (Adicionar/Consultar/Atualizar/Excluir)');
    console.log('0. Sair');
    const opcao = readlineSync.question('Escolha uma opcao: ');
    if (opcao === '1') {
      menuCliente();
    } else if (opcao === '2') {
      menuProduto();
    } else if (opcao === '3') {
      menuPedido();
    } else if (opcao === '4') {
      relatorioVendas();
    } else if (opcao === '5') {
      menuPromocoes();
    } else if (opcao === '0') {
      console.log('👋 Encerrando o sistema.');
      break;
    } else {
      console.log('❌ Opcao invalida.');
    }
  }
}

function testeRapido(): void {
  // Função de teste rápido para verificar se o sistema está funcionando
  console.log('Teste rápido: O sistema está funcionando!');
}

testeRapido();
menu();
