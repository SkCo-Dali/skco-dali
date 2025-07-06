
import { supabase } from '@/integrations/supabase/client';

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('Converting audio blob to base64...');
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binaryString);
    
    console.log('Calling transcribe-audio function...');
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: { audio: base64Audio }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Error de transcripción: ${error.message}`);
    }
    
    if (!data?.text) {
      throw new Error('No se recibió texto transcrito');
    }
    
    console.log('Transcription completed:', data.text);
    return data.text;
    
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw new Error('Error al transcribir el audio. Por favor, inténtalo de nuevo.');
  }
};
