/**
 * ============================================================================
 * LOGGER PERSONALIZADO
 * ============================================================================
 * 
 * Sistema de logging que evita vazamento de informações sensíveis em produção.
 * Em desenvolvimento, mostra detalhes completos. Em produção, oculta stack traces.
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Registra erro sem expor informações sensíveis em produção
 * @param {string} message - Mensagem descritiva do erro
 * @param {Error} error - Objeto de erro capturado
 * @param {Object} metadata - Dados adicionais relevantes (sem informações sensíveis)
 */
const logError = (message, error, metadata = {}) => {
  if (isProduction) {
    // Em produção: apenas mensagem e metadata (sem stack trace)
    console.error(`[ERROR] ${message}`, {
      ...metadata,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    });
  } else {
    // Em desenvolvimento: informações completas para debug
    console.error(`[ERROR] ${message}`, {
      ...metadata,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Registra informação geral
 * @param {string} message - Mensagem informativa
 * @param {Object} metadata - Dados adicionais
 */
const logInfo = (message, metadata = {}) => {
  console.log(`[INFO] ${message}`, {
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registra aviso
 * @param {string} message - Mensagem de aviso
 * @param {Object} metadata - Dados adicionais
 */
const logWarn = (message, metadata = {}) => {
  console.warn(`[WARN] ${message}`, {
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logError,
  logInfo,
  logWarn
};
