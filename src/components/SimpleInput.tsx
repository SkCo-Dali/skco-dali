
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
    <div className={`w-full ${isMobile ? 'p-3' : 'p-4'}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Enviando..." : "Escribe tu mensaje..."}
            disabled={disabled}
            className={`w-full resize-none transition-all duration-200 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring rounded-2xl ${
              isMobile ? 'min-h-[40px] text-base pr-12' : 'min-h-[44px] text-sm pr-12'
            }`}
            rows={1}
            style={{ 
              height: isMobile ? '40px' : '44px',
              fontSize: isMobile ? '16px' : '14px',
              paddingRight: value.trim() ? (isMobile ? '48px' : '52px') : '12px'
            }}
          />
          
          {value.trim() && (
            <Button
              type="submit"
              disabled={disabled}
              variant="ghost"
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0 ${
                isMobile ? 'h-[32px] w-[32px] min-w-[32px]' : 'h-[36px] w-[36px]'
              }`}
              size="icon"
            >
              <Send className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
