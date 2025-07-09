
// Lista de campos sensibles que nunca deben ser loggeados
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'key',
  'apiKey',
  'authorization',
  'bearer',
  'session',
  'cookie',
  'jwt',
  'auth',
  'credential',
  'pin',
  'ssn',
  'socialSecurityNumber',
  'creditCard',
  'cardNumber',
  'cvv',
  'cvc',
  'documentNumber',
  'documentType',
  'phone',
  'email' // Solo en algunos contextos
];

// Función para determinar si un campo es sensible
const isSensitiveField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));
};

// Función para sanitizar objetos recursivamente
const sanitizeObject = (obj: any, maxDepth = 3, currentDepth = 0): any => {
  if (currentDepth > maxDepth) {
    return '[Max depth reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Sanitizar strings que podrían contener tokens o información sensible
    if (obj.length > 100) {
      return `[String too long: ${obj.length} chars]`;
    }
    // Detectar patrones de tokens
    if (/^[A-Za-z0-9+/=]{20,}$/.test(obj) || /^Bearer\s/.test(obj)) {
      return '[REDACTED_TOKEN]';
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
      }
    }
    
    return sanitized;
  }

  return obj;
};

// Función para sanitizar URLs removiendo parámetros sensibles
const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const sensitiveParams = ['token', 'key', 'auth', 'session', 'bearer'];
    
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
};

// Niveles de log
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Configuración del logger
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  maxObjectDepth: number;
}

const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  maxObjectDepth: 3
};

class SecureLogger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeObject(data, this.config.maxObjectDepth) : '';
    
    return `[${timestamp}] ${level}: ${message} ${sanitizedData ? JSON.stringify(sanitizedData) : ''}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.config.level);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    if (this.config.enableConsole) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  // Método especial para loggear requests HTTP de forma segura
  logHttpRequest(method: string, url: string, headers?: any, body?: any): void {
    const sanitizedUrl = sanitizeUrl(url);
    const sanitizedHeaders = sanitizeObject(headers);
    const sanitizedBody = sanitizeObject(body);

    this.info(`HTTP ${method.toUpperCase()} Request`, {
      url: sanitizedUrl,
      headers: sanitizedHeaders,
      body: sanitizedBody
    });
  }

  // Método especial para loggear responses HTTP de forma segura
  logHttpResponse(status: number, url: string, response?: any): void {
    const sanitizedUrl = sanitizeUrl(url);
    const sanitizedResponse = sanitizeObject(response);

    this.info(`HTTP Response ${status}`, {
      url: sanitizedUrl,
      response: sanitizedResponse
    });
  }

  // Método para loggear errores de autenticación sin exponer credenciales
  logAuthError(action: string, error: any, userIdentifier?: string): void {
    this.error(`Authentication Error - ${action}`, {
      userIdentifier: userIdentifier ? `${userIdentifier.substring(0, 3)}***` : 'unknown',
      errorMessage: error?.message || 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown'
    });
  }

  // Método para loggear eventos de usuario sin datos sensibles
  logUserEvent(event: string, userId?: string, metadata?: any): void {
    this.info(`User Event: ${event}`, {
      userId: userId ? `${userId.substring(0, 8)}***` : 'anonymous',
      metadata: sanitizeObject(metadata)
    });
  }
}

// Instancia global del logger
export const secureLogger = new SecureLogger({
  level: LogLevel.INFO,
  enableConsole: true,
  maxObjectDepth: 3
});

// Función helper para reemplazar console.log existentes
export const logSecure = {
  error: (message: string, data?: any) => secureLogger.error(message, data),
  warn: (message: string, data?: any) => secureLogger.warn(message, data),
  info: (message: string, data?: any) => secureLogger.info(message, data),
  debug: (message: string, data?: any) => secureLogger.debug(message, data),
  httpRequest: (method: string, url: string, headers?: any, body?: any) => 
    secureLogger.logHttpRequest(method, url, headers, body),
  httpResponse: (status: number, url: string, response?: any) => 
    secureLogger.logHttpResponse(status, url, response),
  authError: (action: string, error: any, userIdentifier?: string) => 
    secureLogger.logAuthError(action, error, userIdentifier),
  userEvent: (event: string, userId?: string, metadata?: any) => 
    secureLogger.logUserEvent(event, userId, metadata)
};

export default SecureLogger;
