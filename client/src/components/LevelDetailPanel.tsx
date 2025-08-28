import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X, User, Target, TrendingUp, Users } from 'lucide-react';
import type { JobLevel } from '../../../server/src/schema';

interface LevelDetailPanelProps {
  level: JobLevel | undefined;
  onClose: () => void;
}

const trackInfo = {
  IC: { name: 'Individual Contributor', icon: '🔧', color: 'bg-blue-100 text-blue-800', description: 'Focus on individual technical contributions and expertise' },
  TL: { name: 'Technical Lead', icon: '👨‍💻', color: 'bg-green-100 text-green-800', description: 'Technical leadership with some direct reports' },
  EM: { name: 'Engineering Manager', icon: '👥', color: 'bg-purple-100 text-purple-800', description: 'People management and team coordination' },
  Director: { name: 'Director', icon: '🎯', color: 'bg-orange-100 text-orange-800', description: 'Strategic leadership across multiple teams' }
};

export function LevelDetailPanel({ level, onClose }: LevelDetailPanelProps) {
  if (!level) return null;

  const trackDetails = trackInfo[level.track as keyof typeof trackInfo];

  return (
    <Sheet open={!!level} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{trackDetails?.icon || '📊'}</span>
              <div>
                <SheetTitle className="text-xl">{level.name}</SheetTitle>
                <SheetDescription className="mt-1">
                  Detailed level information and requirements
                </SheetDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Badge className={`${trackDetails?.color || 'bg-gray-100'} w-fit`}>
            {trackDetails?.name || level.track}
          </Badge>
        </SheetHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Role Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {level.summaryDescription}
              </p>
              {trackDetails?.description && (
                <p className="text-sm text-gray-600 mt-3 italic">
                  {trackDetails.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Career Trajectory */}
          {level.trajectoryInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Career Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {level.trajectoryInfo}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scope of Influence */}
          {level.scopeOfInfluenceSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Scope of Influence
                </CardTitle>
                <CardDescription>
                  The breadth and depth of impact expected at this level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {level.scopeOfInfluenceSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ownership */}
          {level.ownershipSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ownership & Accountability
                </CardTitle>
                <CardDescription>
                  Responsibilities and accountability expectations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {level.ownershipSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Level Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Level Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Level ID</h4>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {level.id}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-1">Track</h4>
                    <Badge className={trackDetails?.color || 'bg-gray-100'}>
                      {level.track}
                    </Badge>
                  </div>
                </div>
                
                {/* Navigation Suggestions */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use the comparison view to see how this level differs from others</li>
                    <li>• Check the competency matrix to see specific skill requirements</li>
                    <li>• Review the trajectory information for career planning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}