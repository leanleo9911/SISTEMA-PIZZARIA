import sqlite3 from 'sqlite3';
import { DatabaseConnection, DatabaseResult } from '../types';

const dbPath = process.env.DB_PATH || './database/pizzaria.db';

// Criar conexão SQLite
const sqliteDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco SQLite');
});

// Configurar PRAGMAs para melhor performance e segurança
sqliteDb.run('PRAGMA journal_mode = WAL');
sqliteDb.run('PRAGMA synchronous = NORMAL');
sqliteDb.run('PRAGMA foreign_keys = ON');

// Wrapper para transformar callbacks em Promises
const runAsync = (sql: string, params: any[] = []): Promise<DatabaseResult> => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

const getAsync = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err: Error | null, row: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allAsync = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err: Error | null, rows: T[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// Exportar objeto com métodos async
const db: DatabaseConnection = {
  runAsync,
  getAsync,
  allAsync
};

export default db;
