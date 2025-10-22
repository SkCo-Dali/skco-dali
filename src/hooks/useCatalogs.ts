import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  Catalog,
  CatalogField,
  CreateCatalogRequest,
  UpdateCatalogRequest,
  CreateCatalogFieldRequest,
  UpdateCatalogFieldRequest,
} from '@/types/catalogsApi';
import * as catalogsApi from '@/utils/catalogsApiClient';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await catalogsApi.listCatalogs({
        page: 1,
        page_size: 100,
        order_by: 'name',
        order_dir: 'asc',
      });
      setCatalogs(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading catalogs';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const createCatalog = async (data: CreateCatalogRequest): Promise<Catalog | null> => {
    try {
      const newCatalog = await catalogsApi.createCatalog(data);
      setCatalogs((prev) => [...prev, newCatalog]);
      toast({
        title: 'Éxito',
        description: 'Catálogo creado exitosamente',
      });
      return newCatalog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating catalog';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCatalog = async (
    catalogId: string,
    data: UpdateCatalogRequest
  ): Promise<boolean> => {
    try {
      const updatedCatalog = await catalogsApi.updateCatalog(catalogId, data);
      setCatalogs((prev) =>
        prev.map((cat) => (cat.id === catalogId ? updatedCatalog : cat))
      );
      toast({
        title: 'Éxito',
        description: 'Catálogo actualizado exitosamente',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating catalog';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteCatalog = async (catalogId: string): Promise<boolean> => {
    try {
      await catalogsApi.deleteCatalog(catalogId);
      setCatalogs((prev) => prev.filter((cat) => cat.id !== catalogId));
      toast({
        title: 'Éxito',
        description: 'Catálogo eliminado exitosamente',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting catalog';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleCatalogStatus = async (catalogId: string, activate: boolean): Promise<boolean> => {
    try {
      const updatedCatalog = activate
        ? await catalogsApi.activateCatalog(catalogId)
        : await catalogsApi.deactivateCatalog(catalogId);
      
      setCatalogs((prev) =>
        prev.map((cat) => (cat.id === catalogId ? updatedCatalog : cat))
      );
      toast({
        title: 'Éxito',
        description: `Catálogo ${activate ? 'activado' : 'desactivado'} exitosamente`,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating catalog status';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    catalogs,
    loading,
    error,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    toggleCatalogStatus,
    refreshCatalogs: loadCatalogs,
  };
}

export function useCatalogFields(catalogId: string) {
  const [fields, setFields] = useState<CatalogField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFields = async () => {
    if (!catalogId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await catalogsApi.listCatalogFields(catalogId, {
        page: 1,
        page_size: 100,
        order_by: 'field_name',
        order_dir: 'asc',
      });
      setFields(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading fields';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, [catalogId]);

  const createField = async (data: CreateCatalogFieldRequest): Promise<CatalogField | null> => {
    try {
      const newField = await catalogsApi.createCatalogField(catalogId, data);
      setFields((prev) => [...prev, newField]);
      toast({
        title: 'Éxito',
        description: 'Campo creado exitosamente',
      });
      return newField;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating field';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateField = async (
    fieldId: string,
    data: UpdateCatalogFieldRequest
  ): Promise<boolean> => {
    try {
      const updatedField = await catalogsApi.updateCatalogField(catalogId, fieldId, data);
      setFields((prev) =>
        prev.map((field) => (field.id === fieldId ? updatedField : field))
      );
      toast({
        title: 'Éxito',
        description: 'Campo actualizado exitosamente',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating field';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteField = async (fieldId: string): Promise<boolean> => {
    try {
      await catalogsApi.deleteCatalogField(catalogId, fieldId);
      setFields((prev) => prev.filter((field) => field.id !== fieldId));
      toast({
        title: 'Éxito',
        description: 'Campo eliminado exitosamente',
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting field';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    fields,
    loading,
    error,
    createField,
    updateField,
    deleteField,
    refreshFields: loadFields,
  };
}
