import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Filter } from 'lucide-react';

export interface DomainFiltersState {
  search: string;
  status: string;
  registrar: string;
  category: string;
  expirationDateFrom: string;
  expirationDateTo: string;
  purchaseDateFrom: string;
  purchaseDateTo: string;
}

interface DomainFiltersProps {
  filters: DomainFiltersState;
  onFiltersChange: (filters: DomainFiltersState) => void;
  availableRegistrars: string[];
  availableCategories: string[];
  availableStatuses: string[];
  onClearFilters: () => void;
}

const DomainFilters: React.FC<DomainFiltersProps> = ({
  filters,
  onFiltersChange,
  availableRegistrars,
  availableCategories,
  availableStatuses,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const updateFilter = (key: keyof DomainFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtres</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer les filtres
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              placeholder="Nom de domaine..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="registrar">Registrar</Label>
            <Select value={filters.registrar} onValueChange={(value) => updateFilter('registrar', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les registrars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les registrars</SelectItem>
                {availableRegistrars.map((registrar) => (
                  <SelectItem key={registrar} value={registrar}>
                    {registrar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expirationDateFrom">Expiration - De</Label>
            <Input
              id="expirationDateFrom"
              type="date"
              value={filters.expirationDateFrom}
              onChange={(e) => updateFilter('expirationDateFrom', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expirationDateTo">Expiration - À</Label>
            <Input
              id="expirationDateTo"
              type="date"
              value={filters.expirationDateTo}
              onChange={(e) => updateFilter('expirationDateTo', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="purchaseDateFrom">Achat - De</Label>
            <Input
              id="purchaseDateFrom"
              type="date"
              value={filters.purchaseDateFrom}
              onChange={(e) => updateFilter('purchaseDateFrom', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="purchaseDateTo">Achat - À</Label>
            <Input
              id="purchaseDateTo"
              type="date"
              value={filters.purchaseDateTo}
              onChange={(e) => updateFilter('purchaseDateTo', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainFilters;