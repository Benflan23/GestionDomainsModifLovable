
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Domain, Sale } from '@/pages/Index';
import { TrendingUp, Globe, DollarSign, Target } from 'lucide-react';

interface DashboardProps {
  domains: Domain[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ domains = [], sales = [] }) => {
  const totalDomains = domains.length;
  const soldDomains = domains.filter(d => d.status === 'vendu').length;
  const totalInvestment = domains.reduce((sum, d) => sum + (d.purchasePrice || 0), 0);
  const totalSales = sales.reduce((sum, s) => sum + s.sellingPrice, 0);
  const roi = totalInvestment > 0 ? ((totalSales - totalInvestment) / totalInvestment) * 100 : 0;
  const totalValue = domains.reduce((sum, d) => {
    if (d.status === 'vendu') return sum + (d.sellingPrice || 0);
    return sum + (d.purchasePrice || 0) * 8; // Estimation basique
  }, 0);

  const cards = [
    {
      title: 'Total Domaines',
      value: totalDomains,
      icon: Globe,
      description: 'Domaines dans le portefeuille',
      color: 'text-blue-600'
    },
    {
      title: 'Domaines Vendus',
      value: soldDomains,
      icon: Target,
      description: 'Ventes réalisées',
      color: 'text-green-600'
    },
    {
      title: 'ROI Global',
      value: `${roi.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Retour sur investissement',
      color: roi >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Valeur Totale',
      value: `${totalValue.toFixed(0)}€`,
      icon: DollarSign,
      description: 'Valeur estimée du portefeuille',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 break-words hyphens-auto">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.color} flex-shrink-0`} />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl xl:text-3xl font-bold ${card.color} mb-1 break-words`}>
              {card.value}
            </div>
            <p className="text-xs text-gray-500 break-words leading-relaxed">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
