
import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../utils/transcriptionApi';

interface UseVoiceRecordingProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecording = ({ onTranscription, onError }: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone permissions...');
      
      // Check if we're in a secure context
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta la captura de audio o no estás en una conexión segura');
      }

      // Request microphone access with explicit user gesture
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted, starting recording...');
      
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error.name === 'NotAllowedError') {
        onError?.('Acceso al micrófono denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador y recarga la página.');
      } else if (error.name === 'NotFoundError') {
        onError?.('No se encontró ningún micrófono. Por favor, conecta un micrófono y vuelve a intentar.');
      } else if (error.name === 'NotSupportedError') {
        onError?.('Tu navegador no soporta la captura de audio.');
      } else {
        onError?.('No se pudo acceder al micrófono. Por favor, verifica los permisos y que tengas un micrófono conectado.');
      }
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Use the transcription utility
      const transcribedText = await transcribeAudio(audioBlob);
      
      if (transcribedText && transcribedText.trim()) {
        console.log('Transcription successful:', transcribedText);
        onTranscription(transcribedText.trim());
      } else {
        onError?.('No se pudo transcribir el audio. Intenta hablar más claro.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      onError?.('Error al procesar el audio. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = useCallback(() => {
    console.log('Toggle recording - current state:', isRecording);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording,
    startRecording,
    stopRecording
  };
};
