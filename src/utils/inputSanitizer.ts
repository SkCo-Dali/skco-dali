
// Servicio de sanitización de inputs para prevenir XSS y injection attacks
export class InputSanitizer {
  // Caracteres peligrosos que deben ser sanitizados
  private static readonly DANGEROUS_CHARS = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '&': '&amp;',
    '`': '&#96;'
  };

  // Patrones de scripts maliciosos
  private static readonly SCRIPT_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ];

  /**
   * Sanitiza texto básico removiendo caracteres peligrosos
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[<>"'\/&`]/g, (match) => {
      return this.DANGEROUS_CHARS[match as keyof typeof this.DANGEROUS_CHARS] || match;
    });
  }

  /**
   * Sanitiza HTML removiendo scripts y elementos peligrosos
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remover patrones de scripts
    this.SCRIPT_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Sanitizar caracteres básicos
    sanitized = this.sanitizeText(sanitized);

    return sanitized;
  }

  /**
   * Sanitiza emails manteniendo formato válido
   */
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remover caracteres no permitidos en emails
    const cleaned = input.replace(/[^a-zA-Z0-9@._-]/g, '');
    
    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(cleaned) ? cleaned : '';
  }

  /**
   * Sanitiza URLs verificando protocolos seguros
   */
  static sanitizeUrl(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const url = new URL(input);
      
      // Solo permitir protocolos seguros
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      
      if (!allowedProtocols.includes(url.protocol)) {
        return '';
      }

      return url.href;
    } catch {
      return '';
    }
  }

  /**
   * Sanitiza números eliminando caracteres no numéricos
   */
  static sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') {
      return isNaN(input) ? 0 : input;
    }

    if (!input || typeof input !== 'string') {
      return 0;
    }

    const cleaned = input.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Sanitiza IDs/UUIDs permitiendo solo caracteres alfanuméricos y guiones
   */
  static sanitizeId(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  /**
   * Validar y sanitizar objeto completo recursivamente
   */
  static sanitizeObject(obj: any, maxDepth = 5, currentDepth = 0): any {
    if (currentDepth > maxDepth) {
      return null;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value, maxDepth, currentDepth + 1);
      }
      
      return sanitized;
    }

    return obj;
  }
}

export default InputSanitizer;
