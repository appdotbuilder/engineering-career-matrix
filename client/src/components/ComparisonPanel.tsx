import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobMatrixTable } from './JobMatrixTable';
import { trpc } from '@/utils/trpc';
import { Info } from 'lucide-react';
import type { EngineeringJobMatrix, JobLevel } from '../../../server/src/schema';

interface AppState {
  searchQuery: string;
  selectedTracks: string[];
  selectedLevels: string[];
  selectedCategories: string[];
  selectedSubCategories: string[];
  comparisonLevels: string[];
  selectedLevelForDetail: string | null;
  activeTab: string;
}

interface ComparisonPanelProps {
  matrixData: EngineeringJobMatrix;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
}

const trackInfo = {
  IC: { name: 'Individual Contributor', icon: '🔧', color: 'bg-blue-100 text-blue-800' },
  TL: { name: 'Technical Lead', icon: '👨‍💻', color: 'bg-green-100 text-green-800' },
  EM: { name: 'Engineering Manager', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  Director: { name: 'Director', icon: '🎯', color: 'bg-orange-100 text-orange-800' }
};

export function ComparisonPanel({ matrixData, appState, updateAppState }: ComparisonPanelProps) {
  const [comparisonData, setComparisonData] = useState<EngineeringJobMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update comparison data when comparison levels change
  useEffect(() => {
    const loadComparisonData = async () => {
      if (appState.comparisonLevels.length === 0) {
        setComparisonData(null);
        return;
      }

      setIsLoading(true);
      try {
        // Try to use comparison API if available
        try {
          const result = await trpc.compareJobLevels.query({ 
            levelIds: appState.comparisonLevels 
          });
          if (result && result.jobLevels && result.jobLevels.length > 0) {
            setComparisonData(result);
            setIsLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('Comparison API unavailable, using client-side filtering:', apiError);
        }

        // Fallback to client-side filtering
        const filteredLevels = matrixData.jobLevels.filter(level => 
          appState.comparisonLevels.includes(level.id)
        );

        setComparisonData({
          ...matrixData,
          jobLevels: filteredLevels
        });
      } catch (error) {
        console.error('Failed to load comparison data:', error);
        setComparisonData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadComparisonData();
  }, [appState.comparisonLevels, matrixData]);

  const handleLevelToggle = (levelId: string, checked: boolean) => {
    const newComparisonLevels = checked
      ? [...appState.comparisonLevels, levelId]
      : appState.comparisonLevels.filter(id => id !== levelId);

    // Limit to maximum 4 levels for comparison
    if (newComparisonLevels.length > 4) {
      return;
    }

    updateAppState({ comparisonLevels: newComparisonLevels });
  };

  const clearComparison = () => {
    updateAppState({ comparisonLevels: [] });
  };

  const groupedLevels = matrixData.jobLevels.reduce((acc, level) => {
    if (!acc[level.track]) acc[level.track] = [];
    acc[level.track].push(level);
    return acc;
  }, {} as Record<string, JobLevel[]>);

  return (
    <div className="space-y-6">
      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍</span>
            Compare Job Levels
            {appState.comparisonLevels.length > 0 && (
              <Badge variant="secondary">
                {appState.comparisonLevels.length} selected
              </Badge>
            )}
          </CardTitle>
          {appState.comparisonLevels.length > 0 && (
            <div className="flex items-center gap-2">
              <Button onClick={clearComparison} size="sm" variant="outline">
                Clear Selection
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select 2-4 job levels to compare their competency requirements side by side. 
              This helps understand career progression paths and skill gaps between roles.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {Object.entries(groupedLevels).map(([track, levels]) => {
              const info = trackInfo[track as keyof typeof trackInfo];
              
              return (
                <div key={track}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{info?.icon || '📊'}</span>
                    <h4 className="font-medium">{info?.name || track}</h4>
                    <Badge className={info?.color || 'bg-gray-100'}>
                      {levels.length} levels
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                    {levels.map(level => (
                      <div
                        key={level.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          appState.comparisonLevels.includes(level.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          !appState.comparisonLevels.includes(level.id) && 
                          appState.comparisonLevels.length >= 4
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={appState.comparisonLevels.includes(level.id)}
                            onCheckedChange={(checked: boolean) => handleLevelToggle(level.id, checked)}
                            disabled={!appState.comparisonLevels.includes(level.id) && appState.comparisonLevels.length >= 4}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium mb-1">{level.name}</div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {level.summaryDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {appState.comparisonLevels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Comparison Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appState.comparisonLevels.length < 2 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p>Select at least 2 levels to start comparing</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading comparison...</p>
              </div>
            ) : comparisonData ? (
              <div>
                {/* Comparison Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Comparing:</h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonData.jobLevels.map(level => {
                      const info = trackInfo[level.track as keyof typeof trackInfo];
                      return (
                        <Badge 
                          key={level.id} 
                          className={info?.color || 'bg-gray-100'}
                        >
                          {info?.icon} {level.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <JobMatrixTable
                  data={comparisonData}
                  searchQuery=""
                  onLevelSelect={(levelId: string) => updateAppState({ selectedLevelForDetail: levelId })}
                  comparisonMode={true}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">⚠️</div>
                <p>Failed to load comparison data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}