import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { callAzureAgentApi } from '@/utils/azureApiService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
}

interface EmailWritingAssistantProps {
  currentSubject: string;
  currentContent: string;
  onInsertText: (text: string) => void;
}

export function EmailWritingAssistant({ 
  currentSubject, 
  currentContent, 
  onInsertText 
}: EmailWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { aiSettings } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Contexto del email actual para el asistente
      const contextPrompt = `Estoy escribiendo un email con el siguiente contexto:
Asunto: "${currentSubject || '(sin asunto)'}"
Contenido actual: "${currentContent || '(vacío)'}"

Mi pregunta: ${input}

Por favor, ayúdame con sugerencias específicas para mejorar la redacción del email.`;

      const response = await callAzureAgentApi(
        contextPrompt,
        [],
        aiSettings,
        user?.email || ''
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: (response as any).text || 'Lo siento, no pude generar una respuesta.'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al consultar asistente:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu solicitud.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Bot className="h-4 w-4" />
        Asistente de Redacción
      </Button>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 p-1.5">
            <img
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif"
              alt="Dali AI"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="font-medium text-sm">Asistente Dali</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-64 overflow-y-auto border rounded-md p-3 bg-muted/20 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              ¡Hola! Soy Dali. Pregúntame sobre cómo mejorar tu email.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Ejemplos: "¿Cómo puedo hacer el asunto más atractivo?" o "Mejora el tono del mensaje"
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe tu pregunta aquí..."
          className="min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
