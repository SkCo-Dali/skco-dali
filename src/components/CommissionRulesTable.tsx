import React, { useState } from "react";
import { CommissionRule } from "@/data/commissionPlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditRuleDialog } from "@/components/EditRuleDialog";

interface CommissionRulesTableProps {
  rules: CommissionRule[];
  planId?: string;
  onRuleDeleted?: () => void;
  onRuleUpdated?: () => void;
}

export function CommissionRulesTable({ rules, planId, onRuleDeleted, onRuleUpdated }: CommissionRulesTableProps) {
  const { toast } = useToast();
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(rules.length > 0 ? rules[0] : null);
  const [ruleToDelete, setRuleToDelete] = useState<CommissionRule | null>(null);
  const [ruleToEdit, setRuleToEdit] = useState<CommissionRule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRule = async () => {
    if (!ruleToDelete || !planId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_CRM_API_BASE_URL || "https://skcodalilmdev.azurewebsites.net"}/api/commission-rules/${ruleToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `Failed to delete rule: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Rule deleted successfully",
      });

      setRuleToDelete(null);
      if (selectedRule?.id === ruleToDelete.id) {
        setSelectedRule(null);
      }
      onRuleDeleted?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete rule";

      if (errorMessage.includes("dependencias") || errorMessage.includes("dependencies")) {
        toast({
          title: "Cannot Delete Rule",
          description: "This rule has associated conditions, incentives, or payments. Please remove them first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (rules.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No hay reglas definidas para este plan de comisiones aún.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3">
      {/* Rules Table */}
      <div className="max-h-80 lg:col-span-2 mr-2">
        <div
          className="
    relative rounded-lg border bg-card
    overflow-x-auto mb-3
    [scrollbar-gutter:stable]
    [&::-webkit-scrollbar]:h-2
    [&::-webkit-scrollbar-track]:bg-white
    [&::-webkit-scrollbar-thumb]:bg-[#00c73d]
    [&::-webkit-scrollbar-thumb]:rounded-full
  "
        >
          <Table className="min-w-[920px] table-fixed [&>tr>th]:text-center">
            <TableHeader className="sticky top-0 z-10 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 [&>tr>th]:text-center">
              <TableRow>
                <TableHead className="w-10 text-[11px] uppercase tracking-wide text-muted-foreground text-center">
                  #
                </TableHead>
                <TableHead className="w-[200px] text-[11px] uppercase tracking-wide text-muted-foreground text-center">
                  Nombre
                </TableHead>
                <TableHead className="w-[280px] text-[11px] uppercase tracking-wide text-muted-foreground text-center">
                  Fórmula
                </TableHead>
                <TableHead className="w-[260px] text-[11px] uppercase tracking-wide text-muted-foreground text-center">
                  Condiciones
                </TableHead>
                {planId && (
                  <TableHead className="w-20 text-[11px] uppercase tracking-wide text-muted-foreground text-center">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rules.map((rule, index) => {
                const selected = selectedRule?.id === rule.id;
                return (
                  <TableRow
                    key={rule.id}
                    className={[
                      "cursor-pointer group",
                      "even:bg-muted/10 hover:bg-muted/20 transition-colors",
                      selected ? "bg-primary/5 ring-1 ring-primary/30" : "",
                    ].join(" ")}
                    onClick={() => {
                      setSelectedRule(rule);
                      setRuleToEdit(rule);
                    }}
                  >
                    {/* # */}
                    <TableCell className="py-2 text-xs text-center text-muted-foreground">{index + 1}</TableCell>

                    {/* Name */}
                    <TableCell className="py-2 text-sm">
                      <div className="truncate" title={rule.name}>
                        {rule.name}
                      </div>
                    </TableCell>

                    {/* Formula */}
                    <TableCell className="py-2">
                      <div className="flex items-center justify-center">
                        <code
                          className="font-mono text-xs bg-muted/60 px-2 py-1 rounded border border-border inline-block max-w-[26ch] truncate"
                          title={rule.formula}
                        >
                          {rule.formula}
                        </code>
                      </div>
                    </TableCell>

                    {/* Conditions */}
                    <TableCell className="py-2">
                      <div className="text-xs truncate" title={rule.conditions || ""}>
                        {rule.conditions || <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    {planId && (
                      <TableCell className="py-2 text-center">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRuleToDelete(rule);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Rule Details Panel */}
      <div className="lg:col-span-1 overflow-y-auto mr-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de la Regla</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRule ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Información</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span>
                      <p className="text-muted-foreground mt-1">{selectedRule.name}</p>
                    </div>
                    {selectedRule.description && (
                      <div>
                        <span className="font-medium">Descripción:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Detalles</h4>
                  <div className="space-y-3 text-sm">
                    {selectedRule.owner && (
                      <div>
                        <span className="font-medium">Propietario:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.owner}</p>
                      </div>
                    )}

                    {selectedRule.dataField && (
                      <div>
                        <span className="font-medium">Campo de Datos:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.dataField}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Fórmula</h4>
                  <code className="text-xs bg-muted p-2 rounded block break-words">{selectedRule.formula}</code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Condiciones</h4>
                  <p className="text-sm text-muted-foreground break-words">{selectedRule.conditions}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Selecciona una regla para ver detalles</div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Regla</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la regla "{ruleToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {ruleToEdit && planId && (
        <EditRuleDialog
          rule={ruleToEdit}
          planId={planId}
          open={!!ruleToEdit}
          onOpenChange={(open) => {
            if (!open) setRuleToEdit(null);
          }}
          onRuleUpdated={() => {
            setRuleToEdit(null);
            onRuleUpdated?.();
          }}
        />
      )}
    </div>
  );
}
