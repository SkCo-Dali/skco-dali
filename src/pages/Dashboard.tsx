import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardOverview } from "@/components/DashboardOverview";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";
import ChatSami from "@/components/ChatSami";
import { getRolePermissions } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { leads, loading } = useLeadsApi();
  const { hasAccess, currentUser } = usePageAccess("dashboard");
  const { user } = useAuth();
  const userPermissions = user ? getRolePermissions(user.role) : null;

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="m-4 pt-0 flex h-[calc(100vh-theme(spacing.16))]">
      <div className={`flex-1 ${userPermissions?.chatSami ? "pr-0" : ""}`}>
        <div className="min-h-screen pt-14 md:pt-16">
          <div className="p-3 md:p-4 max-w-7xl mx-auto">
            <DashboardHeader />
            
            {currentUser ? (
              <div className="mt-4">
                <DashboardOverview leads={leads} loading={loading} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 md:h-64">
                <div className="text-center px-4">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground mb-3 md:mb-4">Bienvenido al sistema CRM</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Inicia sesión para ver tu dashboard</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ChatSami - solo visible para roles autorizados */}
      {userPermissions?.chatSami && <ChatSami defaultMinimized={true} />}
    </div>
  );
}
