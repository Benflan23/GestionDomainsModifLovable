
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Domain } from '@/pages/Index';
import { Edit, Trash2, Plus } from 'lucide-react';

interface DomainListProps {
  domains: Domain[];
  onEdit: (domain: Domain) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const DomainList: React.FC<DomainListProps> = ({ domains, onEdit, onDelete, onAdd }) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle className="text-lg sm:text-xl break-words">Liste des Domaines</CardTitle>
        <Button onClick={onAdd} className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Ajouter un domaine</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {/* Vue mobile - Cards */}
        <div className="block sm:hidden space-y-4">
          {domains.map((domain) => (
            <Card key={`mobile-${domain.id}`} className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-mono text-sm font-semibold break-all flex-1 min-w-0">{domain.name}</h3>
                  <Badge className={`${getStatusColor(domain.status)} text-xs flex-shrink-0 whitespace-nowrap`}>
                    {domain.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="break-words">Registrar: {domain.registrar}</div>
                  <div className="break-words">Catégorie: {domain.category}</div>
                  <div className="break-words">Expiration: {formatDate(domain.expirationDate)}</div>
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
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium whitespace-nowrap">Nom de domaine</th>
                <th className="text-left p-4 font-medium whitespace-nowrap">Registrar</th>
                <th className="text-left p-4 font-medium whitespace-nowrap">Catégorie</th>
                <th className="text-left p-4 font-medium whitespace-nowrap">Date d'expiration</th>
                <th className="text-left p-4 font-medium whitespace-nowrap">Statut</th>
                <th className="text-left p-4 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={`${domain.id}`} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm break-all max-w-0 min-w-[150px]">{domain.name}</td>
                  <td className="p-4 break-words max-w-0 min-w-[100px]">{domain.registrar}</td>
                  <td className="p-4 break-words max-w-0 min-w-[100px]">{domain.category}</td>
                  <td className="p-4 whitespace-nowrap">{formatDate(domain.expirationDate)}</td>
                  <td className="p-4">
                    <Badge className={`${getStatusColor(domain.status)} whitespace-nowrap`}>
                      {domain.status}
                    </Badge>
                  </td>
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
        
        {domains.length === 0 && (
          <div className="text-center py-8 text-gray-500 break-words">
            Aucun domaine enregistré. Cliquez sur "Ajouter un domaine" pour commencer.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainList;
