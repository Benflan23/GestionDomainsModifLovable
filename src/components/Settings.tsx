import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Plus, X } from 'lucide-react';
import axios from 'axios';

// API service
const api = axios.create({
  baseURL: `${window.location.origin}/api/`,
});

interface SettingsProps {
  customLists: {
    registrars: string[];
    categories: string[];
    evaluationTools: string[];
  };
  onUpdateLists: (lists: {
    registrars: string[];
    categories: string[];
    evaluationTools: string[];
  }) => void;
}

const Settings: React.FC<SettingsProps> = ({ customLists, onUpdateLists }) => {
  const [newItems, setNewItems] = useState({
    registrar: '',
    category: '',
    evaluationTool: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save settings to database
  const saveSettingsToDB = useCallback(async (updatedLists: typeof customLists) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await api.put('/settings', updatedLists);
      
      if (response.status === 200) {
        console.log('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const addItem = useCallback(async (listType: 'registrars' | 'categories' | 'evaluationTools', value: string) => {
    if (value.trim() && !customLists[listType].includes(value.trim())) {
      const newLists = {
        ...customLists,
        [listType]: [...customLists[listType], value.trim()]
      };
      
      // Update local state
      onUpdateLists(newLists);
      
      // Save to database
      await saveSettingsToDB(newLists);
      
      // Clear input field
      const key = listType === 'registrars' ? 'registrar' : 
                  listType === 'categories' ? 'category' : 'evaluationTool';
      setNewItems(prev => ({ ...prev, [key]: '' }));
    }
  }, [customLists, onUpdateLists, saveSettingsToDB]);

  const removeItem = useCallback(async (listType: 'registrars' | 'categories' | 'evaluationTools', value: string) => {
    const newLists = {
      ...customLists,
      [listType]: customLists[listType].filter(item => item !== value)
    };
    
    // Update local state
    onUpdateLists(newLists);
    
    // Save to database
    await saveSettingsToDB(newLists);
  }, [customLists, onUpdateLists, saveSettingsToDB]);

  const ListManager: React.FC<{
  title: string;
  items: string[];
  listType: 'registrars' | 'categories' | 'evaluationTools';
}> = React.memo(({ title, items, listType }) => {
  const [newValue, setNewValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      await addItem(listType, newValue);
      setNewValue('');
    } catch (err) {
      setError(`Failed to add ${title.toLowerCase()}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (item: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      await removeItem(listType, item);
    } catch (err) {
      setError(`Failed to remove ${title.toLowerCase()}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`Nouveau ${title.toLowerCase()}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
              disabled={isProcessing}
            />
            <Button 
              onClick={handleAdd} 
              aria-label="Ajouter"
              disabled={isProcessing || !newValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge 
                key={item} 
                variant="secondary" 
                className="flex items-center gap-2"
              >
                {item}
                <button
                  onClick={() => handleRemove(item)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Supprimer ${item}`}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {items.length === 0 && (
            <p className="text-gray-500 text-sm">Aucun élément configuré</p>
          )}
          
          {isProcessing && (
            <p className="text-sm text-blue-500">Traitement en cours...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Paramètres Personnalisables
            {isSaving && (
              <span className="ml-2 text-sm text-gray-500">(sauvegarde en cours...)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Gérez vos listes personnalisées pour les registrars, catégories et outils d'évaluation.
            Ces listes seront utilisées dans les formulaires de l'application.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListManager
          title="Registrars"
          items={customLists.registrars}
          listType="registrars"
        />

        <ListManager
          title="Catégories"
          items={customLists.categories}
          listType="categories"
        />

        <ListManager
          title="Outils d'Évaluation"
          items={customLists.evaluationTools}
          listType="evaluationTools"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Les éléments ajoutés via "Autre" dans les formulaires seront automatiquement sauvegardés</p>
            <p>• Vous pouvez supprimer les éléments en cliquant sur le X à côté de chaque badge</p>
            <p>• Ces paramètres sont sauvegardés dans la base de données</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;