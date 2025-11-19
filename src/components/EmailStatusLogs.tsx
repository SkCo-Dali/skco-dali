import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, CheckCircle, Paperclip, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { EmailLog, EmailLogDetail } from "@/types/email";
import { formatBogotaDateTime } from "@/utils/dateUtils";
import { EmailDetailDialog } from "@/components/EmailDetailDialog";
import { EmailLogsFilters } from "@/components/EmailLogsFilters";
import { EmailLogsKPIs } from "@/components/EmailLogsKPIs";

interface EmailStatusLogsProps {
  logs: EmailLog[];
  isLoading: boolean;
  onRefresh: (page?: number, pageSize?: number) => void;
  onFetchDetail: (logId: string) => Promise<EmailLogDetail | null>;
  onDownloadAttachment: (logId: string, fileName: string) => Promise<void>;
  onResendEmail?: (email: EmailLogDetail) => void;
}

export function EmailStatusLogs({
  logs,
  isLoading,
  onRefresh,
  onFetchDetail,
  onDownloadAttachment,
  onResendEmail,
}: EmailStatusLogsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState<EmailLogDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Campañas únicas
  const uniqueCampaigns = useMemo(() => {
    const campaigns = logs.map((log) => log.Campaign).filter(Boolean);
    return Array.from(new Set(campaigns));
  }, [logs]);

  // Aplicar filtros
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesEmail = log.ToEmail?.toLowerCase().includes(search);
        const matchesSubject = log.Subject?.toLowerCase().includes(search);
        if (!matchesEmail && !matchesSubject) return false;
      }

      if (statusFilter !== "all" && log.Status !== statusFilter) return false;
      if (campaignFilter !== "all" && log.Campaign !== campaignFilter) return false;

      if (dateFrom || dateTo) {
        const logDate = new Date(log.CreatedAt);
        if (dateFrom && logDate < dateFrom) return false;
        if (dateTo) {
          const endOfDay = new Date(dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          if (logDate > endOfDay) return false;
        }
      }

      return true;
    });
  }, [logs, searchTerm, statusFilter, campaignFilter, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCampaignFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  const getStatusColor = (status: EmailLog["Status"]) => {
    switch (status) {
      case "SENT":
      case "Success":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: EmailLog["Status"]) => {
    switch (status) {
      case "SENT":
      case "Success":
        return "Exitoso";
      case "ERROR":
        return "Fallido";
      default:
        return status;
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    onRefresh(1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onRefresh(newPage, pageSize);
  };

  const handleRowClick = async (log: EmailLog) => {
    setIsLoadingDetail(true);
    const detail = await onFetchDetail(log.Id);
    setIsLoadingDetail(false);
    if (detail) {
      setSelectedEmailDetail(detail);
    }
  };

  return (
    <>
      <div className="w-full max-w-[1100px] mx-auto">
        <Card className="space-y-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold leading-tight">Historial de Correos Enviados</h2>
                <p className="text-xs text-muted-foreground mt-1">Mostrando {filteredLogs.length} resultados</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* KPIs */}
            <EmailLogsKPIs logs={filteredLogs} />

            {/* Filtros (sin Card extra) */}
            <div className="rounded-xl border bg-muted/30 px-3 py-2">
              <EmailLogsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                campaignFilter={campaignFilter}
                onCampaignChange={setCampaignFilter}
                dateFrom={dateFrom}
                onDateFromChange={setDateFrom}
                dateTo={dateTo}
                onDateToChange={setDateTo}
                campaigns={uniqueCampaigns}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Tabla con scroll vertical + horizontal */}
            <div className="border rounded-xl overflow-hidden">
              <ScrollArea className="h-[380px]">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Asunto</TableHead>
                      <TableHead className="w-[220px]">Destinatario</TableHead>
                      <TableHead className="w-[200px]">Campaña</TableHead>
                      <TableHead className="w-[110px]">Estado</TableHead>
                      <TableHead className="w-[160px]">Fecha Envío</TableHead>
                      <TableHead className="w-[190px]">Apertura</TableHead>
                      <TableHead className="w-[90px]">Adjuntos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-5">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Cargando...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-5 text-muted-foreground">
                          No se encontraron registros de correos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow
                          key={log.Id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(log)}
                        >
                          <TableCell className="max-w-xs truncate" title={log.Subject}>
                            {log.Subject}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={log.ToEmail}>
                            {log.ToEmail}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.Campaign || "Sin campaña"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(log.Status)} variant="secondary">
                              {getStatusText(log.Status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatBogotaDateTime(log.CreatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.OpenedAt ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-green-600">{formatBogotaDateTime(log.OpenedAt)}</span>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  No abierto
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.hasAttachments && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Paperclip className="h-4 w-4" />
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-muted-foreground">Página {currentPage}</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={logs.length < pageSize || isLoading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EmailDetailDialog
        email={selectedEmailDetail}
        isOpen={!!selectedEmailDetail}
        onClose={() => setSelectedEmailDetail(null)}
        isLoading={isLoadingDetail}
        onDownloadAttachment={onDownloadAttachment}
        onResendEmail={onResendEmail}
      />
    </>
  );
}
