import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import DomainList from '@/components/DomainList';
import AddDomainModal from '@/components/AddDomainModal';
import BulkDomainManager from '@/components/BulkDomainManager';
import EvaluationSection from '@/components/EvaluationSection';
import ROIStatistics from '@/components/ROIStatistics';
import SalesHistory from '@/components/SalesHistory';
import Settings from '@/components/Settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';

// API Service
const api = axios.create({
  baseURL: `${window.location.origin}/api/`,
});

export interface Domain {
  id: string;
  name: string;
  registrar: string;
  category: string;
  purchaseDate: string;
  expirationDate: string;
  status: 'actif' | 'vendu' | 'expire' | 'en-vente';
  purchasePrice?: number;
}

export interface Evaluation {
  id: string;
  domainId: string;
  tool: string;
  date: string;
  estimatedValue: number;
}

export interface Sale {
  id: string;
  domainName: string;
  saleDate: string;
  sellingPrice: number;
  buyer: string;
}

const Index = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [customLists, setCustomLists] = useState({
    registrars: [],
    categories: [],
    evaluationTools: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const [domainsRes, evaluationsRes, salesRes, settingsRes] = await Promise.all([
          api.get('/domains'),
          api.get('/evaluations'),
          api.get('/sales'),
          api.get('/settings')
        ]);
        
        setDomains(domainsRes.data);
        setEvaluations(evaluationsRes.data);
        setCustomLists(settingsRes.data);
        setSales(salesRes.data);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addDomain = async (domain: Omit<Domain, 'id'>) => {
    try {
      const response = await api.post('/domains', domain);
      setDomains(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding domain:', err);
      return false;
    }
  };

  const addMultipleDomains = async (newDomains: Omit<Domain, 'id'>[]) => {
    try {
      // Implement bulk import endpoint in backend for better performance
      const results = await Promise.all(
        newDomains.map(domain => api.post('/domains', domain))
      );
      
      setDomains(prev => [...results.map(res => res.data), ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding multiple domains:', err);
      return false;
    }
  };

  const updateDomain = async (updatedDomain: Domain) => {
    try {
      await api.put(`/domains/${updatedDomain.id}`, updatedDomain);
      setDomains(prev => prev.map(d => 
        d.id === updatedDomain.id ? updatedDomain : d
      ));
      return true;
    } catch (err) {
      console.error('Error updating domain:', err);
      return false;
    }
  };

  const deleteDomain = async (id: string) => {
  try {
    await api.delete(`/domains/${id}`);
    // Use functional update
    setDomains(prev => prev.filter(domain => domain.id !== id));
    return true;
  } catch (err) {
    console.error('Error deleting domain:', err);
    return false;
  }
};

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    try {
      const response = await api.post('/evaluations', evaluation);
      setEvaluations([...evaluations, response.data]);
      return true;
    } catch (err) {
      console.error('Error adding evaluation:', err);
      return false;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Gestion de Domaines
          </h1>
          <p className="text-sm sm:text-lg text-gray-600">
            Gérez votre portefeuille de noms de domaine efficacement
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-0.5 p-1">
            <TabsTrigger value="dashboard" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="hidden sm:inline">Tableau de bord</span>
              <span className="sm:hidden truncate">Board</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="truncate">Domaines</span>
            </TabsTrigger>
            <TabsTrigger value="import-export" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="hidden sm:inline">Import/Export</span>
              <span className="sm:hidden truncate">Import/Export</span>
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="hidden sm:inline">Évaluation</span>
              <span className="sm:hidden truncate">Evaluation</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="hidden sm:inline">Statistiques</span>
              <span className="sm:hidden truncate">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="truncate">Ventes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] xs:text-xs sm:text-sm px-1 py-2 min-w-0">
              <span className="hidden sm:inline">Paramètres</span>
              <span className="sm:hidden truncate">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard domains={domains} sales={sales} />
          </TabsContent>

          <TabsContent value="domains">
            <DomainList
              domains={domains}
              onEdit={setEditingDomain}
              onDelete={deleteDomain}
              onAdd={() => setIsAddModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="import-export">
            <BulkDomainManager
              domains={domains}
              onImportDomains={addMultipleDomains}
              registrars={customLists.registrars}
              categories={customLists.categories}
            />
          </TabsContent>

          <TabsContent value="evaluation">
            <EvaluationSection
              domains={domains}
              evaluations={evaluations}
              onAddEvaluation={addEvaluation}
              evaluationTools={customLists.evaluationTools}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <ROIStatistics domains={domains} sales={sales} />
          </TabsContent>

          <TabsContent value="sales">
            <SalesHistory sales={sales} />
          </TabsContent>

          <TabsContent value="settings">
            <Settings
              customLists={customLists}
              onUpdateLists={setCustomLists}
            />
          </TabsContent>
        </Tabs>

        <AddDomainModal
          isOpen={isAddModalOpen || !!editingDomain}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingDomain(null);
          }}
          onSave={editingDomain ? updateDomain : addDomain}
          domain={editingDomain}
          registrars={customLists.registrars}
          categories={customLists.categories}
        />
      </div>
    </div>
  );
};

export default Index;