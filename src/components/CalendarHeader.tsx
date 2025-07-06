
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CalendarHeaderProps {
  userName?: string;
  msEventsCount: number;
  calendlyEventsCount: number;
  calendlyToken: string;
  onRefresh: () => void;
  isLoading: boolean;
  msError?: string | null;
  calendlyError?: string | null;
}

export function CalendarHeader({
  userName,
  msEventsCount,
  calendlyEventsCount,
  calendlyToken,
  onRefresh,
  isLoading,
  msError,
  calendlyError
}: CalendarHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#00c83c]">
            Calendario - {userName || "Usuario"}
          </h1>
          <p className="text-muted-foreground">
            Vista unificada de Microsoft Outlook ({msEventsCount} eventos) y Calendly ({calendlyEventsCount} eventos)
          </p>
          {calendlyToken && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Calendly vinculado correctamente
            </p>
          )}
        </div>

        <Button 
          onClick={onRefresh}
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar Todo
        </Button>
      </div>

      {/* Error displays */}
      {msError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error Microsoft: {msError}</p>
        </div>
      )}
      {calendlyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error Calendly: {calendlyError}</p>
        </div>
      )}
    </>
  );
}
