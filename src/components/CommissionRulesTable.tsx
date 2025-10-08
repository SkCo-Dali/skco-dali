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
    return <div className="text-center py-8 text-muted-foreground">No rules defined for this commission plan yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3">
      {/* Rules Table */}
      <div className="max-h-80 lg:col-span-2 mr-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Catalog</TableHead>
                {planId && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, index) => (
                <TableRow
                  key={rule.id}
                  className={selectedRule?.id === rule.id ? "bg-muted/50" : "cursor-pointer hover:bg-muted/30"}
                  onClick={() => {
                    setSelectedRule(rule);
                    setRuleToEdit(rule);
                  }}
                >
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell className="font-medium text-wrap">{rule.name}</TableCell>
                  <TableCell className="max-w-xs text-center">
                    <code className="text-center text-xs bg-muted px-2 py-1 rounded">{rule.formula}</code>
                  </TableCell>
                  <TableCell className="max-w-xs text-center">
                    <div className="truncate text-sm" title={rule.conditions}>
                      {rule.conditions}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex justify-center">
                      {rule.catalog}
                    </Badge>
                  </TableCell>
                  {planId && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRuleToDelete(rule);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Rule Details Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rule Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRule ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-muted-foreground mt-1">{selectedRule.name}</p>
                    </div>
                    {selectedRule.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Catalog:</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedRule.catalog}
                      </Badge>
                    </div>

                    {selectedRule.owner && (
                      <div>
                        <span className="font-medium">Owner:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.owner}</p>
                      </div>
                    )}

                    {selectedRule.dataField && (
                      <div>
                        <span className="font-medium">Data Field:</span>
                        <p className="text-muted-foreground mt-1">{selectedRule.dataField}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Formula</h4>
                  <code className="text-xs bg-muted p-2 rounded block break-words">{selectedRule.formula}</code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Conditions</h4>
                  <p className="text-sm text-muted-foreground break-words">{selectedRule.conditions}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Select a rule to view details</div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!ruleToDelete} onOpenChange={() => setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule "{ruleToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
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
