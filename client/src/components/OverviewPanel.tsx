import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Target, Lightbulb, Calendar } from 'lucide-react';
import type { Metadata } from '../../../server/src/schema';

interface OverviewPanelProps {
  metadata: Metadata;
}

export function OverviewPanel({ metadata }: OverviewPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span>🎯</span>
            Engineering Career Matrix Overview
          </CardTitle>
          <CardDescription>
            A comprehensive framework for understanding engineering career progression and competencies
          </CardDescription>
          <div className="flex items-center gap-2 pt-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Last Updated: {metadata.lastUpdated}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Purpose & Goals
          </CardTitle>
          <CardDescription>
            Why this career matrix exists and what it aims to achieve
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metadata.goals.length > 0 ? (
            <div className="space-y-3">
              {metadata.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No specific goals defined.</p>
          )}
        </CardContent>
      </Card>

      {/* Key Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Key Principles
          </CardTitle>
          <CardDescription>
            Fundamental principles that guide the career matrix framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metadata.keyPrinciples.length > 0 ? (
            <div className="space-y-4">
              {metadata.keyPrinciples.map((principle, index) => (
                <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-800 leading-relaxed flex-1">{principle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No key principles defined.</p>
          )}
        </CardContent>
      </Card>

      {/* How to Use This Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span>
            How to Use This Matrix
          </CardTitle>
          <CardDescription>
            Guidelines for effectively utilizing the career matrix
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* For Engineers */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>👨‍💻</span>
              For Engineers
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Use the matrix to understand expectations at your current level and identify areas for growth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Compare different levels to plan your career progression path</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Focus on competency areas where you want to develop stronger skills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Understand different career tracks (IC, TL, EM, Director) to make informed decisions</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* For Managers */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>👥</span>
              For Managers
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Use during performance reviews to provide specific, actionable feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Set clear expectations and development goals aligned with level requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Support promotion discussions with concrete competency criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Identify skill gaps in your team and plan targeted development initiatives</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* For HR & Recruiting */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📋</span>
              For HR & Recruiting
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Create consistent job descriptions based on level requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Design interview processes that assess relevant competencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Ensure fair and consistent promotion and compensation decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Support organizational planning and headcount decisions</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧</span>
            Matrix Features
          </CardTitle>
          <CardDescription>
            Key capabilities available in this interactive career matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">🔍 Search & Filter</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full-text search across all content</li>
                <li>• Filter by career tracks and levels</li>
                <li>• Filter by competency categories</li>
                <li>• Combine multiple filters</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">📊 Compare & Analyze</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Side-by-side level comparisons</li>
                <li>• Detailed level information panels</li>
                <li>• Career progression insights</li>
                <li>• Skill gap identification</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">📱 User Experience</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Responsive design for all devices</li>
                <li>• Bookmarkable filtered views</li>
                <li>• Collapsible categories</li>
                <li>• Intuitive navigation</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">📈 Track Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Individual Contributor (IC) track</li>
                <li>• Technical Lead (TL) track</li>
                <li>• Engineering Manager (EM) track</li>
                <li>• Director track</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}