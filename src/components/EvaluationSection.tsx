
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Domain, Evaluation } from '@/pages/Index';
import { Plus, TrendingUp } from 'lucide-react';

interface EvaluationSectionProps {
  domains: Domain[];
  evaluations: Evaluation[];
  onAddEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  evaluationTools: string[];
}

const EvaluationSection: React.FC<EvaluationSectionProps> = ({
  domains,
  evaluations,
  onAddEvaluation,
  evaluationTools
}) => {
  const [newEvaluation, setNewEvaluation] = useState({
    domainId: '',
    tool: '',
    date: new Date().toISOString().split('T')[0],
    estimatedValue: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvaluation.domainId && newEvaluation.tool && newEvaluation.estimatedValue > 0) {
      onAddEvaluation(newEvaluation);
      setNewEvaluation({
        domainId: '',
        tool: '',
        date: new Date().toISOString().split('T')[0],
        estimatedValue: 0
      });
    }
  };

  const getDomainName = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    return domain ? domain.name : 'Domaine inconnu';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Nouvelle Évaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="domain">Domaine</Label>
              <Select value={newEvaluation.domainId} onValueChange={(value) => setNewEvaluation({ ...newEvaluation, domainId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {domains.filter(d => d.status !== 'vendu').map((domain) => (
                    <SelectItem key={domain.id} value={domain.id.toString()}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tool">Outil d'évaluation</Label>
              <Select value={newEvaluation.tool} onValueChange={(value) => setNewEvaluation({ ...newEvaluation, tool: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Outil" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationTools.map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvaluation.date}
                onChange={(e) => setNewEvaluation({ ...newEvaluation, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="value">Valeur estimée (€)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={newEvaluation.estimatedValue}
                onChange={(e) => setNewEvaluation({ ...newEvaluation, estimatedValue: parseFloat(e.target.value) || 0 })}
                placeholder="Valeur"
                required
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Évaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Domaine</th>
                  <th className="text-left p-4 font-medium">Outil</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Valeur estimée</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{getDomainName(evaluation.domainId)}</td>
                    <td className="p-4">{evaluation.tool}</td>
                    <td className="p-4">{new Date(evaluation.date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 font-semibold text-green-600">{evaluation.estimatedValue}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {evaluations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune évaluation enregistrée. Ajoutez une évaluation ci-dessus.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationSection;
