
import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit3, Calendar, Tag, Clock, User, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationCardProps {
  conversation: {
    id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
  isActive: boolean;
  isLoading: boolean;
  onLoad: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isActive,
  isLoading,
  onLoad,
  onDelete,
  onUpdateTitle
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== conversation.title) {
      onUpdateTitle(conversation.id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(conversation.title);
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
        isActive 
          ? 'border-l-green-500 bg-green-50 border-green-200 shadow-md' 
          : 'border-l-gray-200 hover:border-l-green-300 border-gray-200 hover:bg-gray-50'
      } ${isLoading ? 'opacity-60' : ''}`}
      onClick={() => !isEditingTitle && onLoad(conversation.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Título con indicadores */}
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 h-8 text-lg font-bold"
                    autoFocus
                    onBlur={handleSaveTitle}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTitle}
                    className="h-8 w-8 p-0 hover:bg-green-100"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <h3 className="font-bold text-lg text-gray-900 truncate flex-1">
                  {conversation.title}
                </h3>
              )}
              
              {isLoading && (
                <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full flex-shrink-0"></div>
              )}
              
              {isActive && !isEditingTitle && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  ACTIVA
                </div>
              )}
            </div>
            
            {/* Mensaje preview */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-gray-100 rounded-full flex-shrink-0">
                <User className="h-3 w-3 text-gray-500" />
              </div>
              <p className="text-gray-600 leading-relaxed flex-1">
                {truncateText(conversation.lastMessage)}
              </p>
            </div>
            
            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(conversation.updatedAt, { addSuffix: true, locale: es })}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>{conversation.messageCount} mensajes</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(conversation.updatedAt)}</span>
              </div>
            </div>
            
            {/* Tags */}
            {conversation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {conversation.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {conversation.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                    +{conversation.tags.length - 3} más
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Acciones - Solo mostrar si no está editando */}
          {!isEditingTitle && (
            <div className="flex flex-col items-center space-y-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                title="Editar título"
              >
                <Edit3 className="h-4 w-4 text-gray-500" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, conversation.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 rounded-full"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
