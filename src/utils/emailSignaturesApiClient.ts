import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/email-signature`;

export interface EmailSignature {
  signature_name: string;
  html_signature: string;
  plain_text_signature: string;
}

export interface SignaturesListResponse {
  signatures: EmailSignature[];
}

export interface DeleteSignatureResponse {
  message: string;
}

export interface ApiErrorDetail {
  type: string;
  loc: string[];
  msg: string;
  input: any;
}

export interface ApiErrorResponse {
  detail: string | ApiErrorDetail[];
}

// Helper function to convert HTML to plain text
const htmlToPlainText = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// Fetch all signatures for the current user
export const fetchAllSignatures = async (): Promise<EmailSignature[]> => {
  try {
    console.log('🔄 Fetching all email signatures');
    const response = await fetch(`${API_BASE_URL}/me/all`, {
      method: 'GET',
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      if (response.status === 403) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Usuario no encontrado en la base de datos');
      }
      throw new Error(`Error al obtener firmas: ${response.status}`);
    }

    const data: SignaturesListResponse = await response.json();
    console.log('✅ Signatures fetched:', data.signatures.length);
    return data.signatures;
  } catch (error) {
    console.error('❌ Error fetching signatures:', error);
    throw error;
  }
};

// Fetch a specific signature by name
export const fetchSignatureByName = async (signatureName: string): Promise<EmailSignature | null> => {
  try {
    console.log('🔄 Fetching signature:', signatureName);
    const response = await fetch(`${API_BASE_URL}/me?signature_name=${encodeURIComponent(signatureName)}`, {
      method: 'GET',
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      if (response.status === 403) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Usuario no encontrado en la base de datos');
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener firma: ${response.status}`);
    }

    const data: SignaturesListResponse = await response.json();
    console.log('✅ Signature fetched');
    return data.signatures.length > 0 ? data.signatures[0] : null;
  } catch (error) {
    console.error('❌ Error fetching signature:', error);
    throw error;
  }
};

// Create or update a signature
export const saveSignature = async (
  signatureName: string,
  htmlContent: string
): Promise<EmailSignature> => {
  try {
    console.log('💾 Saving signature:', signatureName);
    
    const plainTextContent = htmlToPlainText(htmlContent);
    
    const payload = {
      signature_name: signatureName.trim(),
      html_signature: htmlContent.trim(),
      plain_text_signature: plainTextContent.trim(),
    };

    console.log('📤 Payload:', payload);

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      
      // Handle 422 validation errors
      if (response.status === 422) {
        if (Array.isArray(error.detail)) {
          const messages = error.detail.map(e => e.msg).join(', ');
          throw new Error(messages);
        }
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Error de validación');
      }
      
      // Handle 403 forbidden
      if (response.status === 403) {
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Usuario no encontrado en la base de datos');
      }
      
      // Handle 500 internal server error
      if (response.status === 500) {
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Error interno del servidor');
      }
      
      throw new Error(`Error al guardar firma: ${response.status}`);
    }

    const savedSignature: EmailSignature = await response.json();
    console.log('✅ Signature saved successfully');
    return savedSignature;
  } catch (error) {
    console.error('❌ Error saving signature:', error);
    throw error;
  }
};

// Delete a signature
export const deleteSignature = async (signatureName: string): Promise<string> => {
  try {
    console.log('🗑️ Deleting signature:', signatureName);
    
    const response = await fetch(`${API_BASE_URL}/me?signature_name=${encodeURIComponent(signatureName)}`, {
      method: 'DELETE',
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      
      // Handle 404 not found
      if (response.status === 404) {
        throw new Error(typeof error.detail === 'string' ? error.detail : `La firma '${signatureName}' no existe`);
      }
      
      // Handle 403 forbidden
      if (response.status === 403) {
        throw new Error(typeof error.detail === 'string' ? error.detail : 'Usuario no encontrado en la base de datos');
      }
      
      throw new Error(`Error al eliminar firma: ${response.status}`);
    }

    const result: DeleteSignatureResponse = await response.json();
    console.log('✅ Signature deleted successfully');
    return result.message;
  } catch (error) {
    console.error('❌ Error deleting signature:', error);
    throw error;
  }
};
