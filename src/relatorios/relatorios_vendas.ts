import fs from 'fs-extra';
import path from 'path';
import readlineSync from 'readline-sync';

export function relatorioVendas(): void {
  const baseDir = __dirname;
  const vendasPath = path.resolve(baseDir, '..', 'pedidos', 'vendas.csv');
  console.log('\n--- Relatório de Vendas ---');
  console.log('1. Consultar vendas por dia');
  console.log('2. Consultar vendas por mês');
  console.log('0. Voltar');
  const escolha = readlineSync.question('Escolha uma opcao: ');
  if (escolha === '1') {
    // Consulta vendas por dia
    let dia = readlineSync.question('Digite a data (AAAA-MM-DD) ou ENTER para hoje: ').trim();
    if (!dia) {
      const hoje = new Date();
      dia = hoje.toISOString().slice(0, 10);
    }
    let vendasDia = 0;
    if (fs.existsSync(vendasPath)) {
      const linhas = fs.readFileSync(vendasPath, 'utf-8').split('\n').filter(l => l.trim());
      for (const linha of linhas.slice(1)) { // Ignora cabeçalho
        const row = linha.split(',');
        if (row.length < 6) continue;
        const [data, , , qtd] = row;
        if (data.startsWith(dia)) {
          vendasDia += parseInt(qtd);
        }
      }
    }
    console.log(`📅 Pizzas vendidas em ${dia}: ${vendasDia}`);
  } else if (escolha === '2') {
    // Consulta vendas por mês
    let mes = readlineSync.question('Digite o mes (AAAA-MM) ou ENTER para o mes atual: ').trim();
    if (!mes) {
      const hoje = new Date();
      mes = hoje.toISOString().slice(0, 7);
    }
    let vendasMes = 0;
    if (fs.existsSync(vendasPath)) {
      const linhas = fs.readFileSync(vendasPath, 'utf-8').split('\n').filter(l => l.trim());
      for (const linha of linhas.slice(1)) { // Ignora cabeçalho
        const row = linha.split(',');
        if (row.length < 6) continue;
        const [data, , , qtd] = row;
        if (data.startsWith(mes)) {
          vendasMes += parseInt(qtd);
        }
      }
    }
    console.log(`🗓️ Pizzas vendidas no mês ${mes}: ${vendasMes}`);
  } else if (escolha === '0') {
    return;
  } else {
    console.log('❌ Opcao invalida.');
  }
}
