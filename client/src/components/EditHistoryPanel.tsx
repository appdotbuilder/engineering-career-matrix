import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Calendar, GitCommit, History } from 'lucide-react';
import type { EditHistoryEntry } from '../../../server/src/schema';

interface EditHistoryPanelProps {
  editHistory: EditHistoryEntry[];
}

export function EditHistoryPanel({ editHistory }: EditHistoryPanelProps) {
  // Sort edit history by date (most recent first)
  const sortedHistory = [...editHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-6 w-6 text-gray-600" />
            Edit History
          </CardTitle>
          <CardDescription>
            Track of all changes and updates made to the engineering career matrix
          </CardDescription>
          {sortedHistory.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="outline">
                {sortedHistory.length} {sortedHistory.length === 1 ? 'update' : 'updates'}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Latest: {formatDate(sortedHistory[0].date)}
                </span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Edit History Timeline */}
      {sortedHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Change Timeline
            </CardTitle>
            <CardDescription>
              Chronological list of all matrix updates and modifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedHistory.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="relative">
                  <div className="flex items-start gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                      }`} />
                      {index < sortedHistory.length - 1 && (
                        <div className="w-px h-12 bg-gray-200 mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                          {formatDate(entry.date)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(entry.date)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <p className="text-gray-800 leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <p className="text-gray-600 mb-2">No edit history available</p>
            <p className="text-gray-500 text-sm">
              Changes and updates to the career matrix will appear here
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {sortedHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              Update Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {sortedHistory.length}
                </div>
                <div className="text-sm text-blue-600">Total Updates</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatDate(sortedHistory[0].date)}
                </div>
                <div className="text-sm text-green-600">Latest Update</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatDate(sortedHistory[sortedHistory.length - 1].date)}
                </div>
                <div className="text-sm text-purple-600">First Version</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(() => {
                    try {
                      const firstDate = new Date(sortedHistory[sortedHistory.length - 1].date);
                      const lastDate = new Date(sortedHistory[0].date);
                      const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays;
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </div>
                <div className="text-sm text-orange-600">Days Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}