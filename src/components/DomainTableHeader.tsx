import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DomainTableHeaderProps {
  sortConfig: SortConfig[];
  onSort: (key: string) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const DomainTableHeader: React.FC<DomainTableHeaderProps> = ({ 
  sortConfig, 
  onSort, 
  selectedCount, 
  totalCount, 
  onSelectAll, 
  onDeselectAll 
}) => {
  const getSortIcon = (key: string) => {
    const sortItem = sortConfig.find(item => item.key === key);
    if (!sortItem) return <ChevronsUpDown className="h-4 w-4" />;
    return sortItem.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getSortOrder = (key: string) => {
    const index = sortConfig.findIndex(item => item.key === key);
    return index >= 0 ? index + 1 : null;
  };

  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const SortButton: React.FC<{ sortKey: string; children: React.ReactNode }> = ({ sortKey, children }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium hover:bg-transparent justify-start"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-2">
        {children}
        <span className="flex items-center gap-1">
          {getSortIcon(sortKey)}
          {getSortOrder(sortKey) && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {getSortOrder(sortKey)}
            </span>
          )}
        </span>
      </span>
    </Button>
  );

  return (
    <thead>
      <tr className="border-b">
        <th className="text-left p-4 w-12">
          <Checkbox
            checked={isAllSelected}
            // @ts-ignore - indeterminate is a valid prop for Checkbox
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAllChange}
          />
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="name">Nom de domaine</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="registrar">Registrar</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="category">Catégorie</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="purchaseDate">Date d'achat</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="expirationDate">Date d'expiration</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="status">Statut</SortButton>
        </th>
        <th className="text-left p-4 font-medium">
          <SortButton sortKey="purchasePrice">Prix d'achat</SortButton>
        </th>
        <th className="text-left p-4 font-medium">Actions</th>
      </tr>
    </thead>
  );
};

export default DomainTableHeader;