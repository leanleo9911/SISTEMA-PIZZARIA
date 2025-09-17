"use strict";
// ===============================
// MÓDULO DE PROMOÇÕES - SISTEMA PIZZARIA
// Funções para adicionar, consultar, atualizar e excluir promoções
// Utiliza arquivos CSV para guardar os dados
// ===============================
// Importação dos módulos necessários para manipular arquivos, caminhos e entrada do usuário
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarPromocoes = listarPromocoes;
exports.formasPagamento = formasPagamento;
exports.menuPromocoes = menuPromocoes;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const baseDir = __dirname;
const csvPath = path_1.default.join(baseDir, 'promocoes.csv');
function listarPromocoes() {
    // Lista todas as promoções cadastradas
    if (!fs_extra_1.default.existsSync(csvPath) || fs_extra_1.default.statSync(csvPath).size === 0) {
        console.log('Nenhuma promocao cadastrada.');
        return;
    }
    console.log('\n🎉 Promocoes Atuais:');
    const linhas = fs_extra_1.default.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    linhas.forEach((linha, idx) => {
        console.log(`${idx + 1}. ${linha}`);
    });
}
function formasPagamento() {
    // Exibe as formas de pagamento aceitas
    console.log('💳 Formas de Pagamento:');
    console.log('- Dinheiro');
    console.log('- Cartao de Credito/Debito');
    console.log('- Pix');
}
function menuPromocoes() {
    // Menu principal para acessar as funções de promoções
    // Função interna para adicionar uma nova promoção
    // Função interna para consultar promoções
    // Função interna para atualizar uma promoção existente
    // Função interna para excluir uma promoção
    function adicionarPromocao() {
        const descricao = readline_sync_1.default.question('Descricao da promocao: ');
        fs_extra_1.default.appendFileSync(csvPath, descricao + '\n', 'utf-8');
        console.log('✅ Promocao adicionada!');
    }
    function consultarPromocoes() {
        if (!fs_extra_1.default.existsSync(csvPath) || fs_extra_1.default.statSync(csvPath).size === 0) {
            console.log('Nenhuma promocao cadastrada.');
            return;
        }
        console.log('\n🎉 Promocoes Atuais:');
        const linhas = fs_extra_1.default.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
        linhas.forEach((linha, idx) => {
            console.log(`${idx + 1}. ${linha}`);
        });
    }
    function atualizarPromocao() {
        if (!fs_extra_1.default.existsSync(csvPath) || fs_extra_1.default.statSync(csvPath).size === 0) {
            console.log('Nenhuma promocao cadastrada.');
            return;
        }
        const promocoes = fs_extra_1.default.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
        consultarPromocoes();
        const num = readline_sync_1.default.question('Digite o numero da promocao para atualizar: ');
        const idx = parseInt(num) - 1;
        if (isNaN(idx) || idx < 0 || idx >= promocoes.length) {
            console.log('❌ Numero invalido.');
            return;
        }
        const novaDesc = readline_sync_1.default.question('Nova descricao: ');
        promocoes[idx] = novaDesc;
        fs_extra_1.default.writeFileSync(csvPath, promocoes.join('\n') + '\n', 'utf-8');
        console.log('✅ Promocao atualizada!');
    }
    function excluirPromocao() {
        if (!fs_extra_1.default.existsSync(csvPath) || fs_extra_1.default.statSync(csvPath).size === 0) {
            console.log('Nenhuma promocao cadastrada.');
            return;
        }
        const promocoes = fs_extra_1.default.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
        consultarPromocoes();
        const num = readline_sync_1.default.question('Digite o numero da promocao para excluir: ');
        const idx = parseInt(num) - 1;
        if (isNaN(idx) || idx < 0 || idx >= promocoes.length) {
            console.log('❌ Numero invalido.');
            return;
        }
        promocoes.splice(idx, 1);
        fs_extra_1.default.writeFileSync(csvPath, promocoes.join('\n') + '\n', 'utf-8');
        console.log('✅ Promocao excluida!');
    }
    while (true) {
        console.log('\n--- Menu de Promocoes ---');
        console.log('1. Adicionar Promocao');
        console.log('2. Consultar Promocoes');
        console.log('3. Atualizar Promocoes');
        console.log('4. Excluir Promocoes');
        console.log('0. Voltar');
        const escolha = readline_sync_1.default.question('Escolha uma opcao: ');
        if (escolha === '1') {
            adicionarPromocao();
        }
        else if (escolha === '2') {
            consultarPromocoes();
        }
        else if (escolha === '3') {
            atualizarPromocao();
        }
        else if (escolha === '4') {
            excluirPromocao();
        }
        else if (escolha === '0') {
            break;
        }
        else {
            console.log('❌ Opcao invalida.');
        }
    }
}
