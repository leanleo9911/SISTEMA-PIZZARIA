"use strict";
// ===============================
// MÓDULO DE PRODUTOS - SISTEMA PIZZARIA
// Funções para cadastrar, consultar, atualizar e excluir produtos
// Utiliza arquivos CSV para guardar os dados
// ===============================
// Importação dos módulos necessários para manipular arquivos, caminhos, entrada do usuário e CSV
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrarProduto = cadastrarProduto;
exports.menuProduto = menuProduto;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const baseDir = __dirname;
const csvPath = path_1.default.join(baseDir, 'produtos.csv');
const fieldnames = ['id', 'tipo', 'sabor', 'preco'];
function validarId(id) {
    // Valida se o ID tem exatamente 3 dígitos numéricos
    return /^\d{3}$/.test(id);
}
function validarTipo(tipo) {
    // Valida se o tipo do produto está entre as opções permitidas
    const tiposValidos = [
        "Pizza Tradicional", "Pizza Especial", "Bebida", "Porcoes", "Sobremesa", "Outro"
    ];
    return tiposValidos.includes(tipo);
}
function validarSabor(sabor) {
    // Valida se o sabor está em formato permitido (letras, números, espaços, P/M/G)
    return /^[\w\s]+( P| M| G)?$/.test(sabor);
}
function validarPreco(preco) {
    // Valida se o preço é um número positivo
    const valor = parseFloat(preco.replace(',', '.'));
    return !isNaN(valor) && valor > 0;
}
function lerProdutos() {
    // Lê todos os produtos do arquivo CSV e retorna como array de objetos
    if (!fs_extra_1.default.existsSync(csvPath))
        return [];
    const linhas = fs_extra_1.default.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    if (linhas.length < 2)
        return [];
    const cabecalho = linhas[0].split(',');
    return linhas.slice(1).map(l => {
        const campos = l.split(',');
        const produto = {};
        cabecalho.forEach((k, i) => produto[k] = campos[i]);
        return produto;
    });
}
function salvarProdutos(produtos) {
    // Salva a lista de produtos no arquivo CSV
    let conteudo = fieldnames.join(',') + '\n';
    produtos.forEach(p => {
        conteudo += fieldnames.map(f => p[f]).join(',') + '\n';
    });
    fs_extra_1.default.writeFileSync(csvPath, conteudo, 'utf-8');
}
function cadastrarProduto() {
    // Inicia o processo de cadastro de um novo produto
    const produtos = lerProdutos();
    const idsExistentes = new Set(produtos.map(p => p.id));
    let id_produto;
    while (true) {
        id_produto = readline_sync_1.default.question('Digite a ID do produto (Ex: 001): ');
        if (!validarId(id_produto)) {
            console.log('❌ ID invalido. Use 3 numeros, exemplo: 001');
            continue;
        }
        if (idsExistentes.has(id_produto)) {
            console.log('❌ Esta ID ja está cadastrada. Escolha outra.');
            continue;
        }
        break;
    }
    let tipo;
    while (true) {
        tipo = readline_sync_1.default.question('Digite o Tipo (Pizza Tradicional, Pizza Especial, Bebida, Porcoes, Sobremesa, Outro): ');
        if (validarTipo(tipo))
            break;
        console.log('❌ Tipo invalido. Escolha uma das opções: Pizza Tradicional, Pizza Especial, Bebida, Porcoes, Sobremesa, Outro');
    }
    let sabor;
    while (true) {
        sabor = readline_sync_1.default.question('Digite o Sabor/Nome e Tamanho (P/M/G ou unico): ');
        if (validarSabor(sabor))
            break;
        console.log('❌ Sabor invalido. Use apenas letras, números, espaços e, se quiser, termine com P, M ou G.');
    }
    let preco;
    while (true) {
        preco = readline_sync_1.default.question('Digite o Preco: R$');
        if (validarPreco(preco)) {
            preco = preco.replace(',', '.');
            break;
        }
        console.log('❌ Preco invalido. Use apenas números positivos. Exemplo: 35.00');
    }
    const produto = {
        id: id_produto,
        tipo,
        sabor,
        preco
    };
    produtos.push(produto);
    salvarProdutos(produtos);
    console.log('✅ Produto cadastrado com sucesso!');
}
function excluirProduto() {
    // Exclui um produto pelo ID e renumera os IDs restantes
    const produtos = lerProdutos();
    if (produtos.length === 0) {
        console.log('Nenhum produto cadastrado.');
        return;
    }
    console.log('Produtos cadastrados:');
    produtos.forEach(p => {
        console.log(`ID: ${p.id} | Tipo: ${p.tipo} | Sabor: ${p.sabor}`);
    });
    const idExcluir = readline_sync_1.default.question('Digite o ID do produto que deseja excluir: ');
    const novosProdutos = produtos.filter(p => p.id !== idExcluir);
    if (novosProdutos.length === produtos.length) {
        console.log('❌ Produto nao encontrado.');
        return;
    }
    novosProdutos.forEach((p, idx) => p.id = String(idx + 1).padStart(3, '0'));
    salvarProdutos(novosProdutos);
    console.log('✅ Produto excluido e IDs renumeradas com sucesso!');
}
function consultarOuAtualizarProduto() {
    // Permite consultar um produto pelo ID e atualizar seus dados se desejado
    const produtos = lerProdutos();
    if (produtos.length === 0) {
        console.log('Nenhum produto cadastrado.');
        return;
    }
    console.log('\n--- Lista de Produtos ---');
    produtos.forEach(p => {
        console.log(`ID: ${p.id} | Tipo: ${p.tipo} | Sabor: ${p.sabor} | Preco: R$${p.preco}`);
    });
    const idEscolhido = readline_sync_1.default.question('\nDigite o ID do produto para ver detalhes ou ENTER para voltar: ').trim();
    if (!idEscolhido)
        return;
    const produto = produtos.find(p => p.id === idEscolhido);
    if (!produto) {
        console.log('❌ Produto nao encontrado.');
        return;
    }
    console.log('\n--- Dados do Produto ---');
    Object.entries(produto).forEach(([campo, valor]) => {
        console.log(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${valor}`);
    });
    if (readline_sync_1.default.question('\nDeseja atualizar este produto? (s/n): ').trim().toLowerCase() === 's') {
        console.log('Deixe em branco para manter o valor atual.');
        fieldnames.forEach(campo => {
            if (campo === 'id')
                return;
            const novoValor = readline_sync_1.default.question(`${campo.charAt(0).toUpperCase() + campo.slice(1)} atual (${produto[campo]}): `);
            if (novoValor.trim())
                produto[campo] = novoValor;
        });
        salvarProdutos(produtos);
        console.log('✅ Produto atualizado com sucesso!');
    }
}
function gerenciarProduto() {
    // Menu para consultar, atualizar ou excluir produtos
    const produtos = lerProdutos();
    if (produtos.length === 0) {
        console.log('Nenhum produto cadastrado.');
        return;
    }
    console.log('\n--- Lista de Produtos ---');
    produtos.forEach(p => {
        console.log(`ID: ${p.id} | Tipo: ${p.tipo} | Sabor: ${p.sabor} | Preço: R$${p.preco}`);
    });
    const acao = readline_sync_1.default.question("\nDigite o ID para consultar/atualizar, 'E' para excluir ou ENTER para voltar: ").trim();
    if (!acao)
        return;
    if (acao.toLowerCase() === 'e') {
        const idExcluir = readline_sync_1.default.question('Digite o ID do produto que deseja excluir: ').trim();
        const novosProdutos = produtos.filter(p => p.id !== idExcluir);
        if (novosProdutos.length === produtos.length) {
            console.log('❌ Produto nao encontrado.');
            return;
        }
        novosProdutos.forEach((p, idx) => p.id = String(idx + 1).padStart(3, '0'));
        salvarProdutos(novosProdutos);
        console.log('✅ Produto excluido e IDs renumeradas com sucesso!');
        return;
    }
    const produto = produtos.find(p => p.id === acao);
    if (!produto) {
        console.log('❌ Produto nao encontrado.');
        return;
    }
    console.log('\n--- Dados do Produto ---');
    Object.entries(produto).forEach(([campo, valor]) => {
        console.log(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${valor}`);
    });
    if (readline_sync_1.default.question('\nDeseja atualizar este produto? (s/n): ').trim().toLowerCase() === 's') {
        console.log('Deixe em branco para manter o valor atual.');
        fieldnames.forEach(campo => {
            if (campo === 'id')
                return;
            const novoValor = readline_sync_1.default.question(`${campo.charAt(0).toUpperCase() + campo.slice(1)} atual (${produto[campo]}): `);
            if (novoValor.trim())
                produto[campo] = novoValor;
        });
        salvarProdutos(produtos);
        console.log('✅ Produto atualizado com sucesso!');
    }
}
function menuProduto() {
    // Menu principal para acessar as funções de produtos
    while (true) {
        console.log('\n--- Menu de Produtos ---');
        console.log('1. Cadastrar Produto');
        console.log('2. Gerenciar Produto (Consultar/Atualizar/Excluir)');
        console.log('0. Voltar');
        const escolha = readline_sync_1.default.question('Escolha uma opcao: ');
        if (escolha === '1') {
            cadastrarProduto();
        }
        else if (escolha === '2') {
            gerenciarProduto();
        }
        else if (escolha === '0') {
            break;
        }
        else {
            console.log('❌ Opcao invalida.');
        }
    }
}
