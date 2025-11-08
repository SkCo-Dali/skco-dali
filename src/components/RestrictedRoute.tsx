import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { usePageAccess } from "@/hooks/usePageAccess";
import { AccessDenied } from "@/components/AccessDenied";

/**
 * Componente que valida el acceso a rutas basándose en el primer segmento de la URL
 * Usa el hook usePageAccess para verificar permisos
 * Si el usuario no tiene acceso, muestra AccessDenied
 * Si tiene acceso, renderiza el componente hijo con Outlet
 */
export function RestrictedRoute() {
  const location = useLocation();

  // Extraer el nombre de la página del pathname actual
  const pageName = useMemo(() => {
    const path = location.pathname.startsWith("/") 
      ? location.pathname.slice(1) 
      : location.pathname;
    
    // Obtener el primer segmento de la ruta
    const segments = path.split("/").filter(Boolean);
    const firstSegment = segments[0] || "";
    
    // Para rutas admin, usar el segundo segmento
    if (firstSegment === "admin" && segments.length > 1) {
      return segments[1];
    }
    
    // Mapeo especial de rutas a nombres de páginas en accessiblePages
    const routeToPageMap: Record<string, string> = {
      "oportunidades": "opportunities",
      "": "dashboard", // Ruta raíz
    };
    
    // Si existe un mapeo, usarlo; sino, usar el primer segmento tal cual
    return routeToPageMap[firstSegment] || firstSegment;
  }, [location.pathname]);

  // Validar acceso usando el hook usePageAccess
  const { hasAccess, isLoading } = usePageAccess(pageName);

  // Mostrar loading mientras se verifica el acceso
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Si no tiene acceso, mostrar componente AccessDenied
  if (!hasAccess && pageName) {
    return <AccessDenied />;
  }

  // Si tiene acceso, renderizar el componente hijo
  return <Outlet />;
}
