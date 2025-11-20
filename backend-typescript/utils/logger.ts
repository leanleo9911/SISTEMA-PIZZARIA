/**
 * ============================================================================
 * LOGGER PERSONALIZADO - TypeScript
 * ============================================================================
 * 
 * Sistema de logging que evita vazamento de informações sensíveis em produção.
 * Em desenvolvimento, mostra detalhes completos. Em produção, oculta stack traces.
 */

const isProduction = process.env.NODE_ENV === 'production';

interface LogMetadata {
  [key: string]: any;
}

/**
 * Registra erro sem expor informações sensíveis em produção
 * @param message - Mensagem descritiva do erro
 * @param error - Objeto de erro capturado
 * @param metadata - Dados adicionais relevantes (sem informações sensíveis)
 */
export const logError = (message: string, error: Error, metadata: LogMetadata = {}): void => {
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
 * @param message - Mensagem informativa
 * @param metadata - Dados adicionais
 */
export const logInfo = (message: string, metadata: LogMetadata = {}): void => {
  console.log(`[INFO] ${message}`, {
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

/**
 * Registra aviso
 * @param message - Mensagem de aviso
 * @param metadata - Dados adicionais
 */
export const logWarn = (message: string, metadata: LogMetadata = {}): void => {
  console.warn(`[WARN] ${message}`, {
    ...metadata,
    timestamp: new Date().toISOString()
  });
};
