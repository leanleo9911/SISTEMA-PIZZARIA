// ===============================
// MÓDULO DE PEDIDOS - SISTEMA PIZZARIA
// Funções para registrar pedidos, consultar e atualizar vendas
// Utiliza arquivos CSV para guardar os dados
// ===============================
// Importação dos módulos necessários para manipular arquivos, caminhos e entrada do usuário
import fs from 'fs-extra';
import path from 'path';
import readlineSync from 'readline-sync';

function lerClientes(): string[] {
// Lê os nomes dos clientes cadastrados no sistema
  const baseDir = path.resolve(__dirname, '..');
  const csvPath = path.join(baseDir, 'clientes', 'clientes.csv');
  if (!fs.existsSync(csvPath)) return [];
  const linhas = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
  if (linhas.length < 2) return [];
  return linhas.slice(1).map(l => l.split(',')[1]);
}

function lerProdutos(): string[] {
// Lê os nomes dos produtos cadastrados no sistema
  const baseDir = path.resolve(__dirname, '..');
  const csvPath = path.join(baseDir, 'produtos', 'produtos.csv');
  if (!fs.existsSync(csvPath)) return [];
  const linhas = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
  if (linhas.length < 2) return [];
  return linhas.slice(1).map(l => l.split(',')[2]);
}

type ItemPedido = [string, number, number];
// Tipo que representa um item do pedido: [nome, quantidade, preço]

function escolherOpcao(lista: string[], texto: string): string {
// Exibe uma lista de opções e retorna a escolhida pelo usuário
  console.log(texto);
  lista.forEach((item, i) => {
    console.log(`${i + 1}. ${item}`);
  });
  while (true) {
    const escolha = readlineSync.question('Escolha o numero: ');
    const idx = parseInt(escolha) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < lista.length) {
      return lista[idx];
    }
    console.log('❌ Escolha invalida.');
  }
}

function escolherFormaPagamento(): string {
// Exibe as formas de pagamento disponíveis e retorna a escolhida
  const opcoes = ['Dinheiro', 'Cartao de Credito/Debito', 'Pix'];
  return escolherOpcao(opcoes, 'Escolha a forma de pagamento:');
}

export function registrarPedido(): void {
// Inicia o processo de registro de um novo pedido
  const clientes = lerClientes();
  if (clientes.length === 0) {
    console.log('❌ Nenhum cliente cadastrado.');
    return;
  }
  const clienteNome = escolherOpcao(clientes, 'Selecione o cliente:');
  const produtos = lerProdutos();
  if (produtos.length === 0) {
    console.log('❌ Nenhum produto cadastrado.');
    return;
  }
  const itensPedido: ItemPedido[] = [];
  let valorTotal = 0;
  while (true) {
    const produtoNome = escolherOpcao(produtos, 'Selecione o produto:');
    let quantidade: number;
    while (true) {
      const q = readlineSync.question('Quantidade: ');
      quantidade = parseInt(q);
      if (!isNaN(quantidade) && quantidade > 0) break;
      console.log('❌ Quantidade invalida. Digite um numero positivo.');
    }
    // Busca o preço do produto
    const baseDir = path.resolve(__dirname, '..');
    const csvPath = path.join(baseDir, 'produtos', 'produtos.csv');
    let preco = 0;
    const linhas = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    for (const l of linhas.slice(1)) {
      const campos = l.split(',');
      if (campos[2] === produtoNome) {
        preco = parseFloat(campos[3]);
        break;
      }
    }
    itensPedido.push([produtoNome, quantidade, preco]);
    valorTotal += preco * quantidade;
    const maisUm = readlineSync.question('Deseja adicionar mais um produto ao pedido? (s/n): ').trim().toLowerCase();
    if (maisUm !== 's') break;
  }
  const formaPagamento = escolherFormaPagamento();
  const data = new Date();
  const dataStr = data.toISOString().replace('T', ' ').substring(0, 19);
  // Salva o pedido no arquivo vendas.csv
  const vendasPath = path.join(__dirname, 'vendas.csv');
  const existeVendas = fs.existsSync(vendasPath);
  const cabecalho = 'data_pedido,cliente,produto,quantidade,valor_total,forma_pagamento\n';
  let vendasConteudo = '';
  if (!existeVendas) vendasConteudo += cabecalho;
  for (const [produtoNome, quantidade, preco] of itensPedido) {
    vendasConteudo += `${dataStr},${clienteNome},${produtoNome},${quantidade},${(preco * quantidade).toFixed(2)},${formaPagamento}\n`;
  }
  fs.appendFileSync(vendasPath, vendasConteudo, 'utf-8');
  console.log('✅ Pedido registrado com sucesso!');
  // Gera o comprovante e salva na área de trabalho
  let comprovanteTexto = `Comprovante de Compra\nCliente: ${clienteNome}\n`;
  for (const [produtoNome, quantidade, preco] of itensPedido) {
    comprovanteTexto += `Produto: ${produtoNome} | Quantidade: ${quantidade} | Total: R$${(preco * quantidade).toFixed(2)}\n`;
  }
  comprovanteTexto += `Total do Pedido: R$${valorTotal.toFixed(2)}\nForma de Pagamento: ${formaPagamento}\nData: ${dataStr}\n`;
  const desktopPath = path.join(process.env['USERPROFILE'] || '', 'Desktop');
  const comprovantesPath = path.join(desktopPath, 'Comprovantes');
  fs.ensureDirSync(comprovantesPath);
  const nomeArquivo = `comprovante_${clienteNome}_${dataStr.replace(/:/g, '').replace(/ /g, '_')}.txt`;
  const caminhoCompleto = path.join(comprovantesPath, nomeArquivo);
  fs.writeFileSync(caminhoCompleto, comprovanteTexto, 'utf-8');
  console.log(`✅ Comprovante salvo na pasta comprovantes: ${nomeArquivo}`);
}

