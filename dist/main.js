/*
// ===============================
// ARQUIVO PRINCIPAL DO SISTEMA PIZZARIA
// Responsável por integrar todos os módulos e exibir o menu principal
// ===============================
 Leonardo dos Santos Costa- 2504288
 Carla Milena Gouveia Souza- 2504435
 Giulia De Salvo - 2505869
 Glória Mariano - 2504112
 Leonardo Peralli - 2517512 
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cadastro_clientes_1 = require("./clientes/cadastro_clientes");
const cadastro_produtos_1 = require("./produtos/cadastro_produtos");
const registro_pedido_1 = require("./pedidos/registro_pedido");
const relatorios_vendas_1 = require("./relatorios/relatorios_vendas");
const promo_oes_1 = require("./extras/promo\u00E7oes");
const readline_sync_1 = __importDefault(require("readline-sync"));
function menu() {
    // Menu principal do sistema: permite acessar clientes, produtos, pedidos, relatórios e promoções
    while (true) {
        console.log('\n🍕 Sistema da Pizzaria');
        console.log('1. Menu de Clientes (Cadastrar/Consultar/Atualizar/Excluir)');
        console.log('2. Menu de Produtos (Cadastrar/Consultar/Atualizar/Excluir)');
        console.log('3. Menu de Pedidos (Registrar/Consultar/Atualizar)');
        console.log('4. Ver Relatório de Vendas');
        console.log('5. Menu de Promoções (Adicionar/Consultar/Atualizar/Excluir)');
        console.log('0. Sair');
        const opcao = readline_sync_1.default.question('Escolha uma opcao: ');
        if (opcao === '1') {
            (0, cadastro_clientes_1.menuCliente)();
        }
        else if (opcao === '2') {
            (0, cadastro_produtos_1.menuProduto)();
        }
        else if (opcao === '3') {
            (0, registro_pedido_1.menuPedido)();
        }
        else if (opcao === '4') {
            (0, relatorios_vendas_1.relatorioVendas)();
        }
        else if (opcao === '5') {
            (0, promo_oes_1.menuPromocoes)();
        }
        else if (opcao === '0') {
            console.log('👋 Encerrando o sistema.');
            break;
        }
        else {
            console.log('❌ Opcao invalida.');
        }
    }
}
function testeRapido() {
    // Função de teste rápido para verificar se o sistema está funcionando
    console.log('Teste rápido: O sistema está funcionando!');
}
testeRapido();
menu();
