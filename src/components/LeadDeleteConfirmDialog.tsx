
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Lead } from "@/types/crm";

interface LeadDeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leads: Lead[];
  isDeleting: boolean;
}

export function LeadDeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  leads, 
  isDeleting 
}: LeadDeleteConfirmDialogProps) {
  const leadCount = leads.length;
  const isMultiple = leadCount > 1;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isMultiple ? '¿Eliminar leads?' : '¿Eliminar lead?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isMultiple ? (
              <>
                Esta acción eliminará permanentemente {leadCount} leads seleccionados:
                <ul className="mt-2 mb-2 list-disc list-inside max-h-32 overflow-y-auto">
                  {leads.slice(0, 5).map((lead) => (
                    <li key={lead.id} className="text-sm">
                      {lead.name} ({lead.email})
                    </li>
                  ))}
                  {leads.length > 5 && (
                    <li className="text-sm text-gray-500">
                      ... y {leads.length - 5} más
                    </li>
                  )}
                </ul>
                Esta acción no se puede deshacer.
              </>
            ) : (
              <>
                Esta acción eliminará permanentemente el lead:{' '}
                <strong>{leads[0]?.name}</strong> ({leads[0]?.email}).
                <br />
                <br />
                Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : (isMultiple ? 'Eliminar leads' : 'Eliminar lead')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