function consultarOuAtualizarVenda(): void {
  const vendasPath = path.join(__dirname, 'vendas.csv');
  if (!fs.existsSync(vendasPath)) {
    console.log('Nenhuma venda registrada.');
    return;
  }
  const linhas = fs.readFileSync(vendasPath, 'utf-8').split('\n').filter(l => l.trim());
  if (linhas.length < 2) {
    console.log('Nenhuma venda registrada.');
    return;
  }
  const cabecalho = linhas[0].split(',');
  const vendas = linhas.slice(1).map(l => {
    const campos = l.split(',');
    const venda: { [key: string]: string } = {};
    cabecalho.forEach((k, i) => venda[k] = campos[i]);
    return venda;
  });
  console.log('\n--- Lista de Vendas ---');
  vendas.forEach((v, idx) => {
    console.log(`${idx + 1}. Data: ${v['data_pedido']} | Cliente: ${v['cliente']} | Produto: ${v['produto']} | Quantidade: ${v['quantidade']} | Total: R$${v['valor_total']} | Pagamento: ${v['forma_pagamento']}`);
  });
  const escolha = readlineSync.question('\nDigite o numero da venda para ver detalhes ou ENTER para voltar: ').trim();
  if (!escolha || isNaN(parseInt(escolha)) || parseInt(escolha) < 1 || parseInt(escolha) > vendas.length) return;
  const venda = vendas[parseInt(escolha) - 1];
  console.log('\n--- Dados da Venda ---');
  Object.entries(venda).forEach(([campo, valor]) => {
    console.log(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: ${valor}`);
  });
  if (readlineSync.question('\nDeseja atualizar esta venda? (s/n): ').trim().toLowerCase() === 's') {
    console.log('Deixe em branco para manter o valor atual.');
    cabecalho.forEach(campo => {
      const novoValor = readlineSync.question(`${campo.charAt(0).toUpperCase() + campo.slice(1)} atual (${venda[campo]}): `);
      if (novoValor.trim()) venda[campo] = novoValor;
    });
    // Salva todas as vendas atualizadas
    let novoConteudo = cabecalho.join(',') + '\n';
    vendas.forEach(v => {
      novoConteudo += cabecalho.map(campo => v[campo]).join(',') + '\n';
    });
    fs.writeFileSync(vendasPath, novoConteudo, 'utf-8');
    console.log('✅ Venda atualizada com sucesso!');
  }
}

export function menuPedido(): void {
  while (true) {
    console.log('\n--- Menu de Pedidos ---');
    console.log('1. Registrar Pedido');
    console.log('2. Consultar/Atualizar Pedido/Venda');
    console.log('0. Voltar');
    const escolha = readlineSync.question('Escolha uma opcao: ');
    if (escolha === '1') {
      registrarPedido();
    } else if (escolha === '2') {
      consultarOuAtualizarVenda();
    } else if (escolha === '0') {
      break;
    } else {
      console.log('❌ Opcao invalida.');
    }
  }
}
