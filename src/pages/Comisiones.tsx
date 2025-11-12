import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, FileText, Receipt } from "lucide-react";
import { CommissionsCategorySlicer, CommissionCategory } from "@/components/CommissionsCategorySlicer";
import { CommissionsFilters } from "@/components/CommissionsFilters";
import { useCommissionsData } from "@/hooks/useCommissionsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import Lottie from "lottie-react";
import { Loader2 } from "lucide-react";

// Formatear moneda COP
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Formatear porcentaje
const formatPercentage = (value: number): string => {
  if (value === 0) return '0%';
  return `${value.toFixed(2)}%`;
};

export default function Comisiones() {
  const [selectedCategory, setSelectedCategory] = React.useState<CommissionCategory>("fiduciaria");
  const [loading, setLoading] = React.useState(true);
  const [moneyAnimation, setMoneyAnimation] = React.useState<any>(null);

  const commissionsData = useCommissionsData({ selectedCategory });

  React.useEffect(() => {
    // Cargar la animación
    fetch("/animations/money.json")
      .then((response) => response.json())
      .then((data) => setMoneyAnimation(data))
      .catch((error) => console.error("Error loading animation:", error));

    // Simular carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        {moneyAnimation ? (
          <Lottie animationData={moneyAnimation} loop={true} style={{ width: 400, height: 400 }} />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        <p className="mt-4 text-lg text-muted-foreground">Cargando comisiones...</p>
      </div>
    );
  }

  const totalPages = commissionsData.pageSize > 0 
    ? Math.ceil(commissionsData.total / commissionsData.pageSize) 
    : 0;

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <p className="text-[24px] font-bold mb-1 text-foreground">Visualiza las Comisiones por Compañía</p>
        </div>
      </div>

      {/* Category Slicer */}
      <div className="flex justify-left">
        <CommissionsCategorySlicer selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      {/* Mostrar mensaje si no es Fiduciaria */}
      {selectedCategory !== 'fiduciaria' && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Categoría en desarrollo</p>
            <p className="mt-2">Las comisiones para "{selectedCategory === 'pensiones' ? 'Pensiones y Cesantías' : 'Seguros de Vida'}" estarán disponibles próximamente.</p>
          </div>
        </Card>
      )}

      {/* Tabs solo visible para Fiduciaria */}
      {selectedCategory === 'fiduciaria' && (
        <>
          {/* Filtros */}
          <CommissionsFilters
            periodFrom={commissionsData.periodFrom}
            periodTo={commissionsData.periodTo}
            producto={commissionsData.producto}
            plan={commissionsData.plan}
            contrato={commissionsData.contrato}
            nit={commissionsData.nit}
            idAgente={commissionsData.idAgente}
            idSociedad={commissionsData.idSociedad}
            setPeriodFrom={commissionsData.setPeriodFrom}
            setPeriodTo={commissionsData.setPeriodTo}
            setProducto={commissionsData.setProducto}
            setPlan={commissionsData.setPlan}
            setContrato={commissionsData.setContrato}
            setNit={commissionsData.setNit}
            setIdAgente={commissionsData.setIdAgente}
            setIdSociedad={commissionsData.setIdSociedad}
            filters={commissionsData.filters}
            canViewGlobalFilters={commissionsData.canViewGlobalFilters}
            isSocio={commissionsData.isSocio}
          />

          <Tabs defaultValue="resumen" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 h-[37px] bg-transparent gap-0 rounded-none p-0">
              <TabsTrigger
                value="resumen"
                className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-0"
              >
                <PieChart className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger
                value="detalle"
                className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
              >
                <FileText className="h-4 w-4" />
                Detalle de comisiones
              </TabsTrigger>
              <TabsTrigger
                value="facturacion"
                className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
              >
                <Receipt className="h-4 w-4" />
                Covers y facturación
              </TabsTrigger>
            </TabsList>

            {/* Tab Resumen */}
            <TabsContent value="resumen" className="mt-0">
              <div className="space-y-6">
                {commissionsData.loadingSummary ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : commissionsData.summary ? (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Comisiones Año</CardDescription>
                          <CardTitle className="text-2xl">
                            {formatCurrency(commissionsData.summary.total_year ?? 0)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Comisiones Mes</CardDescription>
                          <CardTitle className="text-2xl">
                            {formatCurrency(commissionsData.summary.total_month ?? 0)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Nuevos Clientes</CardDescription>
                          <CardTitle className="text-2xl">
                            {commissionsData.summary.new_clients ?? 0}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Tasa de Conversión</CardDescription>
                          <CardTitle className="text-2xl">
                            {formatPercentage(commissionsData.summary.conversion_rate ?? 0)}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    {/* Gráficas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Mix de Productos */}
                      {commissionsData.summary.product_mix && commissionsData.summary.product_mix.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Mix de Productos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <RechartsPieChart>
                                <Pie
                                  data={commissionsData.summary.product_mix}
                                  dataKey="percentage"
                                  nameKey="label"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  label
                                >
                                  {commissionsData.summary.product_mix.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Distribución del Equipo */}
                      {commissionsData.summary.team_distribution && commissionsData.summary.team_distribution.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Distribución del Equipo</CardTitle>
                            <CardDescription>
                              Promedio del equipo: {formatCurrency(commissionsData.summary.team_avg ?? 0)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={commissionsData.summary.team_distribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    No hay datos de resumen disponibles
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Detalle */}
            <TabsContent value="detalle" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  {commissionsData.loadingDetail ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : commissionsData.rows.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Contrato</TableHead>
                            <TableHead>NIT</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead className="text-right">Comisión</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {commissionsData.rows.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.Periodo}</TableCell>
                              <TableCell>{row.Producto}</TableCell>
                              <TableCell>{row.Plan}</TableCell>
                              <TableCell>{row.Contrato}</TableCell>
                              <TableCell>{row.NIT}</TableCell>
                              <TableCell>{row.Empresa}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(row.ComisionTotal)}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  row.Estado === 'Pagada' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {row.Estado}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Paginación */}
                      <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {((commissionsData.page - 1) * commissionsData.pageSize) + 1} a{' '}
                          {Math.min(commissionsData.page * commissionsData.pageSize, commissionsData.total)} de{' '}
                          {commissionsData.total} comisiones
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => commissionsData.setPage(commissionsData.page - 1)}
                            disabled={commissionsData.page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <div className="text-sm">
                            Página {commissionsData.page} de {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => commissionsData.setPage(commissionsData.page + 1)}
                            disabled={commissionsData.page >= totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      No se encontraron comisiones con los filtros aplicados
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Facturación */}
            <TabsContent value="facturacion" className="mt-6">
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">Próximamente</p>
                  <p className="mt-2">La sección de Covers y Facturación estará disponible pronto.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
