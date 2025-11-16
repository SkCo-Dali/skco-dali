import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, Eye, TrendingUp } from "lucide-react";
import { EmailLog } from "@/types/email";

interface EmailLogsKPIsProps {
  logs: EmailLog[];
}

export function EmailLogsKPIs({ logs }: EmailLogsKPIsProps) {
  const totalEmails = logs.length;
  const sentEmails = logs.filter(log => log.Status === 'SENT').length;
  const errorEmails = logs.filter(log => log.Status === 'ERROR').length;
  const openedEmails = logs.filter(log => log.OpenedAt !== null).length;
  const openRate = totalEmails > 0 ? ((openedEmails / totalEmails) * 100).toFixed(1) : '0.0';
  const successRate = totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(1) : '0.0';

  const kpis = [
    {
      title: "Total Enviados",
      value: totalEmails,
      icon: Mail,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Exitosos",
      value: sentEmails,
      subtitle: `${successRate}% del total`,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Con Error",
      value: errorEmails,
      subtitle: errorEmails > 0 ? `${((errorEmails/totalEmails)*100).toFixed(1)}% del total` : undefined,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950"
    },
    {
      title: "Abiertos",
      value: openedEmails,
      subtitle: `Tasa: ${openRate}%`,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {kpi.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
