import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATALOG_OPTIONS = [
  'Pólizas',
  'Productos',
  'Agentes',
  'Canales',
  'Comisiones',
  'Ventas'
];

export function CreateRuleDialog({ open, onOpenChange }: CreateRuleDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formula: '',
    conditions: '',
    catalog: '',
    owner: '',
    dataField: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.formula || !formData.conditions || !formData.catalog) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save the rule
    console.log('Creating rule:', formData);
    
    toast({
      title: "Success",
      description: "Commission rule created successfully."
    });
    
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      formula: '',
      conditions: '',
      catalog: '',
      owner: '',
      dataField: ''
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      formula: '',
      conditions: '',
      catalog: '',
      owner: '',
      dataField: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Commission Rule</DialogTitle>
          <DialogDescription>
            Define a new rule for the commission plan with its formula and conditions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="rule-formula">Formula *</Label>
              <Textarea
                id="rule-formula"
                value={formData.formula}
                onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                placeholder="e.g., 2 / 100 * record.ValorBase"
                rows={3}
                required
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="rule-conditions">Conditions *</Label>
              <Textarea
                id="rule-conditions"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder="e.g., Producto equal OMPEV and Canal equal Intermediario"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="rule-catalog">Catalog *</Label>
              <Select
                value={formData.catalog}
                onValueChange={(value) => setFormData(prev => ({ ...prev, catalog: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a catalog" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-md">
                  {CATALOG_OPTIONS.map((catalog) => (
                    <SelectItem key={catalog} value={catalog}>
                      {catalog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-owner">Owner</Label>
                <Input
                  id="rule-owner"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="Rule owner"
                />
              </div>

              <div>
                <Label htmlFor="rule-datafield">Data Field</Label>
                <Input
                  id="rule-datafield"
                  value={formData.dataField}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataField: e.target.value }))}
                  placeholder="Data field reference"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}