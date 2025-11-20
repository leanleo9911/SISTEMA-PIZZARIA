/**
 * ============================================================================
 * CONEXÃO COM BANCO DE DADOS SQLITE3
 * ============================================================================
 * 
 * Gerencia a conexão com o banco SQLite e fornece wrappers para uso com async/await.
 * 
 * Funções disponíveis:
 * - db.runAsync(sql, params) - Executa INSERT, UPDATE, DELETE (retorna lastID e changes)
 * - db.getAsync(sql, params) - Busca UMA linha (retorna objeto ou undefined)
 * - db.allAsync(sql, params) - Busca TODAS as linhas (retorna array)
 * 
 * Configurações SQLite:
 * - WAL mode: Permite leituras concorrentes
 * - SYNCHRONOUS NORMAL: Balanço entre performance e segurança
 * - FOREIGN KEYS ON: Integridade referencial ativada
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Define o caminho do arquivo de banco de dados
// Usa variável de ambiente DB_PATH ou padrão ./database/pizzaria.db
const dbPath = process.env.DB_PATH || path.join(__dirname, 'pizzaria.db');

// Criar diretório do banco se não existir
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Conectar ao banco (cria o arquivo se não existir)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
  } else {
    console.log('✅ Conexão com banco de dados estabelecida');
  }
});

// ===== CONFIGURAÇÕES DO SQLITE =====

// WAL (Write-Ahead Logging) - Permite leituras concorrentes durante escritas
db.run('PRAGMA journal_mode = WAL');

// SYNCHRONOUS NORMAL - Boa performance mantendo segurança
db.run('PRAGMA synchronous = NORMAL');

// Ativa integridade referencial (foreign keys)
// IMPORTANTE: Sem isso, DELETE CASCADE não funciona
db.run('PRAGMA foreign_keys = ON');

// ===== WRAPPERS PARA ASYNC/AWAIT =====
// O sqlite3 usa callbacks, estes wrappers convertem para Promises

/**
 * Executa comandos SQL que modificam dados (INSERT, UPDATE, DELETE)
 * @param {string} sql - Query SQL
 * @param {Array} params - Parâmetros para prepared statement
 * @returns {Promise<{lastID: number, changes: number}>} ID inserido e linhas afetadas
 */
db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Busca UMA única linha do banco
 * @param {string} sql - Query SQL
 * @param {Array} params - Parâmetros para prepared statement
 * @returns {Promise<Object|undefined>} Objeto com dados da linha ou undefined
 */
db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * Busca TODAS as linhas que correspondem à query
 * @param {string} sql - Query SQL
 * @param {Array} params - Parâmetros para prepared statement
 * @returns {Promise<Array>} Array de objetos (vazio se não houver resultados)
 */
db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = db;
