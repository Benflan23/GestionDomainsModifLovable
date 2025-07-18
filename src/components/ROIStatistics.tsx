import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Domain, Sale } from '@/pages/Index';

interface ROIStatisticsProps {
  domains: Domain[];
  sales: Sale[];
}

const COLORS = {
  actif: '#22c55e',
  enVente: '#f59e0b',
  vendu: '#3b82f6',
  expire: '#ef4444',
};

const formatCurrency = (value: number) => `${parseInt(value).toFixed(0)}€`;

const CardInfo = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </CardContent>
  </Card>
);

const ROIStatistics: React.FC<ROIStatisticsProps> = ({ domains, sales }) => {
  const totalPurchased = domains.reduce((sum, d) => sum + (parseInt(d.purchasePrice) || 0), 0);
  const totalSold = sales.reduce((sum, s) => sum + parseInt(s.sellingPrice), 0);
  const roi = totalPurchased > 0 ? ((totalSold - totalPurchased) / totalPurchased) * 100 : 0;
  const averageValue = domains.length > 0 ? totalPurchased / domains.length : 0;

  const chartData = [
    { name: 'Total Acheté', value: totalPurchased },
    { name: 'Total Vendu', value: totalSold },
    { name: 'Profit', value: Math.max(0, totalSold - totalPurchased) },
  ];

  const statusData = [
    { name: 'Actifs', value: domains.filter(d => d.status === 'actif').length, color: COLORS.actif },
    { name: 'En vente', value: domains.filter(d => d.status === 'en-vente').length, color: COLORS.enVente },
    { name: 'Vendus', value: domains.filter(d => d.status === 'vendu').length, color: COLORS.vendu },
    { name: 'Expirés', value: domains.filter(d => d.status === 'expire').length, color: COLORS.expire },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardInfo title="Total Acheté" value={formatCurrency(totalPurchased)} color="text-red-600" />
        <CardInfo title="Total Vendu" value={formatCurrency(totalSold)} color="text-green-600" />
        <CardInfo title="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? 'text-green-600' : 'text-red-600'} />
        <CardInfo title="Valeur Moyenne" value={formatCurrency(averageValue)} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analyse Financière</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}€`, '']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ROIStatistics;