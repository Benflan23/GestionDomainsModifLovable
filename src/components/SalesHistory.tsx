import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sale } from '@/pages/Index';
import { Download, DollarSign } from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales }) => {
  const exportToCSV = () => {
    const headers = ['Nom de domaine', 'Date de vente', 'Prix de vente', 'Acheteur'];
    const csvContent = [
      headers.join(','),
      ...sales.map(sale => [
        sale.domainName, // Use domain_name
        sale.saleDate,   // Use sale_date
        sale.sellingPrice, // Use selling_price
        sale.buyer
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'historique-ventes-domaines.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSales = sales.reduce((sum, sale) => sum + parseInt(sale.sellingPrice), 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Nombre de ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{sales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalSales.toFixed(0)}€</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Vente moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{averageSale.toFixed(0)}€</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Historique des Ventes
          </CardTitle>
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Nom de domaine</th>
                  <th className="text-left p-4 font-medium">Date de vente</th>
                  <th className="text-left p-4 font-medium">Prix de vente</th>
                  <th className="text-left p-4 font-medium">Acheteur</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{sale.domainName}</td>
                    <td className="p-4">{new Date(sale.saleDate).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 font-semibold text-green-600">{sale.sellingPrice}€</td>
                    <td className="p-4">{sale.buyer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune vente enregistrée pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesHistory;