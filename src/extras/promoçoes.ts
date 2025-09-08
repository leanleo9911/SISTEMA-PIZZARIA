import fs from 'fs-extra';
import path from 'path';
import readlineSync from 'readline-sync';

const baseDir = __dirname;
const csvPath = path.join(baseDir, 'promocoes.csv');

export function listarPromocoes(): void {
  if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
    console.log('Nenhuma promocao cadastrada.');
    return;
  }
  console.log('\n🎉 Promocoes Atuais:');
  const linhas = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
  linhas.forEach((linha, idx) => {
    console.log(`${idx + 1}. ${linha}`);
  });
}

export function formasPagamento(): void {
  console.log('💳 Formas de Pagamento:');
  console.log('- Dinheiro');
  console.log('- Cartao de Credito/Debito');
  console.log('- Pix');
}

export function menuPromocoes(): void {
  function adicionarPromocao(): void {
    const descricao = readlineSync.question('Descricao da promocao: ');
    fs.appendFileSync(csvPath, descricao + '\n', 'utf-8');
    console.log('✅ Promocao adicionada!');
  }
  function consultarPromocoes(): void {
    if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
      console.log('Nenhuma promocao cadastrada.');
      return;
    }
    console.log('\n🎉 Promocoes Atuais:');
    const linhas = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    linhas.forEach((linha, idx) => {
      console.log(`${idx + 1}. ${linha}`);
    });
  }
  function atualizarPromocao(): void {
    if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
      console.log('Nenhuma promocao cadastrada.');
      return;
    }
    const promocoes = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    consultarPromocoes();
    const num = readlineSync.question('Digite o numero da promocao para atualizar: ');
    const idx = parseInt(num) - 1;
    if (isNaN(idx) || idx < 0 || idx >= promocoes.length) {
      console.log('❌ Numero invalido.');
      return;
    }
    const novaDesc = readlineSync.question('Nova descricao: ');
    promocoes[idx] = novaDesc;
    fs.writeFileSync(csvPath, promocoes.join('\n') + '\n', 'utf-8');
    console.log('✅ Promocao atualizada!');
  }
  function excluirPromocao(): void {
    if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
      console.log('Nenhuma promocao cadastrada.');
      return;
    }
    const promocoes = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    consultarPromocoes();
    const num = readlineSync.question('Digite o numero da promocao para excluir: ');
    const idx = parseInt(num) - 1;
    if (isNaN(idx) || idx < 0 || idx >= promocoes.length) {
      console.log('❌ Numero invalido.');
      return;
    }
    promocoes.splice(idx, 1);
    fs.writeFileSync(csvPath, promocoes.join('\n') + '\n', 'utf-8');
    console.log('✅ Promocao excluida!');
  }
  while (true) {
    console.log('\n--- Menu de Promocoes ---');
    console.log('1. Adicionar Promocao');
    console.log('2. Consultar Promocoes');
    console.log('3. Atualizar Promocoes');
    console.log('4. Excluir Promocoes');
    console.log('0. Voltar');
    const escolha = readlineSync.question('Escolha uma opcao: ');
    if (escolha === '1') {
      adicionarPromocao();
    } else if (escolha === '2') {
      consultarPromocoes();
    } else if (escolha === '3') {
      atualizarPromocao();
    } else if (escolha === '4') {
      excluirPromocao();
    } else if (escolha === '0') {
      break;
    } else {
      console.log('❌ Opcao invalida.');
    }
  }
}
