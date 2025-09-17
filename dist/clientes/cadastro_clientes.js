// ===============================
// MÓDULO DE CLIENTES - SISTEMA PIZZARIA
// Funções para cadastrar, consultar, atualizar e excluir clientes
// Utiliza arquivos CSV para guardar os dados
// ===============================
// Importação dos módulos necessários
// Caminho do arquivo de clientes
// Funções de validação para cada campo do cliente
// Lê todos os clientes do arquivo CSV
// Salva a lista de clientes no arquivo CSV
// Função principal para cadastrar um novo cliente
// Função para consultar, atualizar ou excluir clientes
// Menu principal de clientes
"use strict";
// Importação dos módulos necessários para manipular arquivos, caminhos, entrada do usuário e CSV
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrarCliente = cadastrarCliente;
exports.menuCliente = menuCliente;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const sync_1 = require("csv-parse/sync");
const sync_2 = require("csv-stringify/sync");
const baseDir = __dirname;
const csvPath = path_1.default.join(baseDir, 'clientes.csv');
const fieldnames = ['id', 'nome', 'data_nascimento', 'email', 'telefone', 'endereco', 'CEP'];
function validarId(id) {
    // Valida se o ID tem exatamente 3 dígitos numéricos
    return /^\d{3}$/.test(id);
}
function validarNome(nome) {
    // Valida se o nome contém apenas letras e espaços
    return /^[A-Za-zÀ-ÿ\s]+$/.test(nome);
}
function validarData(data) {
    // Valida se a data está no formato DD/MM/AAAA
    return /^\d{2}\/\d{2}\/\d{4}$/.test(data);
}
function validarEmail(email) {
    // Valida se o e-mail está em formato válido
    return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}
