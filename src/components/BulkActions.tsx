import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Download, Upload } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  totalCount: number;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkEdit,
  onBulkDelete,
  onBulkExport,
  onSelectAll,
  onDeselectAll,
  totalCount,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-sm font-medium text-blue-700">
              {selectedCount} domaine{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="h-auto p-1 text-blue-600 hover:text-blue-700"
              >
                Tout sélectionner ({totalCount})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="h-auto p-1 text-blue-600 hover:text-blue-700"
              >
                Tout désélectionner
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActions;