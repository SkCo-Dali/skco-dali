import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCatalogs, useCatalogFields } from "@/hooks/useCatalogs";
import { listCatalogFieldValues } from "@/utils/catalogsApiClient";
import { CatalogFieldValue } from "@/types/catalogsApi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommissionRule } from "@/data/commissionPlans";

interface EditRuleDialogProps {
  rule: CommissionRule | null;
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRuleUpdated?: () => void;
}

const OWNER_FIELD_OPTIONS = [
  'Agente',
  'Empleado',
  'Director',
  'Gerente'
];

const DATE_FIELD_OPTIONS = [
  'Fecha Efectiva',
  'Fecha Vencimiento',
  'Fecha Creación'
];

const MATH_OPERATORS = [
  { symbol: '%', label: '%' },
  { symbol: '*', label: '×' },
  { symbol: '/', label: '÷' },
  { symbol: '+', label: '+' },
  { symbol: '-', label: '-' },
  { symbol: '(', label: '(' },
  { symbol: ')', label: ')' },
];

export function EditRuleDialog({ rule, planId, open, onOpenChange, onRuleUpdated }: EditRuleDialogProps) {
  const { toast } = useToast();
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch catalogs
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerField: '',
    dateField: '',
    goalIncentive: false,
    catalog: '',
    formula: ''
  });

  const [activeTab, setActiveTab] = useState('information');
  const [fieldSearch, setFieldSearch] = useState('');

  // Fetch catalog fields when catalog is selected
  const { fields: catalogFields, loading: fieldsLoading } = useCatalogFields(formData.catalog || '');
  
  // Filter active catalogs
  const activeCatalogs = catalogs.filter(c => c.is_active);

  // Load rule data when it changes
  useEffect(() => {
    if (rule && open) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        ownerField: rule.owner || '',
        dateField: rule.dataField || '',
        goalIncentive: false,
        catalog: rule.catalog || '',
        formula: rule.formula || ''
      });
      setActiveTab('information');
    }
  }, [rule, open]);

  const insertField = (field: string) => {
    const textarea = formulaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentFormula = formData.formula;
    
    const newFormula = currentFormula.substring(0, start) + field + currentFormula.substring(end);
    
    setFormData(prev => ({
      ...prev,
      formula: newFormula
    }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = start + field.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const insertOperator = (operator: string) => {
    const textarea = formulaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentFormula = formData.formula;
    
    const newFormula = currentFormula.substring(0, start) + operator + currentFormula.substring(end);
    
    setFormData(prev => ({
      ...prev,
      formula: newFormula
    }));

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = start + operator.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const hasLetters = /[a-zA-Z]/.test(value);
    
    if (hasLetters) {
      const validPattern = /^[0-9\s%*/()+.\-]*(record\.[a-zA-Z_][a-zA-Z0-9_]*[0-9\s%*/()+.\-]*)*$/;
      if (validPattern.test(value)) {
        setFormData(prev => ({ ...prev, formula: value }));
      }
    } else {
      if (/^[0-9\s%*/()+.\-]*$/.test(value)) {
        setFormData(prev => ({ ...prev, formula: value }));
      }
    }
  };

  const filteredFields = catalogFields
    .filter(field => field.field_name.toLowerCase().includes(fieldSearch.toLowerCase()))
    .map(field => field.field_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rule || !formData.name || !formData.formula || !formData.catalog) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Formula, Catalog)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { updateCommissionRule } = await import('@/utils/commissionRulesApiClient');
      
      const updatedRule = await updateCommissionRule(rule.id, {
        name: formData.name,
        description: formData.description,
        formula: formData.formula,
        catalog: formData.catalog,
        date_field: formData.dateField,
        owner_name: formData.ownerField,
        is_active: true
      });

      if (updatedRule) {
        toast({
          title: "Success",
          description: `Rule "${formData.name}" has been updated successfully.`
        });
        
        handleCancel();
        onRuleUpdated?.();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update rule';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({
      name: '',
      description: '',
      ownerField: '',
      dateField: '',
      goalIncentive: false,
      catalog: '',
      formula: ''
    });
    setActiveTab('information');
  };

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Commission Rule</DialogTitle>
          <DialogDescription>
            Update the rule details, formula and conditions.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="rule">Rule</TabsTrigger>
            <TabsTrigger value="incentives">Incentives</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* Information Tab */}
            <TabsContent value="information" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="rule-name">Name *</Label>
                <Input
                  id="rule-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter rule description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rule-owner-field">Owner Field *</Label>
                <Select
                  value={formData.ownerField}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ownerField: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner field" />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNER_FIELD_OPTIONS.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rule-date-field">Date Field *</Label>
                <Select
                  value={formData.dateField}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dateField: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date field" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FIELD_OPTIONS.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="goal-incentive"
                  checked={formData.goalIncentive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, goalIncentive: checked }))}
                />
                <Label htmlFor="goal-incentive">Goal Incentive</Label>
              </div>
            </TabsContent>

            {/* Rule Tab */}
            <TabsContent value="rule" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="catalog">Catalog *</Label>
                <Select
                  value={formData.catalog}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, catalog: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a catalog" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {catalogsLoading ? (
                      <div className="p-2 text-sm text-muted-foreground">Loading catalogs...</div>
                    ) : activeCatalogs.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No active catalogs found</div>
                    ) : (
                      activeCatalogs.map((catalog) => (
                        <SelectItem key={catalog.id} value={catalog.id}>
                          {catalog.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="formula">Formula *</Label>
                <Textarea
                  ref={formulaRef}
                  id="formula"
                  value={formData.formula}
                  onChange={handleFormulaChange}
                  placeholder="record.Base * 0.05"
                  rows={3}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use "record.fieldname" to reference catalog fields, e.g., record.Base * 0.05
                </p>
              </div>

              {/* Math Operators */}
              <div>
                <Label>Math Operators</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MATH_OPERATORS.map((op) => (
                    <Button
                      key={op.symbol}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertOperator(op.symbol)}
                      className="w-10 h-10"
                    >
                      {op.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fields from Catalog */}
              {formData.catalog && (
                <div>
                  <Label>Fields from Catalog</Label>
                  <div className="mt-2 border rounded-md p-2 max-h-[200px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search fields..."
                        value={fieldSearch}
                        onChange={(e) => setFieldSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {fieldsLoading ? (
                      <div className="text-sm text-muted-foreground p-2">Loading fields...</div>
                    ) : filteredFields.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-2">
                        {fieldSearch ? 'No fields match your search' : 'No fields available'}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredFields.map((field) => (
                          <Button
                            key={field}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertField(`record.${field}`)}
                            className="w-full justify-start text-left font-mono text-xs"
                          >
                            record.{field}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Incentives Tab */}
            <TabsContent value="incentives" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Incentives configuration coming soon.
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Payments configuration coming soon.
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="border rounded-md p-4 space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Rule Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name || 'N/A'}</p>
                    <p><span className="font-medium">Description:</span> {formData.description || 'N/A'}</p>
                    <p><span className="font-medium">Catalog:</span> {formData.catalog || 'N/A'}</p>
                    <p><span className="font-medium">Owner Field:</span> {formData.ownerField || 'N/A'}</p>
                    <p><span className="font-medium">Date Field:</span> {formData.dateField || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Formula</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    {formData.formula || 'No formula defined'}
                  </code>
                </div>
              </div>
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
