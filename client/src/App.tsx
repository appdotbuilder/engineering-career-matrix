import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { trpc } from '@/utils/trpc';
import { JobMatrixTable } from '@/components/JobMatrixTable';
import { FilterPanel } from '@/components/FilterPanel';
import { ComparisonPanel } from '@/components/ComparisonPanel';
import { LevelDetailPanel } from '@/components/LevelDetailPanel';
import { OverviewPanel } from '@/components/OverviewPanel';
import { EditHistoryPanel } from '@/components/EditHistoryPanel';
import { SampleDataIndicator } from '@/components/SampleDataIndicator';
import type { 
  EngineeringJobMatrix, 
  SearchInput 
} from '../../server/src/schema';

// Sample data for demonstration (will be replaced by API calls)
const sampleData: EngineeringJobMatrix = {
  jobLevels: [
    {
      id: "L1_L2",
      name: "L1 / L2",
      track: "IC",
      summaryDescription: "Intern / New Grad",
      trajectoryInfo: "We expect Engineers to remain at this level for 2 years on average",
      scopeOfInfluenceSummary: "Themselves and their tasks",
      ownershipSummary: "No ownership responsibility. Learning and being actively developed by others"
    },
    {
      id: "L3",
      name: "L3",
      track: "IC",
      summaryDescription: "L3",
      trajectoryInfo: "We expect Engineers to remain at this level for 2 years on average",
      scopeOfInfluenceSummary: "Their area and strategy",
      ownershipSummary: "Consistent record of very strong ownership for their area. Accountable for results in that area."
    },
    {
      id: "L4",
      name: "L4",
      track: "IC",
      summaryDescription: "L4",
      trajectoryInfo: "Progression beyond this level is optional.",
      scopeOfInfluenceSummary: "whole organization",
      ownershipSummary: "Exhibits ownership across the team, as it relates to the impact of their area. Accountable for executing on their area's strategy."
    },
    {
      id: "TL1",
      name: "Lead Engineer",
      track: "TL",
      summaryDescription: "A Lead Engineer makes technical contributions with a small number of direct reports (target max: 5)",
      trajectoryInfo: "Progression beyond this level is optional. TLs may continue along the TL path, with deeper technical contributions (TL2) or expand their number of reports and follow the Manager path (EM1). Managerial promotions require a business need for the new position to be created.",
      scopeOfInfluenceSummary: "Their team and their team's strategy",
      ownershipSummary: "Accountable for results across a small number of teams. Consistent record of very strong ownership across those teams."
    },
    {
      id: "EM1",
      name: "Engineering Manager",
      track: "EM",
      summaryDescription: "An Eng Manager supports Lead Engineers, and is responsible for technical decisions and outcomes on their teams (target max reports: 3 TLs)",
      trajectoryInfo: "Promotion to EM and above requires there to be a business need for the role",
      scopeOfInfluenceSummary: "Their team and their team's strategy",
      ownershipSummary: "Accountable for results across a small number of teams. Consistent record of very strong ownership across those teams."
    },
    {
      id: "EM2",
      name: "Director of Engineering",
      track: "Director",
      summaryDescription: "Responsible for a Department, multiple teams. TLs or EMs report to a Director.",
      trajectoryInfo: null,
      scopeOfInfluenceSummary: "Their department (multiple teams) and their department's strategy",
      ownershipSummary: "Accountable for results across their department. Consistent record of very strong ownership across their department."
    }
  ],
  competencyCategories: [
    {
      id: "craft",
      name: "Craft",
      subCategories: [
        {
          id: "technical-expertise",
          name: "Technical Expertise",
          descriptionsByLevel: {
            L1_L2: "Has sufficient practical and foundational knowledge to be able to understand and implement features with guidance. Learns best-practices and tools",
            L3: "Contributes to the codebase on a regular basis, delivering well-tested, high-quality, and maintainable features. Understands the wider technical context around the systems they work on.",
            L4: "A strong individual contributor, consistently delivering high-quality, complex features. Has deep knowledge of multiple systems and can troubleshoot across them.",
            TL1: "As L5. Actively involved in technical decision-making and problem-solving for their team. Ensures the team's technical solutions align with overall architectural guidelines.",
            EM1: "As L5+. Understands the technical landscape of their teams and makes sound technical decisions. Facilitates technical discussions and resolves conflicts.",
            EM2: "As L5+. Follows tech trends, researches technologies and organises POCs. Understands the technical landscape of their department."
          }
        },
        {
          id: "scope",
          name: "Scope",
          descriptionsByLevel: {
            L1_L2: "Owns tasks and small projects",
            L3: "Medium-to-Large Changes. Able to predict production behaviour by following best-practise and testing (correctness and performance).",
            L4: "Large systems, aware of APIs and responsibility-boundaries between services. Owns significant features or components within a team.",
            TL1: "Owns the problem-domain of their teams and their team's success. Adapts approach and tools when appropriate.",
            EM1: "Manages multiple teams and product areas. Works across the company to integrate their teams' work into company plans and timelines.",
            EM2: "Manages a department composed of multiple teams and product areas. Oversees highly complex, strategic initiatives."
          }
        }
      ]
    },
    {
      id: "impact",
      name: "Impact",
      subCategories: [
        {
          id: "planning",
          name: "Planning",
          descriptionsByLevel: {
            L1_L2: "Plans execution of their tasks to reliably deliver changes. Breaks down small tasks and estimates their effort.",
            L3: "Documents tasks for large features/small system. Gives reliable estimates for project work. Plans roll-out of their feature to users.",
            L4: "Writes specs and scopes tasks for large systems and work break down for several people. Able to create RFCs and negotiate with stakeholders.",
            TL1: "Defines Roadmap for their team for the Quarter ahead, balancing company priorities against the quality of their features and technical debt.",
            EM1: "Applies a strong understanding of company goals, identifies risks and opportunities, allocating capacity to the right efforts.",
            EM2: "Leads strategic planning for their department, aligning with company-wide objectives. Identifies and mitigates significant risks and opportunities."
          }
        }
      ]
    }
  ],
  metadata: {
    lastUpdated: "2024-05-29",
    goals: [
      "Goals: process of reviews and promotion committees as well as for the process of hiring."
    ],
    keyPrinciples: [
      "Most important is impact and ownership",
      "Criteria Matrix and levels unitlateral across org; yet job titles and specific requirements/expectations may vary per department",
      "How do you hold people accountable if you don't know what they are SUPPOSED to be doing?"
    ],
    editHistory: [
      {
        date: "2024-05-20",
        description: "v1 published, previous docs deprecated"
      },
      {
        date: "2024-05-25",
        description: "Made some Director-level rows more explicit"
      },
      {
        date: "2024-05-29",
        description: "Tweaked langauge around complexity - celebrate simple designs that address complex problems"
      }
    ]
  }
};

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

