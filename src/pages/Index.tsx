import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardOverview } from "@/components/DashboardOverview";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useAuth } from "@/contexts/AuthContext";
import { AccessDenied } from "@/components/AccessDenied";
import { PageLoading } from "@/components/PageLoading";
import { usePageAccess } from "@/hooks/usePageAccess";

const Index = () => {
  const { hasAccess, isLoading, currentUser } = usePageAccess("index");

  if (isLoading) {
    return <PageLoading />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }
  const { leads, loading } = useLeadsApi();
  const { user } = useAuth();

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <DashboardHeader />

      {currentUser ? (
        <div className="mt-4">
          <DashboardOverview leads={leads} loading={loading} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 md:h-64">
          <div className="text-center px-4">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground mb-3 md:mb-3">
              Bienvenido al sistema CRM
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">Inicia sesión para ver tu dashboard</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
