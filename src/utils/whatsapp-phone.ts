import { PhoneValidationResult } from '@/types/whatsapp-propio';

export function normalizarTelefonoColombia(telefono: string): PhoneValidationResult {
  if (!telefono || typeof telefono !== 'string') {
    return { ok: false, motivo: 'SIN_TELEFONO' };
  }

  // Limpiar el número: quitar espacios, guiones, paréntesis, etc.
  let clean = telefono.replace(/[\s\-\(\)\.\+]/g, '');
  
  // Si no hay números, es inválido
  if (!/^\d+$/.test(clean)) {
    return { ok: false, motivo: 'FORMATO_INVALIDO' };
  }

  // Si no empieza con código de país, asumir Colombia (+57)
  if (!telefono.startsWith('+')) {
    // Si empieza con 57, asumir que ya tiene el código pero sin +
    if (!clean.startsWith('57')) {
      // Agregar código de Colombia
      clean = '57' + clean;
    }
  } else {
    // Ya tiene +, solo limpiar
    clean = telefono.substring(1).replace(/[\s\-\(\)\.\+]/g, '');
  }

  // Verificar formato colombiano: 57 + 10 dígitos que empiecen con 3
  if (clean.length !== 12 || !clean.startsWith('57')) {
    return { ok: false, motivo: 'FORMATO_INVALIDO' };
  }

  // Extraer el número local (sin el 57)
  const numeroLocal = clean.substring(2);
  
  // Verificar que sea móvil colombiano: 10 dígitos y empiece con 3
  if (numeroLocal.length !== 10 || !numeroLocal.startsWith('3')) {
    return { ok: false, motivo: 'NO_MOVIL_CO' };
  }

  return { 
    ok: true, 
    e164: '+' + clean 
  };
}

export function getMotivoDescripcion(motivo: string): string {
  switch (motivo) {
    case 'SIN_TELEFONO':
      return 'No tiene número de teléfono';
    case 'NO_MOVIL_CO':
      return 'No es un número móvil colombiano válido';
    case 'FORMATO_INVALIDO':
      return 'Formato de número inválido';
    default:
      return 'Error desconocido';
  }
}