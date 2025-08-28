import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter } from 'lucide-react';
import type { EngineeringJobMatrix } from '../../../server/src/schema';

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

interface FilterPanelProps {
  matrixData: EngineeringJobMatrix | null;
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  onClearFilters: () => void;
}

const trackInfo = {
  IC: { name: 'Individual Contributor', icon: '🔧', color: 'bg-blue-100 text-blue-800' },
  TL: { name: 'Technical Lead', icon: '👨‍💻', color: 'bg-green-100 text-green-800' },
  EM: { name: 'Engineering Manager', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  Director: { name: 'Director', icon: '🎯', color: 'bg-orange-100 text-orange-800' }
};

export function FilterPanel({ matrixData, appState, updateAppState, onClearFilters }: FilterPanelProps) {
  if (!matrixData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading filters...</p>
        </CardContent>
      </Card>
    );
  }

  const tracks = Array.from(new Set(matrixData.jobLevels.map(level => level.track)));
  const hasActiveFilters = appState.searchQuery || 
                          appState.selectedTracks.length > 0 || 
                          appState.selectedLevels.length > 0 || 
                          appState.selectedCategories.length > 0 || 
                          appState.selectedSubCategories.length > 0;

  const handleTrackToggle = (track: string, checked: boolean) => {
    if (checked) {
      updateAppState({ 
        selectedTracks: [...appState.selectedTracks, track],
        selectedLevels: [] // Clear specific level selection when track is selected
      });
    } else {
      updateAppState({ 
        selectedTracks: appState.selectedTracks.filter(t => t !== track)
      });
    }
  };

  const handleLevelToggle = (levelId: string, checked: boolean) => {
    if (checked) {
      updateAppState({ 
        selectedLevels: [...appState.selectedLevels, levelId],
        selectedTracks: [] // Clear track selection when specific level is selected
      });
    } else {
      updateAppState({ 
        selectedLevels: appState.selectedLevels.filter(l => l !== levelId)
      });
    }
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      updateAppState({ 
        selectedCategories: [...appState.selectedCategories, categoryId],
        selectedSubCategories: [] // Clear sub-category selection when category is selected
      });
    } else {
      updateAppState({ 
        selectedCategories: appState.selectedCategories.filter(c => c !== categoryId)
      });
    }
  };

  const handleSubCategoryToggle = (subCategoryId: string, checked: boolean) => {
    if (checked) {
      updateAppState({ 
        selectedSubCategories: [...appState.selectedSubCategories, subCategoryId]
      });
    } else {
      updateAppState({ 
        selectedSubCategories: appState.selectedSubCategories.filter(sc => sc !== subCategoryId)
      });
    }
  };

  // Get available sub-categories based on selected categories
  const availableSubCategories = appState.selectedCategories.length > 0
    ? matrixData.competencyCategories
        .filter(cat => appState.selectedCategories.includes(cat.id))
        .flatMap(cat => cat.subCategories)
    : matrixData.competencyCategories.flatMap(cat => cat.subCategories);

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              onClick={onClearFilters} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {appState.searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{appState.searchQuery}"
              </Badge>
            )}
            {appState.selectedTracks.map(track => (
              <Badge key={track} variant="secondary" className="text-xs">
                {trackInfo[track as keyof typeof trackInfo]?.name || track}
              </Badge>
            ))}
            {appState.selectedLevels.map(levelId => {
              const level = matrixData.jobLevels.find(l => l.id === levelId);
              return (
                <Badge key={levelId} variant="secondary" className="text-xs">
                  {level?.name || levelId}
                </Badge>
              );
            })}
            {appState.selectedCategories.map(categoryId => {
              const category = matrixData.competencyCategories.find(c => c.id === categoryId);
              return (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {category?.name || categoryId}
                </Badge>
              );
            })}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Track Filter */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>🎯</span>
            Career Track
          </h4>
          <div className="space-y-2">
            {tracks.map(track => {
              const info = trackInfo[track as keyof typeof trackInfo];
              const levelCount = matrixData.jobLevels.filter(l => l.track === track).length;
              
              return (
                <div key={track} className="flex items-center space-x-3">
                  <Checkbox
                    id={`track-${track}`}
                    checked={appState.selectedTracks.includes(track)}
                    onCheckedChange={(checked: boolean) => handleTrackToggle(track, checked)}
                  />
                  <label 
                    htmlFor={`track-${track}`} 
                    className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                  >
                    <span>{info?.icon || '📊'}</span>
                    <span>{info?.name || track}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {levelCount}
                    </Badge>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Specific Level Filter */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>📈</span>
            Specific Levels
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {matrixData.jobLevels.map(level => (
              <div key={level.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`level-${level.id}`}
                  checked={appState.selectedLevels.includes(level.id)}
                  onCheckedChange={(checked: boolean) => handleLevelToggle(level.id, checked)}
                />
                <label 
                  htmlFor={`level-${level.id}`} 
                  className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                >
                  <span>{trackInfo[level.track as keyof typeof trackInfo]?.icon || '📊'}</span>
                  <span>{level.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-auto text-xs ${trackInfo[level.track as keyof typeof trackInfo]?.color || 'bg-gray-100'}`}
                  >
                    {level.track}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>📊</span>
            Competency Categories
          </h4>
          <div className="space-y-2">
            {matrixData.competencyCategories.map(category => (
              <div key={category.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={appState.selectedCategories.includes(category.id)}
                  onCheckedChange={(checked: boolean) => handleCategoryToggle(category.id, checked)}
                />
                <label 
                  htmlFor={`category-${category.id}`} 
                  className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                >
                  <span>
                    {category.id === 'craft' ? '🛠️' : 
                     category.id === 'impact' ? '🎯' : '📊'}
                  </span>
                  <span>{category.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {category.subCategories.length}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Category Filter */}
        {availableSubCategories.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>📋</span>
                Competency Areas
                {appState.selectedCategories.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Filtered
                  </Badge>
                )}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableSubCategories.map(subCategory => {
                  const parentCategory = matrixData.competencyCategories.find(
                    cat => cat.subCategories.some(sub => sub.id === subCategory.id)
                  );
                  
                  return (
                    <div key={subCategory.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`subcategory-${subCategory.id}`}
                        checked={appState.selectedSubCategories.includes(subCategory.id)}
                        onCheckedChange={(checked: boolean) => handleSubCategoryToggle(subCategory.id, checked)}
                      />
                      <label 
                        htmlFor={`subcategory-${subCategory.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        <div>{subCategory.name}</div>
                        {parentCategory && appState.selectedCategories.length === 0 && (
                          <div className="text-xs text-gray-500">
                            from {parentCategory.name}
                          </div>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Filter Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="pt-2">
              <Button 
                onClick={onClearFilters} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}