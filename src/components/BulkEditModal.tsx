import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Domain } from '@/pages/Index';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Domain>) => void;
  selectedDomains: Domain[];
  registrars: string[];
  categories: string[];
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDomains,
  registrars,
  categories,
}) => {
  const [updates, setUpdates] = useState<{
    updateStatus: boolean;
    status: string;
    updateRegistrar: boolean;
    registrar: string;
    updateCategory: boolean;
    category: string;
  }>({
    updateStatus: false,
    status: '',
    updateRegistrar: false,
    registrar: '',
    updateCategory: false,
    category: '',
  });

  const handleSave = () => {
    const finalUpdates: Partial<Domain> = {};
    
    if (updates.updateStatus && updates.status) {
      finalUpdates.status = updates.status as Domain['status'];
    }
    if (updates.updateRegistrar && updates.registrar) {
      finalUpdates.registrar = updates.registrar;
    }
    if (updates.updateCategory && updates.category) {
      finalUpdates.category = updates.category;
    }

    onSave(finalUpdates);
    onClose();
    setUpdates({
      updateStatus: false,
      status: '',
      updateRegistrar: false,
      registrar: '',
      updateCategory: false,
      category: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Modification en lot - {selectedDomains.length} domaine{selectedDomains.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateStatus"
                checked={updates.updateStatus}
                onCheckedChange={(checked) => 
                  setUpdates(prev => ({ ...prev, updateStatus: checked as boolean }))
                }
              />
              <Label htmlFor="updateStatus">Modifier le statut</Label>
            </div>
            {updates.updateStatus && (
              <Select value={updates.status} onValueChange={(value) => setUpdates(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="vendu">Vendu</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                  <SelectItem value="en-vente">En vente</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateRegistrar"
                checked={updates.updateRegistrar}
                onCheckedChange={(checked) => 
                  setUpdates(prev => ({ ...prev, updateRegistrar: checked as boolean }))
                }
              />
              <Label htmlFor="updateRegistrar">Modifier le registrar</Label>
            </div>
            {updates.updateRegistrar && (
              <Select value={updates.registrar} onValueChange={(value) => setUpdates(prev => ({ ...prev, registrar: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un registrar" />
                </SelectTrigger>
                <SelectContent>
                  {registrars.map((registrar) => (
                    <SelectItem key={registrar} value={registrar}>
                      {registrar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="updateCategory"
                checked={updates.updateCategory}
                onCheckedChange={(checked) => 
                  setUpdates(prev => ({ ...prev, updateCategory: checked as boolean }))
                }
              />
              <Label htmlFor="updateCategory">Modifier la catégorie</Label>
            </div>
            {updates.updateCategory && (
              <Select value={updates.category} onValueChange={(value) => setUpdates(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Appliquer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEditModal;