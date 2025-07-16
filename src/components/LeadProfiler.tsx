
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Eye } from 'lucide-react';
import { LeadProfile, ProfileCriteria, LeadProfilerProps, ProfileFormData } from '@/types/leadProfiler';

const FIELD_OPTIONS = [
  { value: 'status', label: 'Estado' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'source', label: 'Fuente' },
  { value: 'campaign', label: 'Campaña' },
  { value: 'portfolio', label: 'Portafolio' },
  { value: 'product', label: 'Producto' },
  { value: 'score', label: 'Puntuación' },
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'updatedAt', label: 'Última actualización' }
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'greater_than', label: 'Mayor que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'between', label: 'Entre' },
  { value: 'in', label: 'En lista' },
  { value: 'not_in', label: 'No en lista' }
];

export const LeadProfiler: React.FC<LeadProfilerProps> = ({
  onProfileCreate,
  onProfileUpdate,
  onProfileDelete,
  existingProfiles = []
}) => {
  const [profiles, setProfiles] = useState<LeadProfile[]>(existingProfiles);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<LeadProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    description: '',
    criteria: []
  });

  const handleCreateProfile = () => {
    const newProfile: LeadProfile = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      criteria: formData.criteria,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfiles([...profiles, newProfile]);
    onProfileCreate?.(newProfile);
    resetForm();
    setIsCreateDialogOpen(false);
  };

  const handleUpdateProfile = () => {
    if (!selectedProfile) return;

    const updatedProfile: LeadProfile = {
      ...selectedProfile,
      name: formData.name,
      description: formData.description,
      criteria: formData.criteria,
      updatedAt: new Date().toISOString()
    };

    setProfiles(profiles.map(p => p.id === selectedProfile.id ? updatedProfile : p));
    onProfileUpdate?.(updatedProfile);
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedProfile(null);
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles(profiles.filter(p => p.id !== profileId));
    onProfileDelete?.(profileId);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      criteria: []
    });
  };

  const addCriteria = () => {
    const newCriteria: ProfileCriteria = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      label: ''
    };
    setFormData({
      ...formData,
      criteria: [...formData.criteria, newCriteria]
    });
  };

  const updateCriteria = (index: number, field: keyof ProfileCriteria, value: any) => {
    const updatedCriteria = [...formData.criteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setFormData({ ...formData, criteria: updatedCriteria });
  };

  const removeCriteria = (index: number) => {
    setFormData({
      ...formData,
      criteria: formData.criteria.filter((_, i) => i !== index)
    });
  };

  const openEditDialog = (profile: LeadProfile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description,
      criteria: profile.criteria
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (profile: LeadProfile) => {
    setSelectedProfile(profile);
    setIsViewDialogOpen(true);
  };

  const renderCriteriaForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Criterios de perfilado</Label>
        <Button type="button" variant="outline" size="sm" onClick={addCriteria}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar criterio
        </Button>
      </div>
      
      {formData.criteria.map((criteria, index) => (
        <Card key={criteria.id} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`field-${index}`}>Campo</Label>
              <Select
                value={criteria.field}
                onValueChange={(value) => updateCriteria(index, 'field', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campo" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`operator-${index}`}>Operador</Label>
              <Select
                value={criteria.operator}
                onValueChange={(value) => updateCriteria(index, 'operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operador" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATOR_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`value-${index}`}>Valor</Label>
              <Input
                id={`value-${index}`}
                value={criteria.value as string}
                onChange={(e) => updateCriteria(index, 'value', e.target.value)}
                placeholder="Valor del criterio"
              />
            </div>
            
            <div>
              <Label htmlFor={`label-${index}`}>Etiqueta</Label>
              <Input
                id={`label-${index}`}
                value={criteria.label}
                onChange={(e) => updateCriteria(index, 'label', e.target.value)}
                placeholder="Etiqueta descriptiva"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeCriteria(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Perfilador de Leads</h2>
          <p className="text-muted-foreground">
            Crea y gestiona perfiles para categorizar y filtrar leads automáticamente
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Crear nuevo perfil de lead</DialogTitle>
              <DialogDescription>
                Define los criterios para categorizar automáticamente los leads
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del perfil</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Leads de alta prioridad"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el propósito de este perfil..."
                />
              </div>
              
              {renderCriteriaForm()}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProfile} disabled={!formData.name.trim()}>
                Crear perfil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{profile.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openViewDialog(profile)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{profile.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {profile.criteria.length} criterio(s) definido(s)
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.criteria.slice(0, 3).map((criteria) => (
                    <Badge key={criteria.id} variant="secondary" className="text-xs">
                      {criteria.label || `${criteria.field} ${criteria.operator}`}
                    </Badge>
                  ))}
                  {profile.criteria.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.criteria.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar perfil de lead</DialogTitle>
            <DialogDescription>
              Modifica los criterios del perfil seleccionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre del perfil</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Leads de alta prioridad"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el propósito de este perfil..."
              />
            </div>
            
            {renderCriteriaForm()}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile} disabled={!formData.name.trim()}>
              Actualizar perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProfile?.name}</DialogTitle>
            <DialogDescription>{selectedProfile?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Criterios definidos:</h4>
              {selectedProfile?.criteria.map((criteria) => (
                <div key={criteria.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Badge variant="outline">{criteria.field}</Badge>
                  <span className="text-sm">{criteria.operator}</span>
                  <Badge>{criteria.value as string}</Badge>
                  {criteria.label && (
                    <span className="text-sm text-muted-foreground">({criteria.label})</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Creado: {new Date(selectedProfile?.createdAt || '').toLocaleDateString()}</p>
              <p>Actualizado: {new Date(selectedProfile?.updatedAt || '').toLocaleDateString()}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
