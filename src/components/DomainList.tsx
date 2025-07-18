import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Domain } from '@/pages/Index';
import { Edit, Trash2, Plus } from 'lucide-react';
import DomainFilters, { DomainFiltersState } from './DomainFilters';
import DomainTableHeader, { SortConfig } from './DomainTableHeader';
import BulkActions from './BulkActions';
import BulkEditModal from './BulkEditModal';

interface DomainListProps {
  domains: Domain[];
  onEdit: (domain: Domain) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkUpdate: (ids: string[], updates: Partial<Domain>) => void;
  onAdd: () => void;
  registrars: string[];
  categories: string[];
}

const DomainList: React.FC<DomainListProps> = ({ 
  domains, 
  onEdit, 
  onDelete, 
  onBulkDelete,
  onBulkUpdate,
  onAdd,
  registrars,
  categories 
}) => {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [filters, setFilters] = useState<DomainFiltersState>({
    search: '',
    status: '',
    registrar: '',
    category: '',
    expirationDateFrom: '',
    expirationDateTo: '',
    purchaseDateFrom: '',
    purchaseDateTo: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);

  const availableStatuses = ['actif', 'vendu', 'expire', 'en-vente'];
  const availableRegistrars = [...new Set(domains.map(d => d.registrar))];
  const availableCategories = [...new Set(domains.map(d => d.category))];

  const filteredAndSortedDomains = useMemo(() => {
    let filtered = domains.filter(domain => {
      if (filters.search && !domain.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && domain.status !== filters.status) {
        return false;
      }
      if (filters.registrar && domain.registrar !== filters.registrar) {
        return false;
      }
      if (filters.category && domain.category !== filters.category) {
        return false;
      }
      if (filters.expirationDateFrom && domain.expirationDate < filters.expirationDateFrom) {
        return false;
      }
      if (filters.expirationDateTo && domain.expirationDate > filters.expirationDateTo) {
        return false;
      }
      if (filters.purchaseDateFrom && domain.purchaseDate < filters.purchaseDateFrom) {
        return false;
      }
      if (filters.purchaseDateTo && domain.purchaseDate > filters.purchaseDateTo) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (sortConfig.length > 0) {
      filtered.sort((a, b) => {
        for (const { key, direction } of sortConfig) {
          let aValue = a[key as keyof Domain];
          let bValue = b[key as keyof Domain];
          
          if (aValue === undefined) aValue = '';
          if (bValue === undefined) bValue = '';
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [domains, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(item => item.key === key);
      
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const newConfig = [...prev];
        
        if (existing.direction === 'asc') {
          newConfig[existingIndex] = { key, direction: 'desc' };
        } else {
          newConfig.splice(existingIndex, 1);
        }
        
        return newConfig;
      } else {
        return [...prev, { key, direction: 'asc' }];
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      registrar: '',
      category: '',
      expirationDateFrom: '',
      expirationDateTo: '',
      purchaseDateFrom: '',
      purchaseDateTo: '',
    });
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    const newSelected = new Set(selectedDomains);
    if (checked) {
      newSelected.add(domainId);
    } else {
      newSelected.delete(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedDomains(new Set(filteredAndSortedDomains.map(d => d.id)));
  };

  const handleDeselectAll = () => {
    setSelectedDomains(new Set());
  };

  const handleBulkEdit = () => {
    setIsBulkEditOpen(true);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedDomains.size} domaine(s) ?`)) {
      onBulkDelete(Array.from(selectedDomains));
      setSelectedDomains(new Set());
    }
  };

  const handleBulkEditSave = (updates: Partial<Domain>) => {
    onBulkUpdate(Array.from(selectedDomains), updates);
    setSelectedDomains(new Set());
  };

  const handleBulkExport = () => {
    const selectedDomainsData = filteredAndSortedDomains.filter(d => selectedDomains.has(d.id));
    const csvContent = [
      ['Nom', 'Registrar', 'Catégorie', 'Date d\'achat', 'Date d\'expiration', 'Statut', 'Prix d\'achat'].join(','),
      ...selectedDomainsData.map(domain => [
        domain.name,
        domain.registrar,
        domain.category,
        domain.purchaseDate,
        domain.expirationDate,
        domain.status,
        domain.purchasePrice || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `domains-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'vendu': return 'bg-blue-100 text-blue-800';
      case 'expire': return 'bg-red-100 text-red-800';
      case 'en-vente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price?: number) => {
    return price ? `${price.toFixed(2)}€` : '-';
  };

  const selectedDomainsData = filteredAndSortedDomains.filter(d => selectedDomains.has(d.id));

  return (
    <div className="space-y-4">
      <DomainFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableRegistrars={availableRegistrars}
        availableCategories={availableCategories}
        availableStatuses={availableStatuses}
        onClearFilters={clearFilters}
      />

      <BulkActions
        selectedCount={selectedDomains.size}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        totalCount={filteredAndSortedDomains.length}
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl break-words">
            Liste des Domaines ({filteredAndSortedDomains.length})
          </CardTitle>
          <Button onClick={onAdd} className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Ajouter un domaine</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {/* Vue mobile - Cards */}
          <div className="block sm:hidden space-y-4">
            {filteredAndSortedDomains.map((domain) => (
              <Card key={`mobile-${domain.id}`} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedDomains.has(domain.id)}
                        onCheckedChange={(checked) => handleSelectDomain(domain.id, checked as boolean)}
                      />
                      <h3 className="font-mono text-sm font-semibold break-all flex-1 min-w-0">{domain.name}</h3>
                    </div>
                    <Badge className={`${getStatusColor(domain.status)} text-xs flex-shrink-0 whitespace-nowrap`}>
                      {domain.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="break-words">Registrar: {domain.registrar}</div>
                    <div className="break-words">Catégorie: {domain.category}</div>
                    <div className="break-words">Achat: {formatDate(domain.purchaseDate)}</div>
                    <div className="break-words">Expiration: {formatDate(domain.expirationDate)}</div>
                    <div className="break-words">Prix: {formatPrice(domain.purchasePrice)}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(domain)}
                      className="flex-1 min-w-0"
                    >
                      <Edit className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Modifier</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(domain.id)}
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Vue desktop - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-full">
              <DomainTableHeader
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedCount={selectedDomains.size}
                totalCount={filteredAndSortedDomains.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
              />
              <tbody>
                {filteredAndSortedDomains.map((domain) => (
                  <tr key={domain.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedDomains.has(domain.id)}
                        onCheckedChange={(checked) => handleSelectDomain(domain.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4 font-mono text-sm break-all max-w-0 min-w-[150px]">{domain.name}</td>
                    <td className="p-4 break-words max-w-0 min-w-[100px]">{domain.registrar}</td>
                    <td className="p-4 break-words max-w-0 min-w-[100px]">{domain.category}</td>
                    <td className="p-4 whitespace-nowrap">{formatDate(domain.purchaseDate)}</td>
                    <td className="p-4 whitespace-nowrap">{formatDate(domain.expirationDate)}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(domain.status)} whitespace-nowrap`}>
                        {domain.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-semibold">{formatPrice(domain.purchasePrice)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(domain)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(domain.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAndSortedDomains.length === 0 && (
            <div className="text-center py-8 text-gray-500 break-words">
              {domains.length === 0 
                ? 'Aucun domaine enregistré. Cliquez sur "Ajouter un domaine" pour commencer.'
                : 'Aucun domaine ne correspond aux critères de recherche.'}
            </div>
          )}
        </CardContent>
      </Card>

      <BulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        onSave={handleBulkEditSave}
        selectedDomains={selectedDomainsData}
        registrars={registrars}
        categories={categories}
      />
    </div>
  );
};

export default DomainList;