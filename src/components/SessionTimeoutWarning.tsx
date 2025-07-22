
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
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Detectar actividad mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const handleActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      
      // Si hay actividad reciente (últimos 5 segundos), cerrar el modal automáticamente
      const timeSinceActivity = now - lastActivity;
      if (timeSinceActivity < 5000) {
        console.log('✅ Actividad detectada en modal de timeout, exteniendo sesión automáticamente');
        onExtend();
      }
    };

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isOpen, onExtend, lastActivity]);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(remainingMinutes * 60);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          console.log('⏰ Countdown terminado, cerrando sesión');
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

  const handleExtend = () => {
    console.log('🔄 Usuario extendió sesión manualmente');
    onExtend();
  };

  const handleLogout = () => {
    console.log('🚪 Usuario decidió cerrar sesión');
    onLogout();
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
            <br />
            <small className="text-gray-500 mt-2 block">
              Nota: Si continúas usando la aplicación, la sesión se extenderá automáticamente.
            </small>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center items-center">
          <AlertDialogCancel 
            onClick={handleLogout}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white order-2 sm:order-1"
          >
            Cerrar sesión
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleExtend}
            className="w-full sm:w-auto bg-[#00c83c] hover:bg-[#00a332] text-white order-1 sm:order-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Extender sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
