
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  remainingMinutes?: number;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  onExtend,
  onLogout,
  remainingMinutes = 5
}) => {
  const [countdown, setCountdown] = useState(remainingMinutes * 60);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(remainingMinutes * 60);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingMinutes, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span>Sesión por expirar</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tu sesión expirará en <strong className="text-amber-600">{formatTime(countdown)}</strong> por inactividad.
            <br />
            ¿Deseas extender tu sesión?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel onClick={onLogout}>
            Cerrar sesión
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onExtend}
            className="bg-[#00c83c] hover:bg-[#00a332] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Extender sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
