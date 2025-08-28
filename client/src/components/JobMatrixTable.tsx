import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import type { EngineeringJobMatrix } from '../../../server/src/schema';

interface JobMatrixTableProps {
  data: EngineeringJobMatrix;
  searchQuery: string;
  onLevelSelect: (levelId: string) => void;
  comparisonMode: boolean;
}

const trackColors: Record<string, string> = {
  IC: 'bg-blue-100 text-blue-800',
  TL: 'bg-green-100 text-green-800',
  EM: 'bg-purple-100 text-purple-800',
  Director: 'bg-orange-100 text-orange-800'
};

const trackIcons: Record<string, string> = {
  IC: '🔧',
  TL: '👨‍💻',
  EM: '👥',
  Director: '🎯'
};

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function JobMatrixTable({ data, searchQuery, onLevelSelect, comparisonMode }: JobMatrixTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(data.competencyCategories.map(cat => cat.id))
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (!data.jobLevels.length && !data.competencyCategories.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <p className="text-gray-600 mb-2">No results found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Levels Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📈</span>
            Career Levels
            {comparisonMode && (
              <Badge variant="secondary">Comparison View</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data.jobLevels.map((level) => (
                <div
                  key={level.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{trackIcons[level.track]}</span>
                      <span className="font-medium">{highlightText(level.name, searchQuery)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLevelSelect(level.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className={`${trackColors[level.track]} text-xs mb-2`}>
                    {level.track}
                  </Badge>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {highlightText(level.summaryDescription, searchQuery)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Matrix */}
      {data.competencyCategories.map((category) => (
        <Collapsible
          key={category.id}
          open={expandedCategories.has(category.id)}
          onOpenChange={() => toggleCategory(category.id)}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center gap-3">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <span className="text-xl">
                    {category.id === 'craft' ? '🛠️' : 
                     category.id === 'impact' ? '🎯' : '📊'}
                  </span>
                  {highlightText(category.name, searchQuery)}
                  <Badge variant="outline">
                    {category.subCategories.length} competencies
                  </Badge>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {category.subCategories.map((subCategory) => (
                    <div key={subCategory.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h4 className="font-medium text-gray-900">
                          {highlightText(subCategory.name, searchQuery)}
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-25">
                              {data.jobLevels.map((level) => (
                                <th
                                  key={level.id}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-600 border-r last:border-r-0 min-w-64"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{trackIcons[level.track]}</span>
                                    <span>{level.name}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {data.jobLevels.map((level) => (
                                <td
                                  key={level.id}
                                  className="px-4 py-3 text-sm border-r last:border-r-0 align-top min-w-64"
                                >
                                  {subCategory.descriptionsByLevel[level.id] ? (
                                    <div className="space-y-2">
                                      <div className="text-gray-700 leading-relaxed">
                                        {highlightText(
                                          subCategory.descriptionsByLevel[level.id], 
                                          searchQuery
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 italic text-center py-4">
                                      No specific criteria
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}