function validarTelefone(telefone) {
    // Valida se o telefone contém apenas números, espaços, parênteses e traços
    return /^[\d\s\-\(\)]+$/.test(telefone);
}
function validarCep(cep) {
    // Valida se o CEP está no formato 00000-000
    return /^\d{5}-\d{3}$/.test(cep);
}
function lerClientes() {
    // Lê todos os clientes do arquivo CSV e retorna como array de objetos
    if (!fs_extra_1.default.existsSync(csvPath))
        return [];
    const csvData = fs_extra_1.default.readFileSync(csvPath, 'utf-8');
    const rows = (0, sync_1.parse)(csvData, { columns: true, skip_empty_lines: true });
    return rows;
}
function salvarClientes(clientes) {
    // Salva a lista de clientes no arquivo CSV
    const csvString = (0, sync_2.stringify)(clientes, { header: true, columns: fieldnames });
    fs_extra_1.default.writeFileSync(csvPath, csvString, 'utf-8');
}
function cadastrarCliente() {
    // Inicia o processo de cadastro de um novo cliente
    const clientes = lerClientes();
    const idsExistentes = new Set(clientes.map(c => c.id));
    let id_cliente;
    while (true) {
        id_cliente = readline_sync_1.default.question('Digite o ID (Ex: 001): ');
        if (!validarId(id_cliente)) {
            console.log('❌ ID inválido. Use 3 numeros, exemplo: 001');
            continue;
        }
        if (idsExistentes.has(id_cliente)) {
            console.log('❌ Esta ID já esta cadastrada. Escolha outra.');
            continue;
        }
        break;
    }
    let nome;
    while (true) {
        nome = readline_sync_1.default.question('Digite o Nome completo: ');
        if (validarNome(nome))
            break;
        console.log('❌ Nome invalido. Use apenas letras e espacos.');
    }
    let data_nascimento;
    while (true) {
        data_nascimento = readline_sync_1.default.question('Digite a data de Nascimento (Ex: DD/MM/AAAA): ');
        if (validarData(data_nascimento))
            break;
        console.log('❌ Data invalida. Use o formato DD/MM/AAAA.');
    }
    let email;
    while (true) {
        email = readline_sync_1.default.question('Digite o E-mail (Ex: usuario@dominio.com): ');
        if (validarEmail(email))
            break;
        console.log('❌ E-mail invalido. Exemplo: usuario@dominio.com');
    }
    let telefone;
    while (true) {
        telefone = readline_sync_1.default.question('Digite o Telefone (Ex: 11 2453-7263): ');
        if (validarTelefone(telefone))
            break;
        console.log('❌ Telefone invalido. Use apenas numeros, espacos, parenteses e tracos.');
    }
    const endereco = readline_sync_1.default.question('Digite o Endereco (Ex: Rua Exemplo, 123): ');
    let cep;
    while (true) {
        cep = readline_sync_1.default.question('CEP (Ex: 00000-000): ');
        if (validarCep(cep))
            break;
        console.log('❌ CEP invalido. Use o formato 00000-000.');
    }
    const cliente = {
        id: id_cliente,
        nome,
        data_nascimento,
        email,
        telefone,
        endereco,
        CEP: cep
    };
    clientes.push(cliente);
    salvarClientes(clientes);
    console.log('✅ Cliente cadastrado com sucesso!');
}
function consultarOuAtualizarCliente() {
    // Permite consultar um cliente pelo ID e atualizar seus dados se desejado
    const clientes = lerClientes();
    if (clientes.length === 0) {
        console.log('Nenhum cliente cadastrado.');
        return;
    }
    console.log('\n--- Lista de Clientes ---');
    clientes.forEach(c => console.log(`ID: ${c.id} | Nome: ${c.nome} | Email: ${c.email} | Telefone: ${c.telefone}`));
    const idEscolhido = readline_sync_1.default.question('\nDigite o ID do cliente para ver detalhes ou ENTER para voltar: ').trim();
    if (!idEscolhido)
        return;
    const cliente = clientes.find(c => c.id === idEscolhido);
    if (!cliente) {
        console.log('❌ Cliente nao encontrado.');
        return;
    }
    console.log('\n--- Dados do Cliente ---');
    Object.entries(cliente).forEach(([campo, valor]) => {
        console.log(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${valor}`);
    });
    if (readline_sync_1.default.question('\nDeseja atualizar este cliente? (s/n): ').trim().toLowerCase() === 's') {
        console.log('Deixe em branco para manter o valor atual.');
        fieldnames.forEach(campo => {
            if (campo === 'id')
                return;
            const novoValor = readline_sync_1.default.question(`${campo.charAt(0).toUpperCase() + campo.slice(1)} atual (${cliente[campo]}): `);
            if (novoValor.trim())
                cliente[campo] = novoValor;
        });
        salvarClientes(clientes);
        console.log('✅ Cliente atualizado com sucesso!');
    }
}
function excluirCliente() {
    // Exclui um cliente pelo ID e renumera os IDs restantes
    const clientes = lerClientes();
    if (clientes.length === 0) {
        console.log('Nenhum cliente cadastrado.');
        return;
    }
    console.log('Clientes cadastrados:');
    clientes.forEach(c => console.log(`ID: ${c.id} | Nome: ${c.nome}`));
    const idExcluir = readline_sync_1.default.question('Digite o ID do cliente que deseja excluir: ');
    const novosClientes = clientes.filter(c => c.id !== idExcluir);
    // Renumera os IDs após exclusão
    novosClientes.forEach((c, idx) => c.id = String(idx + 1).padStart(3, '0'));
    salvarClientes(novosClientes);
    console.log('✅ Cliente excluido e IDs renumeradas com sucesso!');
}
function gerenciarCliente() {
    // Menu para consultar, atualizar ou excluir clientes
    const clientes = lerClientes();
    if (clientes.length === 0) {
        console.log('Nenhum cliente cadastrado.');
        return;
    }
    console.log('\n--- Lista de Clientes ---');
    clientes.forEach(c => console.log(`ID: ${c.id} | Nome: ${c.nome} | Email: ${c.email} | Telefone: ${c.telefone}`));
    const acao = readline_sync_1.default.question("\nDigite o ID para consultar/atualizar, 'E' para excluir ou ENTER para voltar: ").trim();
    if (!acao)
        return;
    if (acao.toLowerCase() === 'e') {
        const idExcluir = readline_sync_1.default.question('Digite o ID do cliente que deseja excluir: ').trim();
        const novosClientes = clientes.filter(c => c.id !== idExcluir);
        if (novosClientes.length === clientes.length) {
            console.log('❌ Cliente nao encontrado.');
            return;
        }
        novosClientes.forEach((c, idx) => c.id = String(idx + 1).padStart(3, '0'));
        salvarClientes(novosClientes);
        console.log('✅ Cliente excluido e IDs renumeradas com sucesso!');
        return;
    }
    const cliente = clientes.find(c => c.id === acao);
    if (!cliente) {
        console.log('❌ Cliente nao encontrado.');
        return;
    }
    console.log('\n--- Dados do Cliente ---');
    Object.entries(cliente).forEach(([campo, valor]) => {
        console.log(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${valor}`);
    });
    if (readline_sync_1.default.question('\nDeseja atualizar este cliente? (s/n): ').trim().toLowerCase() === 's') {
        console.log('Deixe em branco para manter o valor atual.');
        fieldnames.forEach(campo => {
            if (campo === 'id')
                return;
            const novoValor = readline_sync_1.default.question(`${campo.charAt(0).toUpperCase() + campo.slice(1)} atual (${cliente[campo]}): `);
            if (novoValor.trim())
                cliente[campo] = novoValor;
        });
        salvarClientes(clientes);
        console.log('✅ Cliente atualizado com sucesso!');
    }
}
function menuCliente() {
    // Menu principal para acessar as funções de clientes
    while (true) {
        console.log('\n--- Menu de Clientes ---');
        console.log('1. Cadastrar Cliente');
        console.log('2. Consultar/Atualizar/Excluir Cliente');
        console.log('0. Voltar');
        const escolha = readline_sync_1.default.question('Escolha uma opcao: ');
        if (escolha === '1') {
            cadastrarCliente();
        }
        else if (escolha === '2') {
            gerenciarCliente();
        }
        else if (escolha === '0') {
            break;
        }
        else {
            console.log('❌ Opcao invalida.');
        }
    }
}
