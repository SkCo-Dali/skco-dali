
import React, { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUserPhoto } from '../hooks/useUserPhoto';
import { DataTable } from './DataTable';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
import { useSimpleConversation } from '../contexts/SimpleConversationContext';
import { ENV } from '../config/environment';

interface SimpleMessageProps {
  message: ChatMessage;
}

export const SimpleMessage: React.FC<SimpleMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const { photoUrl } = useUserPhoto();
  const { currentConversation } = useSimpleConversation();
  const isUser = message.type === 'user';
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(
    message.metadata?.feedback || null
  );
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const getUserInitials = () => {
    if (!user) return 'U';
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.name ||
                       'Usuario';
    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (!currentConversation || !user?.email) return;
    
    setIsSubmittingFeedback(true);
    
    try {
      // Si ya tiene la misma calificación, la quita
      const newFeedback = feedback === rating ? null : rating;
      setFeedback(newFeedback);
      
      // Actualizar el mensaje con el feedback
      const updatedMessage = {
        ...message,
        metadata: {
          ...message.metadata,
          feedback: newFeedback,
          feedbackDate: newFeedback ? new Date().toISOString() : undefined
        }
      };

      // Actualizar todos los mensajes de la conversación
      const updatedMessages = currentConversation.messages.map(msg => 
        msg.id === message.id ? updatedMessage : msg
      );

      // Enviar la actualización a la API
      const conversationUpdate = {
        id: currentConversation.id,
        userId: user.email,
        title: currentConversation.title,
        messages: updatedMessages.map(msg => ({
          messageId: msg.id,
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          data: msg.data,
          chart: msg.chart,
          downloadLink: msg.downloadLink,
          videoPreview: msg.videoPreview,
          metadata: msg.metadata
        })),
        updatedAt: new Date().toISOString(),
        tags: currentConversation.tags,
        isArchived: currentConversation.isArchived,
        totalTokens: currentConversation.totalTokens
      };

      // Get auth headers
      const { SecureTokenManager } = await import('@/utils/secureTokenManager');
      const tokenData = SecureTokenManager.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (tokenData && tokenData.token) {
        headers['Authorization'] = `Bearer ${tokenData.token}`;
      }

      const response = await fetch(`${ENV.AI_API_BASE_URL}/api/conversations/${currentConversation.id}?user_id=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(conversationUpdate)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating feedback:', response.status, errorText);
        // Revertir el feedback en caso de error
        setFeedback(message.metadata?.feedback || null);
      } else {
        console.log('Feedback updated successfully:', {
          conversationId: currentConversation.id,
          messageId: message.id,
          feedback: newFeedback
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Revertir el feedback en caso de error
      setFeedback(message.metadata?.feedback || null);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`${isUser ? 'max-w-[70%]' : 'max-w-[70%]'} flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <Avatar className="w-8 h-8">
              {photoUrl && (
                <AvatarImage src={photoUrl} alt={user?.name || 'Usuario'} />
              )}
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
              <img 
                src={`${ENV.AI_STUDIO_BLOB_URL}/skandia-icons/DaliLogo.gif`}
                alt="Dali AI Logo"
                className="w-8 h-8 object-contain rounded-full"
              />
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-gray-100 text-gray-900 border border-gray-200' 
              : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
          }`}>
            {/* Text content */}
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {message.content}
            </div>
            
            {/* Table data - usando el nuevo componente optimizado */}
            {message.data && (
              <DataTable data={message.data} />
            )}
            
            {/* Chart data */}
            {message.chart && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Gráfica generada:</p>
                <div className="text-sm text-gray-700">
                  {JSON.stringify(message.chart, null, 2)}
                </div>
              </div>
            )}
            
            {/* Download link */}
            {message.downloadLink && (
              <div className="mt-3">
                <a 
                  href={message.downloadLink.url}
                  download={message.downloadLink.filename}
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  📄 Descargar: {message.downloadLink.filename}
                </a>
              </div>
            )}
            
            {/* Video preview */}
            {message.videoPreview && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Video generado:</p>
                <div className="text-sm text-gray-700">
                  <strong>{message.videoPreview.title}</strong>
                  <br />
                  <a 
                    href={message.videoPreview.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Ver video
                  </a>
                </div>
              </div>
            )}
            
            {/* Timestamp */}
            <div className={`mt-2 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* Rating buttons - solo para mensajes del asistente */}
          {!isUser && (
            <div className="flex items-center justify-start mt-2 space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('positive')}
                disabled={isSubmittingFeedback}
                className={`h-8 w-8 p-0 hover:bg-green-100 ${
                  feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('negative')}
                disabled={isSubmittingFeedback}
                className={`h-8 w-8 p-0 hover:bg-red-100 ${
                  feedback === 'negative' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              {isSubmittingFeedback && (
                <span className="text-xs text-gray-500">Enviando...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
