import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AssignmentType, ROLES_LIST } from "@/data/commissionPlans";
import { useToast } from "@/hooks/use-toast";

interface CreateCommissionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCommissionPlanDialog({ open, onOpenChange }: CreateCommissionPlanDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    assignmentType: 'all_users' as AssignmentType,
    assignmentValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save the commission plan
    console.log('Creating commission plan:', formData);
    
    toast({
      title: "Success",
      description: "Commission plan created successfully."
    });
    
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      startDate: undefined,
      endDate: undefined,
      assignmentType: 'all_users',
      assignmentValue: ''
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      startDate: undefined,
      endDate: undefined,
      assignmentType: 'all_users',
      assignmentValue: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Commission Plan</DialogTitle>
          <DialogDescription>
            Create a new commission plan with rules and assignments.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter plan name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter plan description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                      disabled={(date) => formData.startDate ? date < formData.startDate : false}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Assignee *</Label>
              <RadioGroup
                value={formData.assignmentType}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  assignmentType: value as AssignmentType,
                  assignmentValue: '' 
                }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_users" id="all_users" />
                  <Label htmlFor="all_users">All Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="role" id="role" />
                  <Label htmlFor="role">Role</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team" id="team" />
                  <Label htmlFor="team">Team</Label>
                </div>
              </RadioGroup>

              {formData.assignmentType === 'role' && (
                <div className="mt-3">
                  <Select
                    value={formData.assignmentValue}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignmentValue: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md max-h-[200px] overflow-y-auto">
                      {ROLES_LIST.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.assignmentType === 'user' || formData.assignmentType === 'team') && (
                <div className="mt-3">
                  <Input
                    value={formData.assignmentValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignmentValue: e.target.value }))}
                    placeholder={`Enter ${formData.assignmentType} name`}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}