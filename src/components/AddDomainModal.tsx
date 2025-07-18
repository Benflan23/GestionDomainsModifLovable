
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Domain } from '@/pages/Index';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (domain: Domain | Omit<Domain, 'id'>) => void;
  domain?: Domain | null;
  registrars: string[];
  categories: string[];
}

const AddDomainModal: React.FC<AddDomainModalProps> = ({
  isOpen,
  onClose,
  onSave,
  domain,
  registrars,
  categories
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    registrar: string;
    category: string;
    purchaseDate: string;
    expirationDate: string;
    status: 'actif' | 'vendu' | 'expire' | 'en-vente';
    purchasePrice: number;
    sellingPrice: number;
    saleDate: string;
    buyer: string;
  }>({
    name: '',
    registrar: '',
    category: '',
    purchaseDate: '',
    expirationDate: '',
    status: 'actif',
    purchasePrice: 0,
    sellingPrice: 0,
    saleDate: '',
    buyer: ''
  });

  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name,
        registrar: domain.registrar,
        category: domain.category,
        purchaseDate: domain.purchaseDate,
        expirationDate: domain.expirationDate,
        status: domain.status,
        purchasePrice: domain.purchasePrice || 0,
        sellingPrice: domain.sellingPrice || 0,
        saleDate: domain.saleDate || '',
        buyer: domain.buyer || ''
      });
    } else {
      setFormData({
        name: '',
        registrar: '',
        category: '',
        purchaseDate: '',
        expirationDate: '',
        status: 'actif',
        purchasePrice: 0,
        sellingPrice: 0,
        saleDate: '',
        buyer: ''
      });
    }
  }, [domain, isOpen]);

  const calculateExpirationDate = (purchaseDate: string) => {
    if (!purchaseDate) return '';
    const date = new Date(purchaseDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handlePurchaseDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      purchaseDate: date,
      expirationDate: calculateExpirationDate(date)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain) {
      onSave({ ...formData, id: domain.id });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {domain ? 'Modifier le domaine' : 'Ajouter un domaine'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de domaine</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="exemple.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="registrar">Registrar</Label>
              <Select value={formData.registrar} onValueChange={(value) => setFormData(prev => ({ ...prev, registrar: value }))}>
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
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: 'actif' | 'vendu' | 'expire' | 'en-vente') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="vendu">Vendu</SelectItem>
                  <SelectItem value="expire">Expiré</SelectItem>
                  <SelectItem value="en-vente">En vente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purchaseDate">Date d'achat</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handlePurchaseDateChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="expirationDate">Date d'expiration</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            {formData.status === 'vendu' && (
              <>
                <div>
                  <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="saleDate">Date de vente</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="buyer">Acheteur</Label>
                  <Input
                    id="buyer"
                    value={formData.buyer}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyer: e.target.value }))}
                    placeholder="Nom de l'acheteur"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {domain ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDomainModal;
