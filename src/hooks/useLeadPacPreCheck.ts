import { useState, useCallback, useRef, useEffect } from "react";
import {
  verifyPacByNit,
  PacPreCheckResult,
  normalizeNit,
  logPacPreCheck,
} from "@/services/pacPreCheckService";

interface UseLeadPacPreCheckOptions {
  userId: string;
  debounceMs?: number;
  autoVerify?: boolean;
}

interface UseLeadPacPreCheckReturn {
  nit: string;
  setNit: (nit: string) => void;
  normalizedNit: string;
  isVerifying: boolean;
  verificationResult: PacPreCheckResult | null;
  error: string | null;
  hasVerified: boolean;
  verify: () => Promise<void>;
  reset: () => void;
  logDecision: (decision: "create" | "open" | "cancel" | "convert") => Promise<void>;
}

export function useLeadPacPreCheck(
  options: UseLeadPacPreCheckOptions
): UseLeadPacPreCheckReturn {
  const { userId, debounceMs = 400, autoVerify = true } = options;

  const [nit, setNit] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PacPreCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const normalizedNit = normalizeNit(nit);

  const verify = useCallback(async () => {
    if (!normalizedNit) {
      setError("El NIT es requerido");
      return;
    }

    // Validación básica de formato
    if (normalizedNit.length < 9 || normalizedNit.length > 10) {
      setError("El NIT debe tener entre 9 y 10 dígitos");
      return;
    }

    // Cancelar verificación anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyPacByNit({
        nit: normalizedNit,
        userId,
      });

      setVerificationResult(result);
      setHasVerified(true);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Error al verificar el NIT. Por favor intente nuevamente.");
        console.error("Error en verificación PAC:", err);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [normalizedNit, userId]);

  // Auto-verificación con debounce en onBlur
  useEffect(() => {
    if (!autoVerify || !normalizedNit || normalizedNit.length < 9) {
      return;
    }

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Establecer nuevo timer
    debounceTimerRef.current = setTimeout(() => {
      verify();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [normalizedNit, verify, autoVerify, debounceMs]);

  const reset = useCallback(() => {
    setNit("");
    setVerificationResult(null);
    setError(null);
    setHasVerified(false);
    setIsVerifying(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const logDecision = useCallback(
    async (decision: "create" | "open" | "cancel" | "convert") => {
      if (verificationResult) {
        await logPacPreCheck(userId, nit, verificationResult, decision);
      }
    },
    [userId, nit, verificationResult]
  );

  return {
    nit,
    setNit,
    normalizedNit,
    isVerifying,
    verificationResult,
    error,
    hasVerified,
    verify,
    reset,
    logDecision,
  };
}
