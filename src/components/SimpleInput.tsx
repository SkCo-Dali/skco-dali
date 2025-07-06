
import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useIsMobile } from '../hooks/use-mobile';

interface SimpleInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const SimpleInput: React.FC<SimpleInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  value, 
  onChange 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = isMobile ? 100 : 120;
      const minHeight = isMobile ? 40 : 44;
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [value, isMobile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (value.trim() && !disabled) {
      onSendMessage(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`border-t bg-white w-full ${isMobile ? 'p-3' : 'p-4'}`}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 w-full">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Enviando..." : "Escribe tu mensaje..."}
          disabled={disabled}
          className={`flex-1 resize-none transition-all duration-200 border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 ${
            isMobile ? 'min-h-[40px] text-base' : 'min-h-[44px] text-sm'
          }`}
          rows={1}
          style={{ 
            height: isMobile ? '40px' : '44px',
            fontSize: isMobile ? '16px' : '14px'
          }}
        />
        
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className={`bg-green-500 hover:bg-green-600 text-white flex-shrink-0 ${
            isMobile ? 'h-[40px] w-[40px] min-w-[40px]' : 'h-[44px] w-[44px]'
          }`}
          size="icon"
        >
          <Send className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        </Button>
      </form>
    </div>
  );
};