function App() {
  const [matrixData, setMatrixData] = useState<EngineeringJobMatrix | null>(null);
  const [filteredData, setFilteredData] = useState<EngineeringJobMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);

  const [appState, setAppState] = useState<AppState>({
    searchQuery: '',
    selectedTracks: [],
    selectedLevels: [],
    selectedCategories: [],
    selectedSubCategories: [],
    comparisonLevels: [],
    selectedLevelForDetail: null,
    activeTab: 'matrix'
  });

  // Load initial data
  const loadMatrixData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to fetch from API first, fallback to sample data if it fails
      try {
        const result = await trpc.getFullMatrix.query();
        if (result && result.jobLevels && result.jobLevels.length > 0) {
          setMatrixData(result);
          return;
        }
      } catch (apiError) {
        console.warn('API unavailable, using sample data:', apiError);
        setIsUsingSampleData(true);
      }
      
      // Use sample data as fallback
      setMatrixData(sampleData);
      if (!isUsingSampleData) setIsUsingSampleData(true);
    } catch (error) {
      console.error('Failed to load matrix data:', error);
      setError('Failed to load career matrix data. Please try again later.');
      // Still set sample data as ultimate fallback
      setMatrixData(sampleData);
    } finally {
      setIsLoading(false);
    }
  }, [isUsingSampleData]);

  // Update filtered data when search/filter params change
  const updateFilteredData = useCallback(async () => {
    if (!matrixData) return;

    // If no filters are applied, show all data
    const hasFilters = appState.searchQuery || 
                      appState.selectedTracks.length > 0 || 
                      appState.selectedLevels.length > 0 || 
                      appState.selectedCategories.length > 0 || 
                      appState.selectedSubCategories.length > 0;

    if (!hasFilters) {
      setFilteredData(matrixData);
      return;
    }

    try {
      // Try to use search API if available
      const searchInput: SearchInput = {
        query: appState.searchQuery || undefined,
        tracks: appState.selectedTracks.length > 0 ? appState.selectedTracks as Array<"IC" | "TL" | "EM" | "Director"> : undefined,
        levelIds: appState.selectedLevels.length > 0 ? appState.selectedLevels : undefined,
        categoryIds: appState.selectedCategories.length > 0 ? appState.selectedCategories : undefined,
        subCategoryIds: appState.selectedSubCategories.length > 0 ? appState.selectedSubCategories : undefined,
      };

      const result = await trpc.searchMatrix.query(searchInput);
      if (result && (result.jobLevels.length > 0 || result.competencyCategories.length > 0)) {
        setFilteredData(result);
        return;
      }
    } catch (apiError) {
      console.warn('Search API unavailable, using client-side filtering:', apiError);
    }

    // Fallback to client-side filtering
    const filtered = clientSideFilter(matrixData, appState);
    setFilteredData(filtered);
  }, [matrixData, appState]);

  // Client-side filtering function
  const clientSideFilter = (data: EngineeringJobMatrix, state: AppState): EngineeringJobMatrix => {
    let filteredLevels = data.jobLevels;
    let filteredCategories = data.competencyCategories;

    // Filter job levels
    if (state.selectedTracks.length > 0) {
      filteredLevels = filteredLevels.filter(level => 
        state.selectedTracks.includes(level.track)
      );
    }

    if (state.selectedLevels.length > 0) {
      filteredLevels = filteredLevels.filter(level => 
        state.selectedLevels.includes(level.id)
      );
    }

    // Filter categories and sub-categories
    if (state.selectedCategories.length > 0) {
      filteredCategories = filteredCategories.filter(category => 
        state.selectedCategories.includes(category.id)
      );
    }

    if (state.selectedSubCategories.length > 0) {
      filteredCategories = filteredCategories.map(category => ({
        ...category,
        subCategories: category.subCategories.filter(subCat => 
          state.selectedSubCategories.includes(subCat.id)
        )
      })).filter(category => category.subCategories.length > 0);
    }

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      
      // Filter levels by search
      filteredLevels = filteredLevels.filter(level => 
        level.name.toLowerCase().includes(query) ||
        level.summaryDescription.toLowerCase().includes(query) ||
        (level.trajectoryInfo && level.trajectoryInfo.toLowerCase().includes(query))
      );

      // Filter categories and sub-categories by search
      filteredCategories = filteredCategories.map(category => {
        const categoryMatches = category.name.toLowerCase().includes(query);
        const filteredSubCategories = category.subCategories.filter(subCat => {
          const subCatMatches = subCat.name.toLowerCase().includes(query);
          const descriptionMatches = Object.values(subCat.descriptionsByLevel).some(desc =>
            desc.toLowerCase().includes(query)
          );
          return categoryMatches || subCatMatches || descriptionMatches;
        });

        return {
          ...category,
          subCategories: filteredSubCategories
        };
      }).filter(category => 
        category.name.toLowerCase().includes(query) || category.subCategories.length > 0
      );
    }

    return {
      ...data,
      jobLevels: filteredLevels,
      competencyCategories: filteredCategories
    };
  };

  useEffect(() => {
    loadMatrixData();
  }, [loadMatrixData]);

  useEffect(() => {
    updateFilteredData();
  }, [updateFilteredData]);

  // URL synchronization (basic implementation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newState: Partial<AppState> = {};

    if (params.get('search')) newState.searchQuery = params.get('search')!;
    if (params.get('tracks')) newState.selectedTracks = params.get('tracks')!.split(',');
    if (params.get('levels')) newState.selectedLevels = params.get('levels')!.split(',');
    if (params.get('categories')) newState.selectedCategories = params.get('categories')!.split(',');
    if (params.get('subCategories')) newState.selectedSubCategories = params.get('subCategories')!.split(',');
    if (params.get('comparison')) newState.comparisonLevels = params.get('comparison')!.split(',');
    if (params.get('tab')) newState.activeTab = params.get('tab')!;

    if (Object.keys(newState).length > 0) {
      setAppState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const updateURL = useCallback((newState: Partial<AppState>) => {
    const params = new URLSearchParams();
    const fullState = { ...appState, ...newState };

    if (fullState.searchQuery) params.set('search', fullState.searchQuery);
    if (fullState.selectedTracks.length > 0) params.set('tracks', fullState.selectedTracks.join(','));
    if (fullState.selectedLevels.length > 0) params.set('levels', fullState.selectedLevels.join(','));
    if (fullState.selectedCategories.length > 0) params.set('categories', fullState.selectedCategories.join(','));
    if (fullState.selectedSubCategories.length > 0) params.set('subCategories', fullState.selectedSubCategories.join(','));
    if (fullState.comparisonLevels.length > 0) params.set('comparison', fullState.comparisonLevels.join(','));
    if (fullState.activeTab !== 'matrix') params.set('tab', fullState.activeTab);

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
  }, [appState]);

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
    updateURL(updates);
  }, [updateURL]);

  const clearAllFilters = () => {
    const clearedState: Partial<AppState> = {
      searchQuery: '',
      selectedTracks: [],
      selectedLevels: [],
      selectedCategories: [],
      selectedSubCategories: [],
      comparisonLevels: []
    };
    updateAppState(clearedState);
  };

  const handleLevelSelect = (levelId: string) => {
    updateAppState({ selectedLevelForDetail: levelId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Engineering Career Matrix...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-gray-800 font-medium mb-2">Error Loading Matrix</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadMatrixData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayData = filteredData || matrixData;
  const hasActiveFilters = appState.searchQuery || 
                          appState.selectedTracks.length > 0 || 
                          appState.selectedLevels.length > 0 || 
                          appState.selectedCategories.length > 0 || 
                          appState.selectedSubCategories.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 Engineering Career Matrix</h1>
              <p className="text-gray-600">Interactive career ladder and competency framework</p>
            </div>
            {matrixData && (
              <Badge variant="outline" className="text-xs">
                Last updated: {matrixData.metadata.lastUpdated}
              </Badge>
            )}
          </div>
          
          {/* Global Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search levels, competencies, descriptions..."
                value={appState.searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateAppState({ searchQuery: e.target.value })
                }
                className="w-full"
              />
            </div>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" size="sm">
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <SampleDataIndicator isUsingSampleData={isUsingSampleData} />
        
        <Tabs value={appState.activeTab} onValueChange={(value: string) => updateAppState({ activeTab: value })}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="matrix">📊 Matrix</TabsTrigger>
            <TabsTrigger value="comparison">🔍 Compare</TabsTrigger>
            <TabsTrigger value="overview">📋 Overview</TabsTrigger>
            <TabsTrigger value="history">📝 History</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <FilterPanel
                  matrixData={matrixData}
                  appState={appState}
                  updateAppState={updateAppState}
                  onClearFilters={clearAllFilters}
                />
              </div>
              
              <div className="lg:col-span-3">
                {displayData ? (
                  <JobMatrixTable
                    data={displayData}
                    searchQuery={appState.searchQuery}
                    onLevelSelect={handleLevelSelect}
                    comparisonMode={false}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            {matrixData && (
              <ComparisonPanel
                matrixData={matrixData}
                appState={appState}
                updateAppState={updateAppState}
              />
            )}
          </TabsContent>

          <TabsContent value="overview">
            {matrixData && <OverviewPanel metadata={matrixData.metadata} />}
          </TabsContent>

          <TabsContent value="history">
            {matrixData && <EditHistoryPanel editHistory={matrixData.metadata.editHistory} />}
          </TabsContent>
        </Tabs>

        {/* Level Detail Panel */}
        {appState.selectedLevelForDetail && matrixData && (
          <LevelDetailPanel
            level={matrixData.jobLevels.find(l => l.id === appState.selectedLevelForDetail)}
            onClose={() => updateAppState({ selectedLevelForDetail: null })}
          />
        )}
      </div>
    </div>
  );
}

export default App;