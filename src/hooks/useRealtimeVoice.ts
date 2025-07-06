
import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioData?: string;
}

interface UseRealtimeVoiceProps {
  onMessage: (message: AudioMessage) => void;
  onError?: (error: string) => void;
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export const useRealtimeVoice = ({ onMessage, onError }: UseRealtimeVoiceProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const currentAIResponseRef = useRef<string>('');

  const connect = useCallback(async () => {
    try {
      console.log('Connecting to realtime voice...');
      
      // Use the direct Supabase project URL
      const wsUrl = `wss://nliwgjfaqthjdpfmmmgo.functions.supabase.co/realtime-voice`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContext);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected, configuring session...');
        setIsConnected(true);
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type, data);

        if (data.type === 'session.created') {
          // Configure the session after connection
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: 'Eres Dali, un asistente de inteligencia artificial especializado en ayudar con consultas de datos financieros y análisis. Responde de manera conversacional y natural.',
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          };
          
          console.log('Sending session configuration...');
          wsRef.current?.send(JSON.stringify(sessionConfig));
        } else if (data.type === 'session.updated') {
          console.log('Session configured successfully');
          startRecording();
        } else if (data.type === 'input_audio_buffer.speech_started') {
          console.log('User started speaking');
          setIsRecording(true);
        } else if (data.type === 'input_audio_buffer.speech_stopped') {
          console.log('User stopped speaking');
          setIsRecording(false);
          // Trigger response generation
          wsRef.current?.send(JSON.stringify({ type: 'response.create' }));
        } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
          console.log('User transcript:', data.transcript);
          currentTranscriptRef.current = data.transcript;
        } else if (data.type === 'response.created') {
          console.log('AI response started');
          setIsSpeaking(true);
          currentAIResponseRef.current = '';
        } else if (data.type === 'response.audio.delta') {
          // Play audio chunk
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await audioQueueRef.current?.addToQueue(bytes);
        } else if (data.type === 'response.audio_transcript.delta') {
          currentAIResponseRef.current += data.delta;
        } else if (data.type === 'response.done') {
          console.log('AI response completed');
          setIsSpeaking(false);
          
          // Send both user and AI messages
          if (currentTranscriptRef.current) {
            onMessage({
              id: Date.now().toString(),
              type: 'user',
              content: currentTranscriptRef.current,
              timestamp: new Date()
            });
            currentTranscriptRef.current = '';
          }
          
          if (currentAIResponseRef.current) {
            onMessage({
              id: (Date.now() + 1).toString(),
              type: 'assistant',
              content: currentAIResponseRef.current,
              timestamp: new Date()
            });
            currentAIResponseRef.current = '';
          }
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
        cleanup();
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('Error de conexión con el servicio de voz');
        cleanup();
      };

    } catch (error) {
      console.error('Error connecting to realtime voice:', error);
      onError?.('No se pudo conectar al servicio de voz');
    }
  }, [onMessage, onError]);

  const startRecording = useCallback(async () => {
    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });
      
      await recorderRef.current.start();
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('No se pudo acceder al micrófono');
    }
  }, [onError]);

  const cleanup = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    audioQueueRef.current = null;
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    isSpeaking,
    connect,
    disconnect
  };
};
