import React, { useState } from "react";
import { CommissionRule } from "@/data/commissionPlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommissionRulesTableProps {
  rules: CommissionRule[];
}

export function CommissionRulesTable({ rules }: CommissionRulesTableProps) {
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(
    rules.length > 0 ? rules[0] : null
  );

  if (rules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rules defined for this commission plan yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Rules Table */}
      <div className="lg:col-span-2">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Catalog</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, index) => (
                <TableRow 
                  key={rule.id}
                  className={selectedRule?.id === rule.id ? "bg-muted/50" : "cursor-pointer hover:bg-muted/30"}
                  onClick={() => setSelectedRule(rule)}
                >
                  <TableCell className="font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {rule.name}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {rule.formula}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-sm" title={rule.conditions}>
                      {rule.conditions}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {rule.catalog}
                    </Badge>
                  </TableCell>
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
                  <code className="text-xs bg-muted p-2 rounded block break-words">
                    {selectedRule.formula}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Conditions</h4>
                  <p className="text-sm text-muted-foreground break-words">
                    {selectedRule.conditions}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Select a rule to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}