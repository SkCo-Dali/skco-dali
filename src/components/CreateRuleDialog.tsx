import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, X, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCatalogs, useCatalogFields } from "@/hooks/useCatalogs";
import { listCatalogFieldValues } from "@/utils/catalogsApiClient";
import { CatalogFieldValue } from "@/types/catalogsApi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecureTokenManager } from "@/utils/secureTokenManager";
import { ENV } from "@/config/environment";

interface CreateRuleDialogProps {
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRuleCreated?: () => void;
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

const INCENTIVE_STATUS_OPTIONS = [
  'Due',
  'Paid',
  'Pending',
  'Cancelled'
];

const PAYMENT_SCHEDULE_OPTIONS = [
  'Monthly',
  'Quarterly',
  'Annual',
  'Weekly'
];

const NUMERIC_CONDITION_OPTIONS = [
  'Equal',
  'Not Equal',
  'Greater Than',
  'Greater Than Or Equal',
  'Less Than',
  'Less Than Or Equal'
];

const STRING_CONDITION_OPTIONS = [
  'Equal',
  'Not Equal',
  'Contains',
  'Not Contains',
  'Begins With',
  'Ends With',
  'Is One Of'
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

interface ConditionRow {
  id: string;
  field: string;
  fieldId?: string;
  fieldType?: string;
  condition: string;
  value: string;
}

export function CreateRuleDialog({ planId, open, onOpenChange, onRuleCreated }: CreateRuleDialogProps) {
  const { toast } = useToast();
  const formulaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch catalogs
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  
  const [formData, setFormData] = useState({
    // Information tab
    name: '',
    description: '',
    ownerField: '',
    dateField: '',
    goalIncentive: false,
    
    // Rule tab
    catalog: '',
    formula: '',
    conditions: [] as ConditionRow[],
    
    // Incentives tab
    incentiveStatus: '',
    applyCommissionsGenerated: false,
    
    // Payments tab
    paymentSchedule: '',
    paymentPeriodBasedOn: ''
  });

  const [activeTab, setActiveTab] = useState('information');
  const [fieldSearch, setFieldSearch] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, CatalogFieldValue[]>>({});
  const [loadingFieldValues, setLoadingFieldValues] = useState<Record<string, boolean>>({});
  const [openValuePopovers, setOpenValuePopovers] = useState<Record<string, boolean>>({});

  // Fetch catalog fields when catalog is selected
  const { fields: catalogFields, loading: fieldsLoading } = useCatalogFields(formData.catalog || '');
  
  // Filter active catalogs
  const activeCatalogs = catalogs.filter(c => c.is_active);

  const addCondition = () => {
    const newCondition: ConditionRow = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      condition: '',
      value: ''
    };
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const removeCondition = (id: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }));
  };

  const updateCondition = (id: string, field: keyof ConditionRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map(c => {
        if (c.id !== id) return c;
        
        // If updating the field, also update the fieldType and fieldId
        if (field === 'field') {
          const selectedField = catalogFields.find(f => f.display_name === value);
          if (selectedField && formData.catalog) {
            // Load field values
            loadFieldValues(formData.catalog, selectedField.id);
          }
          return { 
            ...c, 
            field: value,
            fieldId: selectedField?.id,
            fieldType: selectedField?.field_type,
            value: '', // Reset value when field changes
            condition: '' // Reset condition when field changes
          };
        }
        
        return { ...c, [field]: value };
      })
    }));
  };

  // Load field values from API
  const loadFieldValues = async (catalogId: string, fieldId: string) => {
    const key = `${catalogId}-${fieldId}`;
    
    // Skip if already loading or already loaded
    if (loadingFieldValues[key] || fieldValues[key]) return;
    
    setLoadingFieldValues(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await listCatalogFieldValues(catalogId, fieldId, {
        is_active: true,
        page: 1,
        page_size: 100,
        order_by: 'sort_index',
        order_dir: 'asc'
      });
      
      setFieldValues(prev => ({ ...prev, [key]: response.items }));
    } catch (error) {
      console.error('Error loading field values:', error);
      toast({
        title: "Error",
        description: "Failed to load field values",
        variant: "destructive"
      });
    } finally {
      setLoadingFieldValues(prev => ({ ...prev, [key]: false }));
    }
  };

  // Helper function to get condition options based on field type
  const getConditionOptions = (fieldType?: string) => {
    if (!fieldType) return [];
    
    const normalizedType = fieldType.toLowerCase();
    
    // Check if it's a numeric or date type
    if (['numeric', 'int', 'integer', 'decimal', 'money', 'date', 'datetime'].includes(normalizedType)) {
      return NUMERIC_CONDITION_OPTIONS;
    }
    
    // Check if it's a string type
    if (['nvarchar', 'varchar', 'string'].includes(normalizedType)) {
      return STRING_CONDITION_OPTIONS;
    }
    
    // Default to string options for unknown types
    return STRING_CONDITION_OPTIONS;
  };

  const insertField = (field: string) => {
    const textarea = formulaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const currentFormula = formData.formula;
    
    // Insert field at cursor position
    const newFormula = currentFormula.substring(0, start) + field + currentFormula.substring(end);
    
    setFormData(prev => ({
      ...prev,
      formula: newFormula
    }));

    // Restore focus and set cursor position after the inserted field
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
    
    // Insert operator at cursor position
    const newFormula = currentFormula.substring(0, start) + operator + currentFormula.substring(end);
    
    setFormData(prev => ({
      ...prev,
      formula: newFormula
    }));

    // Restore focus and set cursor position after the inserted operator
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
    // Only allow numbers, spaces, operators, dots, and the word "record" (for field references)
    // Valid pattern: numbers, spaces, operators (% * / + - ( )), dots, and "record" word only
    const validChars = /^[0-9\s%*/()+.\-]*$|^[0-9\s%*/()+.\-recod]*$/;
    
    // More strict validation: check if any alphabetic characters exist
    // If they do, they should only be part of "record." pattern
    const hasLetters = /[a-zA-Z]/.test(value);
    
    if (hasLetters) {
      // If there are letters, validate they're only in "record.fieldname" format
      const validPattern = /^[0-9\s%*/()+.\-]*(record\.[a-zA-Z_][a-zA-Z0-9_]*[0-9\s%*/()+.\-]*)*$/;
      if (validPattern.test(value)) {
        setFormData(prev => ({ ...prev, formula: value }));
      }
    } else {
      // No letters, just validate basic characters
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
    
    if (!formData.name || !formData.formula || !formData.catalog) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Formula, Catalog)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tokenData = SecureTokenManager.getToken();
      const token = tokenData?.token || '';
      
      const response = await fetch(
        `${ENV.CRM_API_BASE_URL}/api/commission-plans/${planId}/rules`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            formula: formData.formula,
            catalog: formData.catalog,
            date_field: formData.dateField,
            owner_name: formData.ownerField,
            is_active: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Failed to create rule: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Rule "${formData.name}" has been created successfully.`
      });
      
      handleCancel();
      onRuleCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create rule';
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
    // Reset form
    setFormData({
      name: '',
      description: '',
      ownerField: '',
      dateField: '',
      goalIncentive: false,
      catalog: '',
      formula: '',
      conditions: [],
      incentiveStatus: '',
      applyCommissionsGenerated: false,
      paymentSchedule: '',
      paymentPeriodBasedOn: ''
    });
    setActiveTab('information');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Commission Rule</DialogTitle>
          <DialogDescription>
            Define a new rule for the commission plan with its formula and conditions.
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
                  placeholder="AIS_FRONT1_OMPEV_MASTER"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="No se difiere la comisión esta se paga el 100% con la prima 1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rule-owner-field">
                  Owner Field * 
                  <span className="ml-1 text-xs text-muted-foreground cursor-help">ⓘ</span>
                </Label>
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
                <Label htmlFor="rule-date-field">
                  Date Field * 
                  <span className="ml-1 text-xs text-muted-foreground cursor-help">ⓘ</span>
                </Label>
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
                <Label htmlFor="rule-catalog">
                  Catalog * 
                  <span className="ml-1 text-xs text-muted-foreground cursor-help">ⓘ</span>
                </Label>
                <Select
                  value={formData.catalog}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, catalog: value }))}
                  disabled={catalogsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={catalogsLoading ? "Loading catalogs..." : "Select a catalog"} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCatalogs.map((catalog) => (
                      <SelectItem key={catalog.id} value={catalog.id}>
                        {catalog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Formula Section */}
                <div>
                  <Label htmlFor="rule-formula">Formula</Label>
                  <Textarea
                    ref={formulaRef}
                    id="rule-formula"
                    value={formData.formula}
                    onChange={handleFormulaChange}
                    placeholder="1.30 / 100 * record.ValorBase * 25 / 100"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-1 mt-2">
                    {MATH_OPERATORS.map((op) => (
                      <Button
                        key={op.symbol}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertOperator(op.symbol)}
                        className="px-3 py-1 h-8 text-sm"
                      >
                        {op.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Click to insert fields */}
                <div>
                  <Label>Click to insert fields</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type to search"
                        value={fieldSearch}
                        onChange={(e) => setFieldSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                      {fieldsLoading ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Loading fields...
                        </div>
                      ) : !formData.catalog ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Select a catalog to view fields
                        </div>
                      ) : filteredFields.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No fields found
                        </div>
                      ) : (
                        <TooltipProvider>
                          {catalogFields
                            .filter(field => field.field_name.toLowerCase().includes(fieldSearch.toLowerCase()))
                            .map((field) => (
                              <Tooltip key={field.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => insertField(`record.${field.field_name}`)}
                                    className="w-full text-left px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded border border-primary/20 transition-colors"
                                  >
                                    {field.display_name || field.field_name}
                                  </button>
                                </TooltipTrigger>
                                {field.description && (
                                  <TooltipContent 
                                    side="left" 
                                    align="start"
                                    className="max-w-xs z-[100]"
                                    sideOffset={5}
                                  >
                                    <p className="text-xs">{field.description}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            ))}
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditions Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <Label>Conditions</Label>
                  <Button type="button" onClick={addCondition} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => (
                    <div key={condition.id} className="grid grid-cols-12 gap-2 items-center">
                      {index > 0 && (
                        <div className="col-span-1 text-center text-sm text-muted-foreground">
                          and
                        </div>
                      )}
                      {index === 0 && (
                        <div className="col-span-1 text-center text-sm text-muted-foreground">
                          If
                        </div>
                      )}
                      
                      <div className="col-span-4">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(condition.id, 'field', value)}
                          disabled={fieldsLoading || !formData.catalog}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={!formData.catalog ? "Select catalog first" : "Field"} />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogFields.map((field) => (
                              <SelectItem 
                                key={field.id} 
                                value={field.display_name}
                                title={field.description || undefined}
                              >
                                {field.display_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Select
                          value={condition.condition}
                          onValueChange={(value) => updateCondition(condition.id, 'condition', value)}
                          disabled={!condition.field}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {getConditionOptions(condition.fieldType).map((cond) => (
                              <SelectItem key={cond} value={cond}>
                                {cond}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Popover 
                          open={openValuePopovers[condition.id]} 
                          onOpenChange={(open) => setOpenValuePopovers(prev => ({ ...prev, [condition.id]: open }))}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !condition.value && "text-muted-foreground"
                              )}
                            >
                              {condition.value || "Value"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput 
                                placeholder="Search or type value..." 
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const inputValue = (e.target as HTMLInputElement).value;
                                    if (inputValue) {
                                      updateCondition(condition.id, 'value', inputValue);
                                      setOpenValuePopovers(prev => ({ ...prev, [condition.id]: false }));
                                    }
                                  }
                                }}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {loadingFieldValues[`${formData.catalog}-${condition.fieldId}`] 
                                    ? "Loading values..." 
                                    : "Type a value and press Enter"}
                                </CommandEmpty>
                                {condition.fieldId && formData.catalog && (
                                  <CommandGroup>
                                    {(fieldValues[`${formData.catalog}-${condition.fieldId}`] || []).map((fieldValue) => (
                                      <CommandItem
                                        key={fieldValue.id}
                                        value={fieldValue.value}
                                        onSelect={(value) => {
                                          updateCondition(condition.id, 'value', value);
                                          setOpenValuePopovers(prev => ({ ...prev, [condition.id]: false }));
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            condition.value === fieldValue.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span>{fieldValue.label}</span>
                                          {fieldValue.description && (
                                            <span className="text-xs text-muted-foreground">{fieldValue.description}</span>
                                          )}
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          onClick={() => removeCondition(condition.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData.conditions.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground border border-dashed rounded">
                      No conditions added yet. Click the + button to add conditions.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Incentives Tab */}
            <TabsContent value="incentives" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="incentive-status">
                  Incentive Status * 
                  <span className="ml-1 text-xs text-muted-foreground cursor-help">ⓘ</span>
                </Label>
                <Select
                  value={formData.incentiveStatus}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, incentiveStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incentive status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCENTIVE_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="apply-commissions"
                  checked={formData.applyCommissionsGenerated}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, applyCommissionsGenerated: checked as boolean }))}
                />
                <div>
                  <Label htmlFor="apply-commissions">Apply commissions already generated (n...</Label>
                  <div className="mt-2">
                    <Button type="button" variant="outline" size="sm" className="text-xs">
                      Apply commissions already generated (negative operations)
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="payment-schedule">
                  Payment Schedule * 
                  <span className="ml-1 text-xs text-muted-foreground cursor-help">ⓘ</span>
                </Label>
                <Select
                  value={formData.paymentSchedule}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentSchedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_SCHEDULE_OPTIONS.map((schedule) => (
                      <SelectItem key={schedule} value={schedule}>
                        {schedule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-1">
                  The incentive will be grouped in this Payment Schedule.
                </div>
              </div>

              <div>
                <Label htmlFor="payment-period">Payment period based on *</Label>
                <Select
                  value={formData.paymentPeriodBasedOn}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentPeriodBasedOn: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment period" />
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
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  The following top 10 commissions displayed are just a sneak peek of the total your Rule might generate.
                </p>
                <p className="font-medium">Preview not available.</p>
              </div>
            </TabsContent>

            <DialogFooter className="gap-2 mt-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}