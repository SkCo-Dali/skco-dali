/**
 * Valida si un correo electrónico pertenece a un dominio autorizado de Skandia
 * para el envío masivo de correos
 */

const AUTHORIZED_DOMAINS = ['@skandia.com.co', '@fp.skandia.com.co'];

export const isAuthorizedForMassEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  return AUTHORIZED_DOMAINS.some(domain => normalizedEmail.endsWith(domain));
};
